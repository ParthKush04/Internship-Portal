import mongoose from "mongoose";

const weeklyLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Application",
    required: true
  },
  weekStartDate: {
    type: Date,
    required: true
  },
  weekEndDate: {
    type: Date,
    required: true
  },
  tasksCompleted: {
    type: String,
    required: true,
    trim: true
  },
  achievements: {
    type: String,
    trim: true,
    default: ""
  },
  challenges: {
    type: String,
    trim: true,
    default: ""
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["completed", "partial", "pending"],
    default: "pending"
  },
  projectLink: {
    type: String,
    trim: true,
    default: null
  },
  mentorRemarks: {
    type: String,
    trim: true,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

weeklyLogSchema.index({ applicationId: 1, weekStartDate: 1 }, { unique: true });

const WeeklyLog = mongoose.model("WeeklyLog", weeklyLogSchema);

export default WeeklyLog;
