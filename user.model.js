import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      //match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'], // Email validation
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // Enforce a minimum password length
    },
    profilePic: {
      type: String,
      default: '', // Default value for profile picture
    },
    phone: {
      type: String,
      default: '', // Optional field for user phone number
    },
    location: {
      type: String,
      default: '', // Optional field for user location
    },
    bio: {
      type: String,
      default: '', // Optional field for short user bio
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const User = mongoose.model('User', userSchema);

export default User;