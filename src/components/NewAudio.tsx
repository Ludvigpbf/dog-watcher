import { useState, useRef } from "react";
import { AudioInterface } from "@interfaces/AudioInterface";
import { uploadAudios } from "@api/audio";

type Props = {};

const NewAudio: React.FC<Props> = () => {
  const [recordedAudio, setRecordedAudio] = useState<AudioInterface[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<AudioInterface[]>([]);
  const [userMediaAllowed, setUserMediaAllowed] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const generateId = (): string => {
    return Date.now().toString();
  };

  const isAudioFile = (file: File | AudioInterface): boolean => {
    return (
      "blob" in file || (file instanceof File && file.type.startsWith("audio/"))
    );
  };

  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      mediaRecorderRef.current = new MediaRecorder(stream);
      setUserMediaAllowed(true);
    } catch (error) {
      console.error("Error accessing the microphone:", error);
      // Handle the error appropriately in your UI
    }
  };

  const calculateDuration = async (audioBlob: Blob): Promise<number> => {
    const audioContext = new (window.AudioContext ||
      (window as any).window.webkitAudioContext)();
    const data = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(data);
    return audioBuffer.duration;
  };

  const startRecording = () => {
    if (!mediaRecorderRef.current) return;

    audioChunksRef.current = [];
    mediaRecorderRef.current.start();
    setIsRecording(true);

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
      const duration = await calculateDuration(audioBlob);
      setRecordedAudio((prevRecordings) => [
        ...prevRecordings,
        {
          blob: audioBlob,
          duration,
          id: generateId(),
          title: "Untitled",
          path: "",
          ext: "",
          size: 0,
          sizeStr: "",
          audio: "",
        },
      ]);
      setIsRecording(false);
    };
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const updateRecordingTitle = (id: string, newTitle: string) => {
    setRecordedAudio((prevRecordings: AudioInterface[]) =>
      prevRecordings.map((recording) =>
        recording.id === id ? { ...recording, title: newTitle } : recording
      )
    );
  };

  const removeRecording = (id: string) => {
    setRecordedAudio(recordedAudio.filter((recording) => recording.id !== id));
  };

  const removeFile = (id: string) => {
    setSelectedFiles(selectedFiles.filter((file) => file.id !== id));
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files
      ? await Promise.all(
          Array.from(event.target.files).map(async (file) => {
            const duration = await calculateDuration(file);
            const sizeStr = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
            const ext = file.name.split(".").pop() || "";
            const url = URL.createObjectURL(file);

            return {
              id: generateId(),
              title: file.name,
              duration: duration,
              ext: ext,
              size: file.size,
              sizeStr: sizeStr,
              path: `uploads/${file.name}`,
              blob: file,
              audio: url,
            } as AudioInterface;
          })
        )
      : [];
    setSelectedFiles(files);
  };

  const handleRecordingChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      return;
    }

    const duration = await calculateDuration(file);
    const sizeStr = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    const ext = file.name.split(".").pop() || "";
    const url = URL.createObjectURL(file);
    const newRecording: AudioInterface = {
      id: generateId(),
      title: file.name,
      duration: duration,
      ext: ext,
      size: file.size,
      sizeStr: sizeStr,
      path: `uploads/${file.name}`,
      blob: file,
      audio: url,
    };

    setRecordedAudio([...recordedAudio, newRecording]);
  };

  const saveAudio = async () => {
    try {
      const recordedFiles: AudioInterface[] = await Promise.all(
        recordedAudio.map(async (recording) => {
          if (recording.blob) {
            const file = new File(
              [recording.blob],
              recording.title || "defaultTitle",
              {
                type: "audio/mp3",
              }
            );
            const duration = await calculateDuration(file);
            const sizeStr = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
            const ext = file.name.split(".").pop() || "";

            return {
              ...recording,
              blob: recording.blob,
              duration: duration,
              sizeStr: sizeStr,
              ext: ext,
              path: URL.createObjectURL(file),
              audio: URL.createObjectURL(file),
            } as AudioInterface;
          }
          return null;
        })
      ).then((results) =>
        results.filter((file): file is AudioInterface => file !== null)
      );

      const allFiles: AudioInterface[] = [...recordedFiles, ...selectedFiles];

      const audioFiles = allFiles.filter(isAudioFile);
      console.log("audio files: ", audioFiles);

      const uploadedItems = await uploadAudios(audioFiles);
      console.log("Uploaded items:", uploadedItems);

      // Optionally, clear the recordedAudio array after saving
      setRecordedAudio([]);
      setSelectedFiles([]);
    } catch (error) {
      console.error("Failed to save recordings:", error);
    }
  };

  const updateFileName = (id: string, newName: string) => {
    const sanitizedNewName = newName.replace(/\s+/g, "-");
    const updatedFiles = selectedFiles.map((file) =>
      file.id === id ? { ...file, title: sanitizedNewName } : file
    );
    setSelectedFiles(updatedFiles);
  };

  console.log(recordedAudio);
  console.log(selectedFiles);

  return (
    <div className="record-container">
      {!userMediaAllowed ? (
        <button onClick={getUserMedia}>Tillåt mikrofonen</button>
      ) : (
        <>
          {!isRecording ? (
            <button onClick={startRecording}>Starta inspelning</button>
          ) : (
            <button onClick={stopRecording}>Stoppa inspelning</button>
          )}
        </>
      )}
      eller ladda upp en ljudfil
      <input
        type="file"
        id="audioInput"
        accept="audio/*"
        multiple
        onChange={handleFileChange}
      />
      <div className="files-list">
        {selectedFiles.map((file) => (
          <div key={file.id} className="file-item">
            <span>{file.title}</span>
            <input
              type="text"
              value={file.title}
              onChange={(e) => updateFileName(file.id, e.target.value)}
            />
            <button onClick={() => removeFile(file.id)}>Radera</button>
          </div>
        ))}
      </div>
      <div className="recordings-list">
        <h2>Inspelningar</h2>
        {recordedAudio.length > 0 ? (
          <ul>
            {recordedAudio.map((recording, index) => (
              <li key={index}>
                <audio
                  controls
                  src={URL.createObjectURL(recording.blob || new Blob())}
                ></audio>
                <span>{recording.duration.toFixed(2)}s</span>
                <div>
                  <input
                    type="text"
                    value={recording.title}
                    onChange={(e) =>
                      updateRecordingTitle(recording.id, e.target.value)
                    }
                    placeholder="Enter title"
                  />
                  <button onClick={() => removeRecording(recording.id)}>
                    Radera
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Det finns inga inspelningar än</p>
        )}
        {(selectedFiles.length > 0 || recordedAudio.length > 0) && (
          <button onClick={saveAudio}>Spara</button>
        )}
      </div>
    </div>
  );
};

export default NewAudio;
