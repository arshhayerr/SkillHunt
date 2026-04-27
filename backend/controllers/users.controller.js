const User = require('../models/user.model');

// Get all members (public profiles)
const getMembers = async (req, res) => {
  try {
    const { search, role, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { 'profile.isPublic': { $ne: false } };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'profile.headline': { $regex: search, $options: 'i' } },
        { 'profile.bio': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }

    const members = await User.find(query)
      .select('name email role profile.headline profile.location profile.profilePicture profile.followers profile.following')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ createdAt: -1 });

    // Transform data to include follower counts
    const transformedMembers = members.map(member => ({
      id: member._id,
      name: member.name,
      email: member.email,
      role: member.role,
      headline: member.profile?.headline || 'Professional',
      location: member.profile?.location || 'Location not specified',
      profilePicture: member.profile?.profilePicture,
      followersCount: member.profile?.followers?.length || 0,
      followingCount: member.profile?.following?.length || 0
    }));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      members: transformedMembers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMembers
};
