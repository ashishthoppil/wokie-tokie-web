import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

const translate = new AWS.Translate();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text, targetLang } = req.body;

    const params = {
      Text: text,
      SourceLanguageCode: 'auto',  // Detect the source language automatically
      TargetLanguageCode: targetLang,  // Target language is Hindi
    };

    try {
      const translatedText = await translate.translateText(params).promise();
      res.status(200).json(translatedText);
    } catch (error) {
      console.error("Translation error:", error);
      res.status(500).json({ error: "Failed to translate text" });
    }
  }
}
