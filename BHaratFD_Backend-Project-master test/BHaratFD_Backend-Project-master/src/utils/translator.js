const {Translate} = require('@google-cloud/translate').v2;
const Bottleneck = require('bottleneck');

// Initialize rate limiter
const limiter = new Bottleneck({
  minTime: 1000, 
  maxConcurrent: 1 
});

// Initialize the translation client
const translate = new Translate({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_CREDENTIALS_PATH
});

exports.translate = async (text, targetLang, retries = 3) => {
  return limiter.schedule(async () => {
    try {
      const [translation] = await translate.translate(text, targetLang);
      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  });
};