import express from 'express';
import { auth } from '../middleware/auth.js';
import CharacterMatcher from '../services/characterMatcher.js';
import Character from '../models/Character.js';
import Universe from '../models/Universe.js';

const router = express.Router();

// Get all available universes
router.get('/universes', async (req, res) => {
  try {
    const universes = await Universe.find().select('-__v');
    res.json(universes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching universes' });
  }
});

// Get characters from a specific universe
router.get('/universe/:universeName/characters', async (req, res) => {
  try {
    const characters = await Character.find({ 
      show: req.params.universeName 
    }).select('-__v');
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching characters' });
  }
});

// Generate traits from user description
router.post('/generate-traits', auth, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const traits = await CharacterMatcher.generateTraits(description);
    res.json({ traits });
  } catch (error) {
    res.status(500).json({ error: 'Error generating traits' });
  }
});

// Find matching characters
router.post('/match', auth, async (req, res) => {
  try {
    const { traits, universe } = req.body;
    if (!traits || !Array.isArray(traits)) {
      return res.status(400).json({ error: 'Valid traits array is required' });
    }

    const matches = await CharacterMatcher.findMatchingCharacters(traits, universe);
    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: 'Error finding matches' });
  }
});

// Get alternate universe suggestions
router.post('/suggest-universes', auth, async (req, res) => {
  try {
    const { traits } = req.body;
    if (!traits || !Array.isArray(traits)) {
      return res.status(400).json({ error: 'Valid traits array is required' });
    }

    const suggestions = await CharacterMatcher.suggestAlternateUniverses(traits);
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Error finding universe suggestions' });
  }
});

// Track character evolution
router.get('/evolution/:timeframe?', auth, async (req, res) => {
  try {
    const evolution = await CharacterMatcher.trackCharacterEvolution(
      req.user.userId,
      req.params.timeframe
    );
    res.json({ evolution });
  } catch (error) {
    res.status(500).json({ error: 'Error tracking evolution' });
  }
});

export default router;
