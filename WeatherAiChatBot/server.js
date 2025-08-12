// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// ESM-safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Polyfill fetch for Node <18
let _fetch = globalThis.fetch;
if (typeof _fetch === "undefined") {
  const { default: nodeFetch } = await import("node-fetch");
  _fetch = nodeFetch;
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5174;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const DEFAULT_COUNTRY = (process.env.DEFAULT_COUNTRY || "").trim(); // e.g., "India"

// ---------- Utils ----------
const aliasMap = new Map([
  ["banglore", "bengaluru"], // common misspelling
  ["bangalore", "bengaluru"],
  ["bombay", "mumbai"],
  ["gurgaon", "gurugram"],
  ["calcutta", "kolkata"],
  ["banaras", "varanasi"],
  ["trivandrum", "thiruvananthapuram"],
]);

function normalize(s) {
  return (s || "").toLowerCase().trim();
}

// Parse intent: weather + city + (today/tomorrow)
function parseWeatherQuery(text) {
  if (!text) return null;
  const hasWeather = /(weather|temp|temperature|forecast|climate)/i.test(text);
  if (!hasWeather) return null;
  // capture words after in/at/for till punctuation/end
  const m = text.match(/\b(?:in|at|for)\s+([a-zA-Z\s,'-]+?)(?:\?|\.|$)/i);
  let city = m ? m[1].trim() : null;

  const day = /\btomorrow\b/i.test(text) ? "tomorrow" : "today";

  if (city) {
    const low = normalize(city);
    if (aliasMap.has(low)) city = aliasMap.get(low);
  }
  return { city, day };
}

// ---------- WeatherAPI helpers ----------
async function weatherSearch(query) {
  const url = `https://api.weatherapi.com/v1/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`;
  const res = await _fetch(url);
  const txt = await res.text();
  if (!res.ok) throw new Error(`WeatherAPI search ${res.status}: ${txt}`);
  return JSON.parse(txt); // array
}

function chooseBestLocation(results, rawQuery, preferredCountry) {
  if (!Array.isArray(results) || results.length === 0) return null;
  const q = normalize(rawQuery);

  // If the user typed a country in the query (e.g., "Delhi, India"), bias to that
  let explicitCountry = null;
  const countryMatch = rawQuery.match(/,\s*([a-zA-Z\s]+)$/); // after last comma
  if (countryMatch) explicitCountry = normalize(countryMatch[1]);

  // Scoring: prefer exact/startsWith match on name, then preferred country
  let best = null;
  let bestScore = -1;

  for (const r of results) {
    const name = normalize(r.name);
    const region = normalize(r.region);
    const country = normalize(r.country);

    let score = 0;
    if (q && name === q) score += 6;                 // exact city match
    if (q && name.startsWith(q)) score += 3;         // starts-with
    if (explicitCountry && country === explicitCountry) score += 5; // user-specified country
    if (!explicitCountry && preferredCountry && country === normalize(preferredCountry)) score += 4;
    if (q && region.startsWith(q)) score += 1;

    if (score > bestScore) {
      bestScore = score;
      best = r;
    }
  }

  // Fallback: if nothing scored, pick the first
  return best || results[0];
}

async function resolveLocation(rawCity) {
  if (!rawCity) return null;

  // First try original
  let results = await weatherSearch(rawCity);
  if (!results?.length) {
    // Try alias if we didn't already alias
    const low = normalize(rawCity);
    if (aliasMap.has(low)) {
      results = await weatherSearch(aliasMap.get(low));
    }
  }
  const best = chooseBestLocation(results, rawCity, DEFAULT_COUNTRY);
  if (!best) return null;

  // Return a stable query (lat,lon) plus a clean display name
  return {
    q: `${best.lat},${best.lon}`,
    label: `${best.name}${best.region ? ", " + best.region : ""}, ${best.country}`
  };
}

async function fetchCurrent(q) {
  const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(q)}&aqi=no`;
  const res = await _fetch(url);
  const txt = await res.text();
  if (!res.ok) throw new Error(`WeatherAPI ${res.status}: ${txt}`);
  return JSON.parse(txt);
}

async function fetchForecast2Days(q) {
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(q)}&days=2&aqi=no&alerts=no`;
  const res = await _fetch(url);
  const txt = await res.text();
  if (!res.ok) throw new Error(`WeatherAPI ${res.status}: ${txt}`);
  return JSON.parse(txt);
}

// ---------- Chat endpoint ----------
app.post("/chat", async (req, res) => {
  try {
    const userText = (req.body?.message || "").trim();
    if (!userText) return res.status(400).json({ reply: "Say: what's the weather in Tokyo?" });

    if (!WEATHER_API_KEY) {
      return res.status(500).json({ reply: "Server missing WEATHER_API_KEY in .env. Add it and restart." });
    }

    const intent = parseWeatherQuery(userText);

    if (intent?.city) {
      const location = await resolveLocation(intent.city);
      if (!location) {
        return res.json({
          reply: `I couldn't find “${intent.city}”. Try adding the country (e.g., “${intent.city}, India”).`
        });
      }

      if (intent.day === "today") {
        const data = await fetchCurrent(location.q);
        const c = data.current, loc = data.location;
        const reply =
          `Weather in ${location.label} (now): ` +
          `${c.temp_c}°C (${c.temp_f}°F), ${c.condition.text}. ` +
          `Feels like ${c.feelslike_c}°C. Humidity ${c.humidity}%, wind ${c.wind_kph} kph.`;
        return res.json({ reply });
      } else {
        const data = await fetchForecast2Days(location.q);
        const dayObj = data.forecast?.forecastday?.[1] ?? data.forecast?.forecastday?.[0];
        const d = dayObj?.day;
        if (!d) throw new Error("No forecast data available.");
        const rain = d.daily_chance_of_rain ?? "—";
        const reply =
          `Forecast in ${location.label} (${intent.day}): ` +
          `Avg ${d.avgtemp_c}°C, High ${d.maxtemp_c}°C, Low ${d.mintemp_c}°C, ` +
          `${d.condition.text}. Chance of rain ${rain}%.`;
        return res.json({ reply });
      }
    }

    // Non-weather queries
    return res.json({
      reply: "I answer weather queries. Try: weather in Bhiwadi, forecast for Bengaluru tomorrow."
    });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ reply: `Server error: ${err.message || String(err)}` });
  }
});

// Root -> index.html
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Chatbot running: http://localhost:${PORT}`);
});
