import { Router } from "express";
import {
  completeInternship,
  extendInternshipDuration,
  generateCompletionCertificate,
  getMyInternshipStatus
} from "../controllers/internshipController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/me/status", protect, authorize("student"), getMyInternshipStatus);
router.patch("/:id/extend", protect, authorize("admin"), extendInternshipDuration);
router.patch("/:id/complete", protect, authorize("admin"), completeInternship);
router.post("/:id/certificate", protect, authorize("admin"), generateCompletionCertificate);

export default router;
