import User from "../models/User.js";
import Application from "../models/Application.js";
import generateToken from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";

const parseJwtExpiryToMs = (expiresIn) => {
  if (!expiresIn) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  if (typeof expiresIn === "number") {
    return expiresIn * 1000;
  }

  const value = String(expiresIn).trim();
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return numeric * 1000;
  }

  const match = value.match(/^(\d+)\s*([smhd])$/i);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  return amount * multipliers[unit];
};

const setAuthCookie = (res, token) => {
  const cookieMaxAge = parseJwtExpiryToMs(process.env.JWT_EXPIRES_IN || "7d");
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: cookieMaxAge
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("name, email and password are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "student"
    });

    const token = generateToken(user._id, user.role, user.name);
    setAuthCookie(res, token);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      token
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid credentials");
    }

    const token = generateToken(user._id, user.role, user.name);
    setAuthCookie(res, token);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      token
    });
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400);
      throw new Error("Google token is required");
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      res.status(500);
      throw new Error("GOOGLE_CLIENT_ID is not configured");
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    if (!email || !name) {
      res.status(400);
      throw new Error("Email and name are required from Google token");
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        password: null,
        role: "student"
      });
    }

    const jwtToken = generateToken(user._id, user.role, user.name);
    setAuthCookie(res, jwtToken);
    res.status(user.createdAt === user.updatedAt ? 201 : 200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      token: jwtToken
    });
  } catch (error) {
    if (error.message.includes("Invalid token")) {
      res.status(401);
      error.message = "Invalid or expired Google token";
    }
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Get additional profile info from their application if they have one
    const application = await Application.findOne({ studentId: user._id }).sort({ createdAt: -1 });

    const profile = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college || "",
      phone: user.phone || "",
      skills: Array.isArray(user.skills) ? user.skills : [],
      googleId: user.googleId,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    };

    // Add application details if available, but do not override user profile updates.
    if (application) {
      profile.firstName = application.firstName;
      profile.lastName = application.lastName;
      profile.contactDetails = application.contactDetails;
      if (!profile.college && application.college) {
        profile.college = application.college;
      }
      if ((!Array.isArray(profile.skills) || profile.skills.length === 0) && Array.isArray(application.skills)) {
        profile.skills = application.skills;
      }
      if (!profile.phone && application?.contactDetails?.phone) {
        profile.phone = application.contactDetails.phone;
      }
      profile.applicationStatus = application.status;
    }

    res.json(profile);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email, college, phone, skills } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (typeof name !== "undefined") {
      user.name = name;
    }

    if (typeof email !== "undefined") {
      const normalizedEmail = String(email).toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        res.status(400);
        throw new Error("Email is already in use");
      }
      user.email = normalizedEmail;
    }

    if (typeof college !== "undefined") {
      user.college = college;
    }

    if (typeof phone !== "undefined") {
      user.phone = phone;
    }

    if (typeof skills !== "undefined") {
      if (Array.isArray(skills)) {
        user.skills = skills;
      } else if (typeof skills === "string") {
        user.skills = skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);
      } else {
        res.status(400);
        throw new Error("skills must be an array or comma-separated string");
      }
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      college: updatedUser.college,
      phone: updatedUser.phone,
      skills: updatedUser.skills,
      avatarUrl: updatedUser.avatarUrl,
      googleId: updatedUser.googleId,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt
    });
  } catch (error) {
    next(error);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Avatar image is required");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatarUrl = avatarUrl;
    const updatedUser = await user.save();

    res.json({
      message: "Avatar uploaded successfully",
      avatarUrl: updatedUser.avatarUrl,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error) {
    next(error);
  }
};

export { registerUser, loginUser, googleAuth, getMe, updateProfile, uploadAvatar };
