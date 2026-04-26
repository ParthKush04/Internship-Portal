import { Router } from "express";
import { body } from "express-validator";
import {
  createWeeklyLog,
  deleteWeeklyLog,
  getAllWeeklyLogs,
  getWeeklyLogsByApplication,
  updateWeeklyLog
} from "../controllers/weeklyLogController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { handleValidationErrors } from "../middleware/validationMiddleware.js";

const router = Router();

const weeklyLogValidationRules = [
  body("applicationId").notEmpty().withMessage("applicationId is required"),
  body("weekStartDate").notEmpty().withMessage("weekStartDate is required"),
  body("tasksCompleted").trim().notEmpty().withMessage("tasksCompleted is required")
];

router.post(
  "/",
  protect,
  authorize("student", "admin"),
  weeklyLogValidationRules,
  handleValidationErrors,
  createWeeklyLog
);
router.get("/", protect, authorize("admin"), getAllWeeklyLogs);
router.get("/:applicationId", protect, authorize("student", "admin"), getWeeklyLogsByApplication);
router.put("/:id", protect, authorize("student", "admin"), updateWeeklyLog);
router.delete("/:id", protect, authorize("student", "admin"), deleteWeeklyLog);

export default router;