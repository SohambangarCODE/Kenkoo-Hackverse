const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "User"
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ""
  },
  address: {
    type: String,
    default: ""
  },
  bio: {
    type: String,
    default: "Health enthusiast."
  },
  profileImage: {
    type: String,
    default: "https://ui-avatars.com/api/?name=User&background=random"
  },
  age: {
    type: Number,
    default: null
  },
  bloodType: {
    type: String,
    default: ""
  },
  height: {
    type: String, // e.g. "180 cm" or just number
    default: ""
  },
  weight: {
    type: String, // e.g. "75 kg"
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
