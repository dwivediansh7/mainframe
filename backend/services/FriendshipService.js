import Friendship from '../models/Friendship.js';
import User from '../models/User.js';
import StoryGenerator from './StoryGenerator.js';

class FriendshipService {
  async sendFriendRequest(requesterId, recipientUsername) {
    const recipient = await User.findOne({ username: recipientUsername });
    if (!recipient) {
      throw new Error('User not found');
    }

    if (recipient._id.toString() === requesterId) {
      throw new Error('Cannot send friend request to yourself');
    }

    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipient._id },
        { requester: recipient._id, recipient: requesterId }
      ]
    });

    if (existingFriendship) {
      throw new Error('Friendship request already exists');
    }

    const requester = await User.findById(requesterId);
    const compatibilityScore = await this.calculateCompatibility(requester, recipient);
    const relationshipType = await this.determineRelationshipType(requester, recipient);

    return await Friendship.create({
      requester: requesterId,
      recipient: recipient._id,
      compatibilityScore,
      relationshipType
    });
  }

  async calculateCompatibility(user1, user2) {
    return StoryGenerator.calculateSimilarity(user1.traits, user2.traits);
  }

  async determineRelationshipType(user1, user2) {
    const compatibilityScore = await this.calculateCompatibility(user1, user2);
    return StoryGenerator.determineRelationship(
      compatibilityScore,
      user1.traits,
      user2.traits
    );
  }

  async respondToFriendRequest(friendshipId, userId, accept) {
    const friendship = await Friendship.findOne({
      _id: friendshipId,
      recipient: userId,
      status: 'pending'
    });

    if (!friendship) {
      throw new Error('Friend request not found');
    }

    friendship.status = accept ? 'accepted' : 'rejected';
    return await friendship.save();
  }

  async getFriendsList(userId) {
    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    }).populate('requester recipient', 'username traits');

    return friendships.map(friendship => {
      const friend = friendship.requester._id.toString() === userId ?
        friendship.recipient : friendship.requester;
      return {
        friend,
        compatibilityScore: friendship.compatibilityScore,
        relationshipType: friendship.relationshipType
      };
    });
  }

  async generateInviteLink(userId) {
    // In a real implementation, you'd want to use a more secure method
    // and possibly store invite links in the database
    const buffer = Buffer.from(`${userId}-${Date.now()}`);
    return buffer.toString('base64');
  }
}

export default new FriendshipService();
