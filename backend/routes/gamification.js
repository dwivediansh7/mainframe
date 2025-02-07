import express from 'express';
import GamificationService from '../services/gamification.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user progress
router.get('/progress', auth, async (req, res) => {
  try {
    const progress = await GamificationService.updateProgress(req.user._id, 'STREAK_UPDATE', {
      type: 'daily_quiz'
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily quiz
router.get('/daily-quiz', auth, async (req, res) => {
  try {
    const { universe } = req.query;
    const quiz = await GamificationService.generateDailyQuiz(universe);
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit quiz answers
router.post('/quiz/:quizId/submit', auth, async (req, res) => {
  try {
    const { answers, score } = req.body;
    const progress = await GamificationService.updateProgress(req.user._id, 'DAILY_QUIZ_COMPLETE', {
      quizId: req.params.quizId,
      score
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Find best friend
router.get('/best-friend', auth, async (req, res) => {
  try {
    const bestFriend = await GamificationService.findBestFriend(req.user._id);
    res.json(bestFriend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { type = 'xp', limit = 10 } = req.query;
    const leaderboard = await Progress.find()
      .sort({ [type]: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'username');
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update character evolution
router.post('/evolution', auth, async (req, res) => {
  try {
    const { character, matchScore } = req.body;
    const progress = await GamificationService.updateProgress(req.user._id, 'CHARACTER_MATCH', {
      character,
      matchScore
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record duel results
router.post('/duel-complete', auth, async (req, res) => {
  try {
    const { won } = req.body;
    const progress = await GamificationService.updateProgress(req.user._id, 'DUEL_COMPLETE', {
      won
    });
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
