import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client if API key is present
let ai: GoogleGenAI | null = null;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log("Gemini AI client successfully initialized on server.");
  } catch (err) {
    console.error("Error initializing Gemini client:", err);
  }
} else {
  console.warn("WARNING: GEMINI_API_KEY is not set in environment variables. AI features will be unavailable.");
}

// API Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    aiEnabled: !!ai,
    time: new Date().toISOString()
  });
});

// API Route for AI Description Generation or Suggestion
app.post("/api/ai/generate", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "Gemini API non configurata sul server. Inserisci la chiave API nelle impostazioni."
    });
  }

  const { type, location, bedrooms, bathrooms, price, features, extraInfo } = req.body;

  if (!type || !location) {
    return res.status(400).json({ error: "I campi tipo e localizzazione sono richiesti." });
  }

  try {
    const prompt = `Sei un agente immobiliare professionista di alto livello per l'agenzia "Atlas Real Estate" (promossa da atlaslabs.it), attiva in Piemonte (Acqui Terme e Monferrato).
Scrivi una descrizione accattivante, elegante, ricca di dettagli e persuasiva per un annuncio immobiliare con le seguenti caratteristiche:
- Tipo di immobile: ${type}
- Località: ${location}
- Camere da letto: ${bedrooms || 'N/D'}
- Bagni: ${bathrooms || 'N/D'}
- Prezzo richiesto: ${price ? price + ' €' : 'Trattativa riservata'}
- Caratteristiche aggiuntive: ${features ? features.join(', ') : 'Nessuna specificata'}
- Informazioni o note extra: ${extraInfo || 'Nessuna'}

La descrizione deve essere scritta in un italiano impeccabile, raffinato, evocando le bellezze locali (es. le colline del Monferrato patrimonio UNESCO, i vigneti storici, le sorgenti termali di Acqui Terme, i casali storici in pietra, borghi suggestivi, i profumi e colori dei colli piemontesi, ecc.). Dividi il testo in paragrafi leggibili. Non inserire markdown tranne intestazioni semplici (grassetti, elenchi). Aggiungi alla fine 3 brevi punti di forza ("Perché scegliere questo immobile").`;

    console.log("Generating description with Gemini...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || "";
    res.json({ text });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: error.message || "Errore durante la generazione della descrizione." });
  }
});

// API Route for AI translation
app.post("/api/ai/translate", async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: "Gemini API non configurata sul server."
    });
  }

  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "Testo e lingua di destinazione sono richiesti." });
  }

  try {
    const prompt = `Traduci fedelmente il seguente testo per un annuncio immobiliare in lingua ${targetLanguage}.
Mantieni lo stile professionale, elegante e accattivante. Non aggiungere commenti personali, fornisci SOLO la traduzione diretta del testo.

Testo da tradurre:
${text}`;

    console.log(`Translating description to ${targetLanguage} with Gemini...`);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const translatedText = response.text || "";
    res.json({ translatedText });
  } catch (error: any) {
    console.error("Error translating with Gemini API:", error);
    res.status(500).json({ error: error.message || "Errore durante la traduzione del testo." });
  }
});

// Configure Vite middleware in dev or static files in production
async function setupViteAndListen() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupViteAndListen().catch((err) => {
  console.error("Failed to start server due to configuration error:", err);
});
