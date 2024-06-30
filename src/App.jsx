import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";

function App() {
  const [capturing, setCapturing] = useState(false);
  const [imgUrl, setImgUrl] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [recordedChunks, setRecordedChunks] = useState([]);

  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  const handleDownloadVideo = useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const handleDownloadPhoto = useCallback(() => {
    if (imgUrl) {
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = imgUrl;
      a.download = "react-webcam-stream-capture";
      a.click();
      window.URL.revokeObjectURL(url);
      setImgUrl(null);
    }
  }, [imgUrl]);

  return (
    <div className="max-w-xl flex flex-col m-auto">
      <div>
        <Webcam
          audio={false}
          height={360}
          width={720}
          screenshotFormat="image/png"
          ref={webcamRef}
          videoConstraints={{
            height: 1080,
            width: 1920,
            facingMode: facingMode,
          }}
        />
        <div className="flex gap-5 my-5">
          <button
            className="bg-blue-500 p-3 rounded-md"
            onClick={() => {
              const imgsrc = webcamRef.current.getScreenshot();
              setImgUrl(imgsrc);
            }}
          >
            Take a Picture
          </button>

          {capturing ? (
            <button
              className="bg-red-500 p-3 rounded-md"
              onClick={handleStopCaptureClick}
            >
              cortar video
            </button>
          ) : (
            <button
              className="bg-green-500 p-3 rounded-md"
              onClick={handleStartCaptureClick}
            >
              iniciar video
            </button>
          )}

          <button
            className="bg-blue-500 p-3 rounded-md"
            onClick={() => {
              setFacingMode(facingMode === "user" ? "environment" : "user");
            }}
          >
            Girar camara
          </button>
        </div>
      </div>

      {imgUrl && (
        <div className="my-5">
          <h1 className="text-2xl my-3 font-semibold">Su foto:</h1>
          {imgUrl && <img src={imgUrl} />}

          {imgUrl && (
            <div className="flex my-5 gap-3">
              <button
                className="bg-blue-500 p-3 rounded-md"
                onClick={handleDownloadPhoto}
              >
                Download
              </button>
              <button
                className="bg-blue-500 p-3 rounded-md"
                onClick={() => {
                  setImgUrl(null);
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {recordedChunks.length > 0 && (
        <div className="">
          <h1 className="text-2xl my-3 font-semibold">Su video:</h1>
          {recordedChunks.length > 0 && (
            <video
              controls
              style={{
                marginTop: 20,
                width: 720,
                height: 360,
              }}
            >
              <source
                src={URL.createObjectURL(
                  new Blob(recordedChunks, { type: "video/webm" })
                )}
                type="video/webm"
              />
            </video>
          )}

          {recordedChunks.length > 0 && (
            <div className="flex gap-3 my-5">
              <button
                className="bg-blue-500 p-3 rounded-md"
                onClick={handleDownloadVideo}
              >
                Download
              </button>
              <button
                className="bg-blue-500 p-3 rounded-md"
                onClick={() => {
                  setRecordedChunks([]);
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
