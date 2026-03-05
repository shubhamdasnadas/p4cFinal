import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  otp: String,
  otpExpiry: Date,
});

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);