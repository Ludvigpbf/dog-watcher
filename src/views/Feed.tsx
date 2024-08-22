import { useEffect, useRef, useState } from "react";
import Cta from "../components/Cta";
import checkIcon from "@assets/check.png";
import io, { Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { Link, useLocation, useNavigate } from "react-router-dom";

type Props = {
  /* feedId: string; role: string  */
};

const Feed: React.FC<Props> = () => {
  const [broadcasterMuted, setBroadcasterMuted] = useState(true);
  const [viewerMuted, setViewerMuted] = useState(true);
  const broadcasterRef = useRef<HTMLVideoElement>(null);
  const viewerRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [messages, setMessages] = useState<string[]>([]);
  const location = useLocation();
  const socket = useRef<Socket | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  const connectionStatus = useSelector(
    (state: RootState) => state.webrtc.connectionStatus
  );

  const { feedId, role } = location.state as { feedId: string; role: string };

  let peerConnection: RTCPeerConnection;

  const handleLeaveFeed = () => {
    // Stop all video tracks
    if (broadcasterRef.current && broadcasterRef.current.srcObject) {
      const stream = broadcasterRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();

      tracks.forEach(function (track: MediaStreamTrack) {
        track.stop();
      });

      // Clear the video source
      broadcasterRef.current.srcObject = null;
    }
    if (socket.current) {
      socket.current.emit("leave_feed", { feedId, role });
      socket.current.disconnect();
      console.log("User left the feed.");
    }
    navigate(-1); // Navigate back after leaving the feed
  };

  function createPeerConnection() {
    const config = {
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302", // Google's public STUN server
        },
      ],
    };

    peerConnection = new RTCPeerConnection(config);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.current?.emit("ice candidate", event.candidate, feedId);
      }
    };

    peerConnection.ontrack = (event) => {
      if (viewerRef.current) {
        viewerRef.current.srcObject = event.streams[0];
      }
    };
  }

  const startBroadcasting = async () => {
    try {
      console.log("1. Broadcaster: Starting to get user media stream...");
      const broadcasterStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      console.log("2. Broadcaster: User media stream obtained.");

      if (broadcasterRef.current) {
        broadcasterRef.current.srcObject = broadcasterStream;
      }
      console.log(
        "3. Broadcaster: Video element source set with user media stream."
      );

      // Ensure peerConnection is initialized here
      if (!peerConnection) {
        createPeerConnection();
        console.log("4. Broadcaster: PeerConnection created for broadcasting.");
      } else {
        console.log("4. Broadcaster: PeerConnection already exists.");
      }

      peerConnection.ontrack = (event) => {
        console.log("Received track from viewer.");
        if (viewerRef.current) {
          // Assuming viewerRef is a reference to the viewer's video element
          viewerRef.current.srcObject = event.streams[0];
          console.log("Broadcaster: Displaying viewer's video and audio.");
        }
      };

      peerConnection.addTransceiver("video", { direction: "sendrecv" });
      peerConnection.addTransceiver("audio", { direction: "sendrecv" });

      broadcasterStream.getTracks().forEach((track) => {
        peerConnection?.addTrack(track, broadcasterStream);
        console.log("5. Broadcaster: Track added to PeerConnection.");
      });

      console.log("6. Broadcaster: Creating offer...");
      const offer = await peerConnection.createOffer();
      await peerConnection?.setLocalDescription(offer);
      console.log("7. Broadcaster: Local description set with offer.");
      console.log("8. Broadcaster: Sending offer to server...");
      socket.current?.emit("offer", offer, feedId);
      console.log("9. Broadcaster: Offer sent from broadcaster.");

      socket.current?.on("answer", async (answer) => {
        // Check if peerConnection is in the correct state before setting remote description
        if (peerConnection?.signalingState === "have-local-offer") {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          console.log(
            "14. Broadcaster: Answer received and remote description set."
          );
        }
      });

      // Signal to server to notify viewers to start viewing
      console.log("10. Broadcaster: Signaling server to start broadcasting.");
      socket.current?.emit("start_broadcasting", { feedId });
    } catch (error) {
      console.error("Error starting broadcast:", error);
    }
  };

  const handleViewerReady = async (viewerId: string) => {
    if (peerConnection?.localDescription) {
      socket.current?.emit("offer", {
        offer: peerConnection.localDescription,
        viewerId: viewerId,
        feedId: feedId,
      });
      console.log(viewerId, "is ready to view the broadcast.");
    } else {
      console.error("Local description is not set.");
    }
  };

  const createPeerConnectionCta = () => {
    createPeerConnection();
  };

  const startViewing = async () => {
    console.log("11. Viewer: Signaling server that viewer is ready...");

    if (!peerConnection) {
      createPeerConnection();
      console.log("12. Viewer: PeerConnection created for viewing.");
    } else {
      console.log("12. Viewer: PeerConnection already exists.");
    }
    try {
      const viewerStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (viewerRef.current) {
        viewerRef.current.srcObject = viewerStream;
        console.log("13. Viewer: Viewer stream set.");
      }

      // Add transceivers for video and audio
      peerConnection.addTransceiver("video", { direction: "sendrecv" });
      peerConnection.addTransceiver("audio", { direction: "sendrecv" });
      console.log("Viewer: Transceivers for video and audio added.");

      socket.current?.emit("viewer_ready", feedId);

      let setupCompleted = true;
      console.log(
        "Setup completed, ready to handle offers and ICE candidates."
      );

      socket.current?.on("offer", async (offer) => {
        if (!setupCompleted) {
          console.error("Setup not completed yet. Cannot handle offer.");
          return;
        }
        console.log("14. Viewer: Offer received from broadcaster.", offer);
        try {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          console.log("Remote description set.");

          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          console.log("Answer created and local description set.");

          socket.current?.emit("answer", answer, feedId); // Send answer back to broadcaster
          console.log("Answer sent to broadcaster.");
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      });

      peerConnection.ontrack = (event) => {
        if (broadcasterRef.current) {
          broadcasterRef.current.srcObject = event.streams[0];
        }
        console.log("Track received by viewer.");
      };
      // Handle ICE candidates from server
      socket.current?.on("ice candidate", async (candidate) => {
        console.log(
          "19. Viewer: Received ICE candidate from server.",
          candidate
        );
        try {
          await peerConnection.addIceCandidate(candidate);
          console.log("20. Viewer: ICE candidate added.");
        } catch (error) {
          console.error("Error adding received ice candidate", error);
        }
      });
    } catch (error) {
      console.error("Error starting viewing:", error);
    }
  };

  useEffect(() => {
    const apiUrl =
      import.meta.env.VITE_APP_MODE === "development"
        ? import.meta.env.VITE_APP_API_URL_LOCAL
        : import.meta.env.VITE_APP_API_URL_PRODUCTION;
    /* socket.current = io("https://192.168.10.204:3000"),  */
    socket.current = io(apiUrl, {
      query: {
        feedId,
        role,
      },
    });

    socket.current.emit("join_feed", { feedId, role });

    socket.current?.on("user_joined", (data) => {
      setMessages((prevMessages) => [...prevMessages, data.message]);
    });

    if (role === "broadcaster") {
      startBroadcasting();
      socket.current?.on("viewer_ready", (data) => {
        handleViewerReady(data.viewerId);
      });
    } else if (role === "viewer") {
      startViewing();
    }

    socket.current?.on("ice candidate", async (candidate) => {
      try {
        await peerConnection?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding received ice candidate", error);
      }
    });

    socket.current?.on("receive_message", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `${data.role}: ${data.message}`,
      ]);
    });

    socket.current?.on("user_left", (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `User: ${data.userId} with the role: ${data.role} left the feed.`,
      ]);
    });

    const handleBeforeUnload = () => {
      socket.current?.emit("leave_feed", { feedId, role });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.current?.disconnect();
      clearInterval(timer);
    };
  }, [feedId, role]);

  const sendMessage = () => {
    if (messageInput.trim()) {
      socket.current?.emit("send_message", {
        feedId,
        message: messageInput,
        role: role,
      });
      setMessageInput("");
    }
  };

  const toggleBroadcasterMute = () => {
    if (broadcasterRef.current) {
      broadcasterRef.current.muted = !broadcasterRef.current.muted;
      setBroadcasterMuted(broadcasterRef.current.muted);
    }
  };
  const toggleViewerMute = () => {
    if (viewerRef.current) {
      viewerRef.current.muted = !viewerRef.current.muted;
      setViewerMuted(viewerRef.current.muted);
    }
  };

  return (
    <div className="feed-section">
      <Link to="/" onClick={handleLeaveFeed}>
        Go Back
      </Link>
      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
      {messages.map((msg, index) => (
        <p key={index}>{msg}</p>
      ))}
      <div className="feed-content">
        <div className="feed-header">
          <div
            className={`feed-status ${
              connectionStatus === "connected" ? "live" : "not-live"
            }`}
          ></div>
          <span className="time-span">{currentTime}</span>

          <div className="feed-controls">
            <button className="controls-btn" onClick={toggleBroadcasterMute}>
              {broadcasterMuted ? "Unmute" : "Mute"}
            </button>
          </div>
        </div>
        <video
          className="feed broadcast-stream"
          ref={broadcasterRef}
          autoPlay
          muted
        />
        <button onClick={createPeerConnectionCta}>Start Feed</button>
        <div className="feed-header">
          <div
            className={`feed-status ${
              connectionStatus === "connected" ? "live" : "not-live"
            }`}
          ></div>
          <span className="time-span">{currentTime}</span>w
          <div className="feed-controls">
            <button className="controls-btn" onClick={toggleViewerMute}>
              {viewerMuted ? "Unmute" : "Mute"}
            </button>
          </div>
        </div>
        <video className="feed viewer-stream" ref={viewerRef} autoPlay muted />
      </div>
      <div className="cta-container">
        <Cta
          icon={<img src={checkIcon} alt="Check" className="icon" />}
          onClick={() => {
            console.log("Button clicked");
          }}
        />
      </div>
    </div>
  );
};

export default Feed;
