const express = require('express');
const router = express.Router();
const FAQ = require('../models/faq');
const cacheMiddleware = require('../middleware/cache');
const translator = require('../utils/translator');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateFAQ = [
    body('question').notEmpty().trim().escape().withMessage('Question is required'),
    body('answer').notEmpty().withMessage('Answer is required'),
];

router.get('/faqs', cacheMiddleware, async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const faqs = await FAQ.find();
    const translatedFaqs = faqs.map(faq => ({
      id: faq._id,
      ...faq.getTranslation(lang)
    }));
    res.json(translatedFaqs);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching FAQs' });
  }
});

router.get('/faqs/hi', cacheMiddleware, async (req, res) => {
  try {
    const faqs = await FAQ.find();
    const translatedFaqs = faqs.map(faq => ({
      id: faq._id,
      ...faq.getTranslation('hi')
    }));
    res.json(translatedFaqs);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching FAQs' });
  }
});

router.get('/faqs/bn', cacheMiddleware, async (req, res) => {
  try {
    const faqs = await FAQ.find();
    const translatedFaqs = faqs.map(faq => ({
      id: faq._id,
      ...faq.getTranslation('bn')
    }));
    res.json(translatedFaqs);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching FAQs' });
  }
});

router.post('/faqs', validateFAQ, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { question, answer, language } = req.body;
        const faq = new FAQ({
            question,
            answer,
            translations: new Map()
        });
        
        // Translate to supported languages
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
                faq.translations.set(lang, {
                    question: question,
                    answer: answer
                });
            }
        }
        
        await faq.save();
        res.status(201).json(faq);
    } catch (error) {
        console.error('Error creating FAQ:', error);
        res.status(500).json({ error: 'An error occurred while creating the FAQ' });
    }
});

module.exports = router;
