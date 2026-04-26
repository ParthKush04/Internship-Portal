import { Router } from "express";
import {
  getAllApplications,
  getMyApplication,
  getMyApplicationStatus,
  getMyActiveApplication,
  getSingleApplication,
  shortlistCandidate,
  rejectCandidate,
  cancelCandidate,
  extendInternship,
  completeInternshipForApplication,
  submitApplication,
  updateApplicationStatus,
  downloadCertificate
} from "../controllers/applicationController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { uploadResume } from "../middleware/uploadMiddleware.js";
import {
  applicationValidationRules,
  handleValidationErrors,
  requireUploadedFile
} from "../middleware/validationMiddleware.js";

const router = Router();

router.post(
  "/",
  protect,
  authorize("student"),
  uploadResume,
  applicationValidationRules,
  handleValidationErrors,
  requireUploadedFile("resume", "Resume file is required"),
  submitApplication
);
router.get("/", protect, authorize("admin"), getAllApplications);
router.get("/me/status", protect, authorize("student"), getMyApplicationStatus);
router.get("/me/active", protect, authorize("student"), getMyActiveApplication);
router.get("/my-application", protect, authorize("student"), getMyApplication);
router.post("/shortlist", protect, authorize("admin"), shortlistCandidate);
router.post("/reject", protect, authorize("admin"), rejectCandidate);
router.post("/extend", protect, authorize("admin"), extendInternship);
router.post("/complete", protect, authorize("admin"), completeInternshipForApplication);
router.get("/certificate/:id", protect, downloadCertificate);
router.get("/:id", protect, getSingleApplication);
router.patch("/:id/shortlist", protect, authorize("admin"), shortlistCandidate);
router.patch("/:id/reject", protect, authorize("admin"), rejectCandidate);
router.patch("/:id/cancel", protect, authorize("admin"), cancelCandidate);
router.patch("/:id/status", protect, authorize("admin"), updateApplicationStatus);

export default router;
