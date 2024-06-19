import { useEffect, useRef } from "react";

type Props = {};

const Feed: React.FC<Props> = () => {
  const feedRef = useRef<HTMLVideoElement>(null);
  let ws: WebSocket | null = null;

  const startVideo = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (feedRef.current) {
        feedRef.current.srcObject = stream;
      }
    } else {
      console.error("Media devices API not available");
    }
  };

  useEffect(() => {
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
      if (ws) {
        ws.close();
      }
    };
  }, []);
  return (
    <div className="feed-container">
      <video className="feed" ref={feedRef} autoPlay />
    </div>
  );
};

export default Feed;
