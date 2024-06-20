import { useEffect, useRef, useState } from "react";

type Props = {};

const Feed: React.FC<Props> = () => {
  const [muted, setMuted] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState(true);
  const feedRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );
  let ws: WebSocket | null = null;

  const toggleMute = () => {
    if (feedRef.current) {
      feedRef.current.muted = !feedRef.current.muted;
      setMuted(feedRef.current.muted);
    }
  };

  const closeFeed = () => {
    if (feedRef.current && feedRef.current.srcObject instanceof MediaStream) {
      feedRef.current.srcObject
        .getTracks()
        .forEach((track: MediaStreamTrack) => track.stop());
      setVideoAvailable(false);
    }
  };

  const startVideo = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (feedRef.current) {
          feedRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices.", error);
        setVideoAvailable(false);
      }
    } else {
      console.error("Media devices API not available");
      setVideoAvailable(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Create WebSocket connection.
    ws = new WebSocket("ws://localhost:8080");

    // Connection opened
    ws.addEventListener("open", () => {
      if (ws) {
        ws.send("Hello Server!");
      }
    });

    // Listen for messages
    ws.addEventListener("message", (event) => {
      console.log("Message from server: ", event.data);
    });

    startVideo();

    // Cleanup function to close WebSocket connection when component unmounts
    return () => {
      clearInterval(timer);
      if (ws) {
        ws.close();
      }
    };
  }, []);
  return (
    <>
      <div className="feed-header">
        <div
          className={`feed-status ${videoAvailable ? "live" : "not-live"}`}
        ></div>
        <span className="time-span">{currentTime}</span>
        <div className="feed-controls">
          <button className="controls-btn" onClick={toggleMute}>
            {muted ? "Unmute" : "Mute"}
          </button>
          <button className="controls-btn" onClick={closeFeed}>
            Stop
          </button>
        </div>
      </div>
      <div className="feed-content">
        {videoAvailable ? (
          <video className="feed" ref={feedRef} autoPlay />
        ) : (
          <div className="no-video">
            <h3>Allow your camera and microphone</h3>
            <button onClick={startVideo}>Start</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Feed;
