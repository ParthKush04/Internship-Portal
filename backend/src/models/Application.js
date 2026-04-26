import mongoose from "mongoose";

const internshipTracks = ["MERN Stack", "AI/ML", "Digital Marketing", "Web Development", "App Development"];

const applicationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    college: {
      type: String,
      required: true,
      trim: true
    },
    contactDetails: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    skills: [
      {
        type: String,
        trim: true
      }
    ],
    internshipPreference: {
      type: String,
      enum: internshipTracks,
      required: true,
      trim: true
    },
    assignedInternship: {
      type: String,
      enum: internshipTracks,
      default: null
    },
    startDate: {
      type: Date,
      default: null
    },
    duration: {
      type: String,
      trim: true,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    resume: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["pending", "shortlisted", "ongoing", "completed", "rejected", "cancelled"],
      default: "pending"
    },
    cancelReason: {
      type: String,
      trim: true,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
