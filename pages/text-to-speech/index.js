import { useState } from "react";

const TextToSpeech = () => {
  const [text, setText] = useState("");

  const handleConvertTextToSpeech = async () => {
    try {
      const response = await fetch("/api/polly", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Failed to convert text to speech");

      // Play audio stream
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text here"
      />
      <button onClick={handleConvertTextToSpeech}>Convert to Speech</button>
    </div>
  );
};

export default TextToSpeech;
