const express = require('express');
const router = express.Router();
const FAQ = require('../models/faq');
const { body, validationResult } = require('express-validator');
const translator = require('../utils/translator');

// Middleware for input validation
const validateFAQ = [
  body('question').notEmpty().trim().escape().withMessage('Question is required'),
  body('answer').notEmpty().withMessage('Answer is required'),
];

// Get all FAQs
router.get('/faqs', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const faqs = await FAQ.find().sort({ createdAt: -1 });
    const translatedFaqs = faqs.map(faq => {
      const translation = lang === 'en' ? 
        { question: faq.question, answer: faq.answer } : 
        faq.translations.get(lang) || { question: faq.question, answer: faq.answer };
      
      return {
        id: faq._id,
        question: translation.question,
        answer: translation.answer
      };
    });
    res.json(translatedFaqs);
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'An error occurred while fetching FAQs' });
  }
});

// Create a new FAQ
router.post('/faqs', validateFAQ, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { question, answer, language } = req.body;
    const faq = new FAQ({ question, answer });
    await faq.save();
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while creating the FAQ' });
  }
});

// Update an existing FAQ
router.put('/faqs/:id', validateFAQ, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { question, answer, language } = req.body;
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    // If editing in a non-English language, store in translations
    if (language !== 'en') {
      faq.translations.set(language, {
        question: question,
        answer: answer
      });
      // Translate to other languages
      const otherLanguages = ['hi', 'bn', 'en'].filter(lang => lang !== language);
      for (const lang of otherLanguages) {
        try {
          const [translatedQuestion, translatedAnswer] = await Promise.all([
            translator.translate(question, lang),
            translator.translate(answer, lang)
          ]);
          if (lang === 'en') {
            faq.question = translatedQuestion;
            faq.answer = translatedAnswer;
          } else {
            faq.translations.set(lang, {
              question: translatedQuestion,
              answer: translatedAnswer
            });
          }
        } catch (translationError) {
          console.error(`Failed to translate to ${lang}:`, translationError);
        }
      }
    } else {
      // If editing in English, update main fields and translate to other languages
      faq.question = question;
      faq.answer = answer;
      const supportedLanguages = ['hi', 'bn'];
      for (const lang of supportedLanguages) {
        try {
          const [translatedQuestion, translatedAnswer] = await Promise.all([
            translator.translate(question, lang),
            translator.translate(answer, lang)
          ]);
          faq.translations.set(lang, {
            question: translatedQuestion,
            answer: translatedAnswer
          });
        } catch (translationError) {
          console.error(`Failed to translate to ${lang}:`, translationError);
        }
      }
    }

    const updatedFAQ = await faq.save();
    res.json(updatedFAQ);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ error: 'An error occurred while updating the FAQ' });
  }
});

// Delete an FAQ
router.delete('/faqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFAQ = await FAQ.findByIdAndDelete(id);
    if (!deletedFAQ) {
      return res.status(404).json({ error: 'FAQ not found' });
    }
    res.json({ message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while deleting the FAQ' });
  }
});

module.exports = router;