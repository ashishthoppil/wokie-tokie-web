import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

const comprehend = new AWS.Comprehend();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { text } = req.body;

    const params = {
      Text: text,
    };

    try {
      const result = await comprehend.detectDominantLanguage(params).promise();
      const languages = result.Languages;

      res.status(200).json({ languages });
    } catch (error) {
      console.error("Comprehend error:", error);
      res.status(500).json({ error: "Failed to detect language" });
    }
  }
}
