import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: function () {
        return this.auth_provider === "LOCAL";
      },
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: function () {
        return this.auth_provider === "LOCAL";
      },
    },

    auth_provider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      required: true,
    },

    // 🔹 Academic Profile
    profile: {
      department: {
        type: String,
        default: null,
      },
      degree: {
        type: String,
        default: null,
      },
      year: {
        type: Number,
        min: 1,
        max: 8,
        default: null,
      },
      institution: {
        type: String,
        default: null,
      },
    },

    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
