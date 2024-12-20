import translate from "translate";

translate.engine = "google"; 
translate.key = process.env.GOOGLE_API_KEY;

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text, targetLang, sourceLang } = req.body;

    try {
      const translatedText = await translate(text, { to: targetLang, from: sourceLang });
      res.status(200).json({ translatedText });
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Failed to translate text" });
    }
  }
}
