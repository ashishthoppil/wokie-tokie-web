import { languageLabels } from "@/common/languages";
import { useEffect, useState } from "react";
import Select from 'react-select';

// Function to handle AWS Polly text-to-speech
const speakText = async (text, voice) => {
  try {

    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      body: JSON.stringify({ text, voice }),
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
    const data = await response.blob();
    const audio = new Audio(URL.createObjectURL(data));
    audio.play();
  } catch (error) {
    console.error('Error fetching speech:', error);
  }
};



export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isError, setIsError] = useState(false);

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
    if (selectedLanguage) {
      setIsRecording(!isRecording);
      setIsError(false);
      if (recognition) {
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
    if (selectedLanguage) {
      setIsRecording(!isRecording);
      setIsError(false);
      if (recognition) {
        recognition.stop();
        const detectedLang = await detectLanguage(speechText);
        setDetectedLanguage(detectedLang);
        
        const translated = await translateText(speechText, selectedLanguage.value);
        setTranslatedText(translated);
        speakText(translated, selectedLanguage.voice);
      }
    } else {
      setIsError(true);
    }
  };

  // Detect Language using AWS Comprehend
  const detectLanguage = async (text) => {
    const response = await fetch("/api/detect-language", {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    return result.languages ? result.languages[0].LanguageCode : 'en';
  };

  useEffect(() => {
    console.log('detectedLanguage', detectedLanguage);
  }, [detectedLanguage]);

  // Translate Text using AWS Translate
  const translateText = async (text, targetLang) => {
    const response = await fetch("/api/translate-text", {
      method: "POST",
      body: JSON.stringify({ text, targetLang }),
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    return result.TranslatedText;
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      color: 'black',
      
    }),
    control: provided => ({
      ...provided,
      backgroundColor: '#00000000',
      borderRadius: '0px',
      borderColor: isError ? 'red' : '#161616',
      color: 'gray'
    }),
    singleValue: provided => ({
      ...provided,
      color: 'gray'
    })
  }

  return (
    <div className="select-none flex flex-col gap-[5rem]" style={{ paddingTop: "45px", backgroundColor: "black", color: "white", height: "100vh" }}>
      <div className="flex flex-col items-center gap-[2rem] h-[190px]">
      <div className="flex justify-center">
        <h1 className="capitalize text-[2rem] font-extrabold text-stone-400">{speechText}</h1>
      </div>
  
      {speechText && translatedText ? <svg class="w-6 h-6 text-stone-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 20V7m0 13-4-4m4 4 4-4m4-12v13m0-13 4 4m-4-4-4 4"/>
      </svg> : <></>}

      <div className="flex justify-center">
        <h1 className="capitalize text-[2rem] font-extrabold text-stone-400">{translatedText}</h1>
      </div>
      </div>
      
      
<div>
      <div className="flex justify-center">
        {selectedLanguage && isRecording ? <div className="absolute top-[325px] animate-ping bg-white h-[70px] w-[70px] rounded-full z-[0]"></div> : <></>}
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

      <div className="flex flex-col items-center justify-center mt-[50px]">
        <Select
          styles={customStyles}
          placeholder='Translate to?'
          className="text-left w-[50%] lg:w-[15%]"
          value={selectedLanguage}
          onChange={(item) => setSelectedLanguage(item)}
          options={languageLabels}
        />
        {selectedLanguage && detectedLanguage ? <h1 className="text-l	font-semibold mt-[25px] duration-500 animate-bounce">Translating from {languageLabels.filter((item) => item.value === detectedLanguage)[0]?.label} to <span className="underline">{selectedLanguage.label}</span>!</h1> : <></>}
      </div>
      </div>
    </div>
  );
}


