const User = require("../models/user.model");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    Object.assign(user, req.body);
    // Don't update password here directly without hashing if it were sent
    if (req.body.password) {
        delete req.body.password; 
    }
    
    await user.save();
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Construct image URL (assuming server is running on same host/port)
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    user.profileImage = imageUrl;
    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ message: "Server error uploading image" });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadProfileImage
};
