"use client";

import { useState, useEffect } from "react";

const ChatApp = () => {
  const [input, setInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [controller, setController] = useState<AbortController | null>(null);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message to chat history
    setChatHistory((prev) => [...prev, { role: "user", content: input }]);
    setIsGenerating(true);

    const abortCtrl = new AbortController();
    setController(abortCtrl);

    try {
      const res = await fetch("/api/endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, model: "qwen:7b" }),
        signal: abortCtrl.signal,
      });

      if (!res.ok) throw new Error("Failed to fetch response");

      const reader = res.body?.getReader();
      let done = false;
      let fullResponse = "";

      while (!done) {
        const result = await reader?.read();
        if (!result) break;
        const { value, done: streamDone } = result;

        if (value && !abortCtrl.signal.aborted) {
          const chunk = new TextDecoder().decode(value);

          try {
            const data = JSON.parse(chunk);
            if (!data.done) {
              fullResponse += data.response; // Accumulate chunks
            } else {
              done = true;
            }
          } catch {
            fullResponse += chunk; // Handle partial JSON
          }
        } else {
          done = true;
        }
      }

      // Append the complete response to chat history after streaming ends
      if (!abortCtrl.signal.aborted) {
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: fullResponse.trim() }, // Trim to remove extra spaces
        ]);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Error fetching response:", error);
        setChatHistory((prev) => [
          ...prev,
          { role: "assistant", content: "An error occurred." },
        ]);
      }
    } finally {
      setIsGenerating(false);
      setInput("");
      setController(null);
    }
  };

  const handleStop = () => {
    if (controller) {
      controller.abort();
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "[Generation stopped]" },
      ]);
      setIsGenerating(false);
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
        <h1 className="text-2xl font-bold">Qwen Chat</h1>
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
              if (e.key === "Enter" && !e.shiftKey) {
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
          {isGenerating && (
            <button
              onClick={handleStop}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300"
            >
              Stop
            </button>
          )}
        </form>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl px-4 py-4 text-sm text-center">
        <p>
          Powered by{" "}
          <a
            href="https://ollama.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-500 transition-colors duration-300"
          >
            Ollama
          </a>{" "}
          and{" "}
          <a
            href="https://github.com/Qwen"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-500 transition-colors duration-300"
          >
            Qwen
          </a>
        </p>
      </footer>
    </div>
  );
};

export default ChatApp;
