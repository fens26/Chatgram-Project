import mongoose from 'mongoose';
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: true,
      validate: {
        validator: (value) => value.trim().length > 0,
        message: 'Message content cannot be empty',
      },
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video'],
      default: 'text',
    },
    image: { 
      type: String,
      required: false, 
      default: null // Image is optional and can be null
    }
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
