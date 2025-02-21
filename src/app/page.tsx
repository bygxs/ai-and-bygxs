// src/app/page.tsx
"use client";

import { useState } from "react";

const ChatApp = () => {
  const [input, setInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message to chat history
    setChatHistory((prev) => [...prev, { role: "user", content: input }]);
    setIsGenerating(true);

    try {
      const res = await fetch("https://api.gemini.ai/endpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const data = await res.json();

      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: data.response.trim() },
      ]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "An error occurred." },
      ]);
    } finally {
      setIsGenerating(false);
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
            disabled={isGenerating}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
            disabled={isGenerating}
          >
            Send
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
