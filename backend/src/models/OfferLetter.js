import mongoose from "mongoose";

const offerLetterSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const OfferLetter = mongoose.model("OfferLetter", offerLetterSchema);

export default OfferLetter;
