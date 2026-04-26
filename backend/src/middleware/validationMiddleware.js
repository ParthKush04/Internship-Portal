import { body, validationResult } from "express-validator";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
    return;
  }

  res.status(400).json({
    message: "Validation failed",
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg
    }))
  });
};

const requireUploadedFile = (fieldName, message) => (req, res, next) => {
  if (!req.file) {
    res.status(400).json({
      message: "Validation failed",
      errors: [{ field: fieldName, message }]
    });
    return;
  }

  next();
};

const registerValidationRules = [
  body("name").trim().notEmpty().withMessage("name is required"),
  body("email").trim().notEmpty().withMessage("email is required").bail().isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("password is required")
];

const loginValidationRules = [
  body("email").trim().notEmpty().withMessage("email is required").bail().isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("password is required")
];

const googleAuthValidationRules = [
  body("token").trim().notEmpty().withMessage("Google token is required")
];

const applicationValidationRules = [
  body("firstName").trim().notEmpty().withMessage("firstName is required"),
  body("lastName").trim().notEmpty().withMessage("lastName is required"),
  body("college").trim().notEmpty().withMessage("college is required"),
  body("internshipPreference").trim().notEmpty().withMessage("internshipPreference is required"),
  body("email").trim().notEmpty().withMessage("email is required").bail().isEmail().withMessage("Invalid email format"),
  body("phone").trim().notEmpty().withMessage("phone is required")
];

export {
  applicationValidationRules,
  googleAuthValidationRules,
  handleValidationErrors,
  loginValidationRules,
  registerValidationRules,
  requireUploadedFile
};