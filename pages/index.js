import { languageLabels } from "@/common/languages";
import { useEffect, useState, useRef } from "react";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';

// Function to handle AWS Polly text-to-speech
const speakText = async (text, voice) => {
  try {
    // Fetch audio data from the backend
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      body: JSON.stringify({ text, voice }),
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });

    if (!response.ok) {
      console.log(response);
      throw new Error('Failed to fetch audio');
    }

    // Convert response to a Blob
    const data = await response.blob();

    // Create an Audio instance and play
    const audio = new Audio();
    audio.src = URL.createObjectURL(data);

    // Add event listener to clean up the Blob URL after playback
    audio.onended = () => URL.revokeObjectURL(audio.src);

    // Play the audio
    await audio.play();
  } catch (error) {
    console.error('Error fetching or playing speech:', error);
  }
};



export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedFromLanguage, setSelectedFromLanguage] = useState({ key: 1, value: 'en', label: 'English', voice: 'Joanna' });
  const [selectedToLanguage, setSelectedToLanguage] = useState({ key: 10, value: 'fr', label: 'French', voice: 'Celine' });
  const [isError, setIsError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const speakBtn = useRef();

  let recognition;

  // Initialize Speech Recognition (Web Speech API)
  if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
    recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
  }

  // Start Speech Recognition on hold
  const startRecognition = () => {
    if (selectedFromLanguage && selectedToLanguage) {
      setIsRecording(!isRecording);
      setIsError(false);
      if (recognition) {
        recognition.lang = selectedFromLanguage.value;
        recognition.start();
        recognition.onresult = (event) => {
          const transcript = event.results[event.resultIndex][0].transcript;
          setSpeechText(transcript);
        };
      }
    } else {
      setIsError(true);
    }
  };

  // Stop Speech Recognition and Process
  const stopRecognition = async () => {
    if (selectedFromLanguage && selectedToLanguage) {
      setIsRecording(!isRecording);
      setIsError(false);
      if (recognition) {
        recognition.stop();
        
        const translated = await translateText(speechText, selectedToLanguage.value, selectedFromLanguage.value);

        setTranslatedText(translated);
      }
    } else {
      setIsError(true);
    }
  };

  // Translate Text using AWS Translate
  const translateText = async (text, targetLang, sourceLang) => {
    const response = await fetch("/api/translate-text", {
      method: "POST",
      body: JSON.stringify({ text, targetLang, sourceLang }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    return result.translatedText;
  };


  return (
    <div className="select-none flex flex-col gap-[5rem] justify-between py-[50px] px-[10px]" style={{ paddingTop: "45px", backgroundColor: "black", color: "white", height: "100vh" }}>
            
      <div className="flex flex-col items-center gap-[2rem] h-[190px]">
        <div className="flex justify-center">
          <h1 className="capitalize text-[2rem] font-extrabold text-stone-400 text-center">{speechText}</h1>
        </div>
  
        {speechText && translatedText ? <svg class="w-6 h-6 text-stone-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 20V7m0 13-4-4m4 4 4-4m4-12v13m0-13 4 4m-4-4-4 4"/>
        </svg> : <></>}

        <div className="flex justify-center">
          <h1 ref={speakBtn} onClick={() => speakText(translatedText, selectedToLanguage.voice)} className="capitalize text-[2rem] font-extrabold text-stone-400 text-center">{translatedText}</h1>
        </div>
      </div>
      <div className="flex flex-col gap-[5rem] mb-[5rem]">
      <div className="text-gray-300">
          <div className="flex gap-5 items-center justify-between px-5">
          <Popup 
                trigger={
                  <div onClick={() => setIsOpen(true)} className="w-[40%] text-center bg-gray-900 hover:bg-gray-800 p-2 rounded-lg">
                    {selectedFromLanguage.label}
                  </div>}
                arrowStyle={{ color: '#111827', borderBlockColor: '#ffffff' }}
                contentStyle={{ backgroundColor: '#111827', padding: '10px 5px', height: '15rem', overflow: "scroll" }}
                position="right center">
                {languageLabels.map((language) => {
                  return <div className="py-[5px] hover:bg-gray-700" onClick={() => {
                    setSelectedFromLanguage(language);
                  }}>{language.label}</div>
                })}
            </Popup>
            <svg class="w-6 h-6 text-gray-300 w-[20%]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4"/>
            </svg>

            <Popup 
                trigger={
                  <div className="w-[40%] text-center bg-gray-900 hover:bg-gray-800 p-2 rounded-lg">
                {selectedToLanguage.label}
            </div>}
                arrowStyle={{ color: '#111827', borderBlockColor: '#ffffff' }}
                contentStyle={{ backgroundColor: '#111827', padding: '10px 5px', height: '15rem', overflow: "scroll" }}
                position="left center">
                {languageLabels.map((language) => {
                  return <div className="py-[5px] hover:bg-gray-700" onClick={() => {
                    setSelectedToLanguage(language);
                  }}>{language.label}</div>
                })}
            </Popup>

            
          </div>
        </div>

      <div className="">
        <div className="flex justify-center">
          {selectedToLanguage && isRecording ? <div className="absolute bottom-[138px] animate-ping bg-white h-[70px] w-[70px] rounded-full z-[0]"></div> : <></>}
          <button
            className={`bg-sky-700 text-gray-600 hover:bg-sky-900 hover:text-gray-800 z-[1]`}
            style={{ fontSize: "50px", borderRadius: "50%", padding: "20px" }}
            onClick={() => {
              if (isRecording) {
                stopRecognition();
              } else {
                startRecognition();
              }
            }}
          >
            {isRecording ? 
            <svg class="w-[48px] h-[48px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Z"/>
            </svg>
          : <svg class="w-[48px] h-[48px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="0.7" d="M19 9v3a5.006 5.006 0 0 1-5 5h-4a5.006 5.006 0 0 1-5-5V9m7 9v3m-3 0h6M11 3h2a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3Z"/>
            </svg>}
          </button>
        </div>
      </div> 
      </div>

    </div>
  );
}


