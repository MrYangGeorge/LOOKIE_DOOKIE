import { useEffect, useRef, useState } from "react";

export default function VideoStream() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  const streamUrl = `http://localhost:4912/embed`;

  useEffect(() => {
    const interval = setInterval(() => {
      if (iframeRef.current && !loaded) {
        iframeRef.current.src = streamUrl;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loaded]);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
      <h2 className="text-lg font-bold mb-3">Live Camera</h2>

      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border-2 border-red-500">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            Searching Webcam...
          </div>
        )}

        <iframe
          ref={iframeRef}
          title="Video stream"
          onLoad={() => setLoaded(true)}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}