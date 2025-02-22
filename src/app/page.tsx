// src/app/page.tsx
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
    } catch (error) {
      console.error("Error fetching response:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "An error occurred.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white transition-colors duration-300 ${
        !isDarkMode && "bg-white text-black"
      }`}
    >
      {/* Header */}
      <header className="w-full max-w-4xl px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gemini Chat</h1>
        <button
          onClick={toggleTheme}
          className="text-sm font-medium hover:underline"
        >
          {isDarkMode ? "Light Mode" : "Dark Mode"}
        </button>
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
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
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
        </form>
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
