import { Router } from "express";
import { getCertificatePdf, getOfferLetterPdf } from "../controllers/pdfController.js";

const router = Router();

router.get("/offer-letter/:id", getOfferLetterPdf);
router.get("/certificate/:id", getCertificatePdf);

export default router;