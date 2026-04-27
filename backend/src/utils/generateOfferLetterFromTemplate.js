import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

const drawLine = (page, font, text, x, y, size = 11, wipeWidth = 520) => {
  page.drawRectangle({
    x: x - 2,
    y: y - 3,
    width: wipeWidth,
    height: size + 6,
    color: rgb(1, 1, 1)
  });
  page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
};

const wrapLines = (font, text, size, maxWidth) => {
  const words = normalizeText(text).split(" ").filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      current = next;
    } else {
      if (current) {
        lines.push(current);
      }
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
};

const drawParagraph = (page, font, text, x, yStart, size = 11, maxWidth = 500, lineGap = 13) => {
  const lines = wrapLines(font, text, size, maxWidth);
  const totalHeight = Math.max(1, lines.length) * lineGap + 8;

  page.drawRectangle({
    x: x - 2,
    y: yStart - totalHeight + 8,
    width: maxWidth + 6,
    height: totalHeight,
    color: rgb(1, 1, 1)
  });

  let y = yStart;
  for (const line of lines) {
    page.drawText(line, { x, y, size, font, color: rgb(0, 0, 0) });
    y -= lineGap;
  }
};

export const generateOfferLetterFromTemplate = async ({
  refNo,
  studentName,
  role,
  startDate,
  duration,
  address = "Provisioning Tech",
  email = "",
  mobile = ""
}) => {
  const templatePath = path.resolve(__dirname, "..", "templates", "offer-letter-template.pdf");
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Offer letter template not found at ${templatePath}`);
  }

  const templateBytes = fs.readFileSync(templatePath);
  const doc = await PDFDocument.load(templateBytes);
  const pages = doc.getPages();

  if (pages.length < 5) {
    throw new Error("Offer letter template must have at least 5 pages");
  }

  const page2 = pages[1];
  const page3 = pages[2];
  const page5 = pages[4];
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const formattedStart = new Date(startDate).toLocaleDateString("en-GB");
  const normalizedRole = normalizeText(role) || "Intern";
  const name = normalizeText(studentName) || "Student";
  const normalizedDuration = normalizeText(duration) || "3 Months";
  const normalizedRef = normalizeText(refNo);

  if (normalizedRef) {
    drawLine(page2, font, `REF NO: ${normalizedRef}`, 26.4, 693.2, 11, 520);
  }

  drawLine(page3, font, `Name - ${name}`, 49.6, 678.1, 11, 520);
  drawLine(page3, font, `Address - ${normalizeText(address) || "Provisioning Tech"}`, 49.6, 664.3, 11, 500);
  drawLine(page3, font, `Dear, ${name}`, 49.6, 622.9, 11, 520);
  drawLine(page3, font, `SUB: Internship Offer Letter - ${normalizedRole}`, 49.6, 595.3, 11, 520);

  const paragraph = `This has reference to your application for internship. The Company is pleased to offer you as ${normalizedRole} with effect from ${formattedStart} for a duration of ${normalizedDuration}.`;
  drawParagraph(page3, font, paragraph, 49.6, 568.4, 11, 500, 13);

  drawLine(page5, font, name, 90.5, 324.4, 11, 220);
  if (normalizeText(email)) {
    drawLine(page5, font, normalizeText(email), 89.1, 311.9, 10, 340);
  }
  if (normalizeText(mobile)) {
    drawLine(page5, font, normalizeText(mobile), 91.9, 299.5, 10, 260);
  }

  return doc.save();
};

export default generateOfferLetterFromTemplate;