import axios from "axios";
import { AudioInterface } from "@interfaces/AudioInterface";

export const uploadAudios = async (audios: AudioInterface[]) => {
  try {
    const formData = new FormData();
    audios.forEach((audio, index) => {
      if (audio.blob) {
        formData.append(`files`, audio.blob, audio.title || "untitled.mp3");
        formData.append(`title${index}`, audio.title);
        formData.append(`duration${index}`, audio.duration.toString());
        formData.append(`id${index}`, audio.id);
        formData.append(`path${index}`, audio.path);
        formData.append(`audio${index}`, audio.audio);
        formData.append(`ext${index}`, audio.ext);
        formData.append(`size${index}`, audio.size.toString());
        formData.append(`sizeStr${index}`, audio.sizeStr);
      }
    });
    console.log(formData);

    const response = await axios.post<AudioInterface[]>(
      `${import.meta.env.VITE_APP_API_URL_LOCAL}/audio/uploadMultiple`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Audio upload failed:", error);
    throw error;
  }
};
