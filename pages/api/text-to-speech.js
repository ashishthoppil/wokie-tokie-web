import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1',
});

const polly = new AWS.Polly();

export default async function handler(req, res) {
  try {
    const { text, voice } = req.body;

    if (!text || !voice) {
      return res.status(400).json({ error: 'Text and voice are required' });
    }

    const params = {
      OutputFormat: 'mp3',
      VoiceId: voice,
      Text: text,
      TextType: 'text',
    };

    const data = await polly.synthesizeSpeech(params).promise();

    res.setHeader('Content-Type', 'audio/mp3');
    res.setHeader('Content-Disposition', 'inline; filename="speech.mp3"');
    res.send(data.AudioStream);
  } catch (error) {
    console.error('AWS Polly Error:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
}

