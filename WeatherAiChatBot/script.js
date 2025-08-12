// script.js — adds voice (STT) + voice replies (TTS) to your existing chatbot
const API_BASE = "http://localhost:3000";

// ---------- UI hooks ----------
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const micBtn = document.getElementById("mic-btn");
const micStatus = document.getElementById("mic-status");
const sttLang = document.getElementById("stt-lang");
const ttsToggle = document.getElementById("tts-toggle");
const chatBox = document.getElementById("chat-box");

sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (e)=>{ if(e.key==="Enter") sendMessage(); });
micBtn.addEventListener("click", startListening);

// ---------- Core chat ----------
async function sendMessage(textFromVoice) {
  const userText = (textFromVoice ?? inputEl.value).trim();
  if (!userText) return;
  displayMessage("You", userText);
  inputEl.value = "";

  try {
    const response = await fetch(API_BASE + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userText })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Chat request failed");
    const botText = data.text || "[no reply]";
    displayMessage("Bot", botText);
    maybeSpeak(botText);
  } catch (err) {
    console.error("Chat error:", err);
    displayMessage("Bot", "⚠️ " + (err.message || "Something went wrong."));
    maybeSpeak("Sorry, something went wrong.");
  }
}

function displayMessage(sender, message) {
  const msg = document.createElement("p");
  msg.innerHTML = `<strong>${sender}:</strong> ${escapeHtml(message)}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, (m)=>({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]));
}

// ---------- TTS (voice replies) ----------
function maybeSpeak(text) {
  if (!ttsToggle.checked) return;
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  const lang = sttLang.value.startsWith("hi") ? "hi-IN" : "en-IN";
  u.lang = lang;
  u.rate = 1.0;
  window.speechSynthesis.speak(u);
}

// ---------- STT (voice input) ----------
function startListening() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert("Voice input not supported in this browser. Try Chrome on desktop.");
    return;
  }
  const rec = new SR();
  rec.lang = sttLang.value;    // e.g., "en-IN"
  rec.interimResults = false;
  rec.maxAlternatives = 1;

  rec.onstart = () => { micStatus.textContent = "Listening…"; micBtn.disabled = true; };
  rec.onerror = (e) => { console.error(e); micStatus.textContent = "Mic error"; micBtn.disabled = false; };
  rec.onend = () => { micStatus.textContent = ""; micBtn.disabled = false; };
  rec.onresult = (e) => {
    const heard = e.results[0][0].transcript.trim();
    inputEl.value = ""; // ensure we don't send twice
    displayMessage("🎙️ You", heard);
    sendMessage(heard); // send directly
  };
  rec.start();
}
