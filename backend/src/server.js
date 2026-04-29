import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

// Get absolute path to .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "..", ".env");

// Load environment variables FIRST with explicit path
const require = createRequire(import.meta.url);
require("dotenv").config({ path: envPath });

console.log("📂 Loading .env from:", envPath);
console.log("✅ Gmail User loaded:", !!process.env.GMAIL_USER);

// Now import everything else AFTER dotenv is loaded
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import initializeSendGrid from "./config/sendGrid.js";

// Use dynamic import for app to ensure dotenv is ready
let app;
const startApp = async () => {
  const module = await import("./app.js");
  app = module.default;
  
  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100
    })
  );

  const PORT = process.env.PORT || 5000;

  try {
    initializeSendGrid();
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

startApp();
