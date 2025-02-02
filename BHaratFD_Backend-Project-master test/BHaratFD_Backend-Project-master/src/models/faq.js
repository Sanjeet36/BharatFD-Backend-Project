const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  translations: {
    type: Map,
    of: {
      question: String,
      answer: String
    }
  }
}, { timestamps: true });

faqSchema.methods.getTranslation = function (lang) {
  if (lang === 'en') {
    return {
      question: this.question,
      answer: this.answer
    };
  }
  
  if (this.translations && this.translations.has(lang)) {
    return this.translations.get(lang);
  }
  
  return {
    question: this.question,
    answer: this.answer
  };
};

module.exports = mongoose.model('FAQ', faqSchema);