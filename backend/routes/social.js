import express from 'express';
import { auth } from '../middleware/auth.js';
import FriendshipService from '../services/FriendshipService.js';
import DuelService from '../services/DuelService.js';
import LeaderboardService from '../services/LeaderboardService.js';

const router = express.Router();

// Friendship routes
router.post('/friends/request', auth, async (req, res) => {
  try {
    const friendship = await FriendshipService.sendFriendRequest(
      req.user._id,
      req.body.username
    );
    res.json(friendship);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/friends/respond/:friendshipId', auth, async (req, res) => {
  try {
    const friendship = await FriendshipService.respondToFriendRequest(
      req.params.friendshipId,
      req.user._id,
      req.body.accept
    );
    res.json(friendship);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/friends', auth, async (req, res) => {
  try {
    const friends = await FriendshipService.getFriendsList(req.user._id);
    res.json(friends);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/friends/invite', auth, async (req, res) => {
  try {
    const inviteLink = await FriendshipService.generateInviteLink(req.user._id);
    res.json({ inviteLink });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Duel routes
router.post('/duels/automatic', auth, async (req, res) => {
  try {
    const duel = await DuelService.createAutomaticDuel(req.user._id);
    res.json(duel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/duels/:duelId/vote', auth, async (req, res) => {
  try {
    const duel = await DuelService.vote(
      req.params.duelId,
      req.user._id,
      req.body.votedFor
    );
    res.json(duel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/duels/history', auth, async (req, res) => {
  try {
    const history = await DuelService.getDuelHistory(req.user._id);
    res.json(history);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Leaderboard routes
router.get('/leaderboard/:category', async (req, res) => {
  try {
    const leaderboard = await LeaderboardService.getLeaderboard(
      req.params.category,
      req.query.limit ? parseInt(req.query.limit) : 10
    );
    res.json(leaderboard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
