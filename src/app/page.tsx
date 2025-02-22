"use client";

import { useState } from "react";

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const ChatApp = () => {
  const [input, setInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message to chat history
    setChatHistory((prev) => [
      ...prev,
      { role: "user", content: input, timestamp: new Date() },
    ]);
    setIsGenerating(true);
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: input }] }],
          }),
          signal: controller.signal, // Associate the controller with the fetch
        }
      );

      if (!res.ok) throw new Error("Failed to fetch response");

      const data: GeminiResponse = await res.json();
      const responseText = data.candidates[0].content.parts[0].text;

      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: responseText.trim(),
          timestamp: new Date(),
        },
      ]);
    } catch (error: unknown) {
      if ((error as Error).name === "AbortError") {
        console.log("Request aborted.");
      } else {
        console.error("Error fetching response:", error);
        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "An error occurred.",
            timestamp: new Date(),
          },
        ]);
      }
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
      setInput("");
    }
  };

  const handleAbort = () => {
    if (abortController) {
      abortController.abort(); // Abort the ongoing request
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white transition-colors duration-300 ${
        !isDarkMode && "bg-white text-black"
      }`}
    >
     
        {/* dark and light mode button */}
 {/*      <div>
        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          aria-label={
            isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
        >
          {isDarkMode ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </button>
      </div>
 */}
      
      <header className="w-full max-w-4xl px-4 py-6 relative bg-white dark:bg-gray-900 transition-colors duration-300">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
           AI Chatting bygxs
        </h1>
      </header>
    

      {/* Chat Interface */}
      <main className="w-full max-w-4xl px-4 py-6 flex-grow flex flex-col space-y-4">
        {/* Render Chat History */}
        <div className="flex flex-col space-y-2">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 shadow-md transition-colors duration-300 ${
                msg.role === "user"
                  ? `self-end bg-blue-500 text-white`
                  : `self-start bg-gray-800 text-gray-300 ${
                      !isDarkMode && "bg-gray-200 text-gray-800"
                    }`
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <small className="text-xs opacity-50">
                {msg.timestamp.toLocaleTimeString()}
              </small>
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center space-x-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your prompt here..."
            className="flex-grow p-2 rounded-lg bg-gray-700 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
            disabled={isGenerating || isLoading}
            onKeyDown={(e) => {
              //  if (e.key === "Enter" && !e.shiftKey) {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
            disabled={isGenerating || isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>

          {/* Break Button below the Send Button */}
          {isGenerating && (
            <button
              onClick={handleAbort}
              className="px-3 py-2 rounded-lg bg-red-500 text-white "
              disabled={!abortController}
            >
              Stop
            </button>
          )}
          {/* Break Button on top of text area  */}

          {/*   {isGenerating && (
            <button
              onClick={handleAbort}
              className="absolute right-0 px-3 py-1 rounded-lg bg-gray-500 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-300"
              style={{
                top: "0",
                left: "0",
                zIndex: 10,
                opacity: 0.8,
              }}
              disabled={!abortController}
            >
              Break
            </button>
          )} */}
        </form>

        {/* <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your prompt here..."
            className="flex-grow p-2 rounded-lg bg-gray-700 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
            disabled={isGenerating || isLoading}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
            disabled={isGenerating || isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form> */}

        {/* Break Button red ugly button */}
        {/*  
        {isGenerating && (
          <button
            onClick={handleAbort}
            className="mt-4 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
            disabled={!abortController}
          >
            Break
          </button>
        )} */}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl px-4 py-4 text-sm text-center">
        <p>
          Powered by{" "}
          <a
            href="https://gemini.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-500 transition-colors duration-300"
          >
            Gemini AI
          </a>
        </p>
      </footer>
    </div>
  );
};

export default ChatApp;
