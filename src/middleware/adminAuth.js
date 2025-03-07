// Admin authorization middleware
const adminEmails = ['kesav@admin.com', 'admin@example.com', 'college@admin.edu'];

module.exports = function(req, res, next) {
  try {
    // User email should be set by the auth middleware
    const userEmail = req.user.email;
    
    if (!adminEmails.includes(userEmail)) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (err) {
    res.status(403).json({ message: 'Admin authorization failed' });
  }
};