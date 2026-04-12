import { useState, useEffect } from "react";

import {
  Code,
  Play,
  RotateCcw,
  CheckCircle,
  Clipboard,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { githubLight } from "@uiw/codemirror-theme-github";

function App() {
  const [aiReady, setAiReady] = useState(false);
  const [inputCode, setInputCode] = useState(
    `function helloWorl() {\n console.log("Hello,world!\n)}`
  );
  const [outputCode, setOutputCode] = useState("");
  const [targetLang, setTargetLang] = useState("python");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };
  useEffect(() => {
    const checkReady = setInterval(() => {
      if (window.puter?.ai?.chat) {
        setAiReady(true);
        clearInterval(checkReady);
      }
    }, 300);
    return () => clearInterval(checkReady);
  }, []);

  const handleConvert = async () => { //converts ths code that users put in and sends to ai for conversion and takes the output and shows response to ui
    if (!inputCode.trim()) {
      setFeedback("❌ Please enter some code to convert")
      return; //if empty then it shows the error
    }
    if (!aiReady) {
      setFeedback("❌ AI is not ready.Please wait a few seconds"); //if ai is not ready then we setfeeback with this message
      return;
    }
    setLoading(true); //if we have input and ai is ready then we got to the loading phase 
    setFeedback(""); //sends feeback and outputcode after conversion ....everything is integrated by ai
    setOutputCode("");

    try { //this is a prompt to ai for ..i.e. ai model ko prompt bhejta hai aur uska response return karta hai
      const res = await window.puter.ai.chat(`
     Convert the following code into ${targetLang}. Only return the converted code, no explanations.

     Code:
    ${inputCode} 
    `);


      const reply =
        typeof res === "string"
          ? res
          : Array.isArray(res?.message)
            ? res.message.map((m) => m.content || m.context).join("\n")
            : res?.message?.content ||
            res?.message?.context ||
            "";
      if (!reply.trim()) throw new Error("Empty response from AI"); //also checks if there is not response to ai......

      setOutputCode(reply.trim()); //when the conversion is successfull then it shows this message 
      setFeedback("✅ Conversion successful!");
    } catch (err) {
      console.error("conversion error:", err);
      setFeedback(`❌ Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setInputCode(`function helloWorld() {\n console.log("Hello,world!\n)}`);
    setOutputCode("");
    setFeedback("");
  };

  const handleCopy = async () => {
    if (outputCode) {
      await navigator.clipboard.writerText(outputCode);
      setFeedback("Code copied to the clipboard!");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-pink-700 to-indigo-800 flex flex-col items-center justify-center p-6 gap-10 relative overflow-hidden">
      <h1 className="text-5xl sm:text-7xl font-extrabold bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent text-center drop-shadow-lg relative">
        AI Code Converter
      </h1>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
        <select value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-slate-900/80 text-white px-4 py-2 rounded-xl border-slate-700 shadow-lg backdrop-blur-md cursor-pointer">
          {["Python", "Java", "C++", "Go", "Rust", "TypeScript"].map((lang) => (
            <option value={lang} key={lang}>
              {lang}
            </option>
          ))}
        </select>
        <button
          onClick={handleConvert}
          disabled={!aiReady || loading}
          className="px-6 py-3 bg-gradient-to-r from-violet-500 to-cyan-500 
       hover:opacity-80 active:scale-95 text-white font-semibold rounded-2xl 
       transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg 
       cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          {
            loading ? "Converting..." : "Convert"
          }
        </button>

        <button
          onClick={handleReset}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500
     hover:opacity-80 active:scale-95 text-white font-semibold rounded-2xl
     transition-all flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl relative z-10">

        <div className="bg-slate-900/80 border-slate-700">
          <div className="bg-slate-800/80 px-4 py-3">
            <code className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-semibold">Input Code</span>
          </div>
          <CodeMirror
            value={inputCode}
            height="420px"
            extensions={[javascript({ jsx: true })]}
            theme={darkMode ? dracula : githubLight}
            onChange={(val) => setInputCode(val)}
          />
        </div>
        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md flex flex-col">
          <div className="bg-slate-800/80 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <checkCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-semibold">
                Converted Code ({targetLang})
              </span>
            </div>
            <button onClick={handleCopy} disabled={!outputCode} className="flex items-center gap-1 text-sm p-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50">
              <clipboard className="w-4 h-4" />
            </button>
          </div>
          <CodeMirror
            value={outputCode}
            height="420px"
            extensions={[javascript({ jsx: true })]}
            theme={darkMode ? dracula : githubLight}
            editable={false}
          />
        </div>
      </div>

      {
        feedback && (
          <p className={`text-center font-semibold drop-shadow-md relative z-10 ${" ✅" || feedback.includes("📝")
            ? "text-emerald-400"
            : "text-rose-400"
            }`}
          >
            {feedback}
          </p>
        )
      }

      {!aiReady && (
        <p className="text-sm text-slate-400 text-center mt-3">
          Initializing AI... please wait ⏳
        </p>
      )}
    </div>

  );
}

export default App;
