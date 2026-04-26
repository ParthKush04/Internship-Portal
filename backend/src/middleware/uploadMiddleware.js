import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";

const avatarUploadDir = path.resolve("backend", "uploads", "avatars");
if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
}

let isCloudinaryConfigured = false;

const ensureCloudinaryConfigured = () => {
  if (isCloudinaryConfigured) {
    return;
  }

  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    const error = new Error("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
    error.status = 500;
    throw error;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
  });
  isCloudinaryConfigured = true;
};

const fileFilter = (_req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    cb(new Error("Only .pdf, .doc, .docx files are allowed"));
    return;
  }
  cb(null, true);
};

const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    const base = path.basename(file.originalname, path.extname(file.originalname)).replace(/\s+/g, "-");

    return {
      folder: "provisioning-tech/resumes",
      resource_type: "raw",
      allowed_formats: ["pdf", "doc", "docx"],
      public_id: `${Date.now()}-${base}`,
      format: ext
    };
  }
});

const uploadResumeMulter = multer({
  storage: resumeStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single("resume");

const uploadResume = (req, res, next) => {
  try {
    ensureCloudinaryConfigured();
  } catch (error) {
    next(error);
    return;
  }

  uploadResumeMulter(req, res, next);
};

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, avatarUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});

const avatarFileFilter = (_req, file, cb) => {
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowed.includes(ext)) {
    cb(new Error("Only .jpg, .jpeg, .png, .webp files are allowed"));
    return;
  }
  cb(null, true);
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
}).single("avatar");

export { uploadResume, uploadAvatar };
