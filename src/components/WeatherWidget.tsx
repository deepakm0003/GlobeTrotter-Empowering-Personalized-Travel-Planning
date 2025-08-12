import React, { useState } from "react";

type Props = {
  apiBase?: string;        // e.g. "http://localhost:5174"
  defaultQuery?: string;   // e.g. "weather in Delhi"
  title?: string;
  height?: number;         // chat area height
};

const WeatherWidget: React.FC<Props> = ({
  apiBase = "",
  defaultQuery = "",
  title = "Weather",
  height = 160
}) => {
  const [messages, setMessages] = useState<string[]>([
    "Ask: weather in Tokyo / forecast in Delhi tomorrow"
  ]);
  const [input, setInput] = useState(defaultQuery);

  async function send() {
    const text = (input || "").trim();
    if (!text) return;
    setMessages(m => [...m, `You: ${text}`]);
    setInput("");

    try {
      const res = await fetch(`${apiBase}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });
      const raw = await res.text();
      let data: any;
      try { data = JSON.parse(raw); } catch { data = { reply: raw }; }
      const reply = res.ok ? (data.reply || "No reply") : (data.reply || raw);
      setMessages(m => [...m, `Bot: ${reply}`]);
    } catch (e: any) {
      setMessages(m => [...m, `Bot: Network error: ${e?.message || e}`]);
    }
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>

      <div
        style={{ height }}
        className="overflow-auto border border-slate-700/50 rounded-lg p-2 bg-slate-900/30 text-[13px]"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-md px-2 py-1 my-1 ${
              m.startsWith("You:")
                ? "bg-blue-500/20 text-blue-100 text-right"
                : "bg-slate-700/40 text-slate-200"
            }`}
          >
            {m}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. weather in Paris"
          className="flex-1 px-3 py-2 rounded-lg border border-slate-700/60 bg-slate-900/50 text-slate-200 placeholder-slate-500 outline-none focus:border-slate-500"
        />
        <button
          onClick={send}
          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm"
        >
          Go
        </button>
      </div>
    </div>
  );
};

export default WeatherWidget;