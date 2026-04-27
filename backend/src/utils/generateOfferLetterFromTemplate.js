import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const BODY = 11;
const NARROW = 10;
const PAGE3_SAFE_Y = 643;
const OFFER_SALARY_MIN_PTS = 7;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const whiteout = (page, x, yBaseline, width, fontSize) => {
  const descenderPad = 2.5;
  const ascender = fontSize * 0.85;
  page.drawRectangle({
    x: x - 2,
    y: yBaseline - descenderPad,
    width,
    height: ascender + descenderPad,
    color: rgb(1, 1, 1),
    borderWidth: 0
  });
};

const drawLine = (page, font, text, x, yBaseline, size, coverWidth) => {
  whiteout(page, x, yBaseline, coverWidth, size);
  page.drawText(text, { x, y: yBaseline, size, font, color: rgb(0, 0, 0) });
};

const wrapToWidth = (font, text, size, maxWidth, maxLines) => {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let idx = 0;

  while (idx < words.length && lines.length < maxLines) {
    let line = words[idx];
    idx += 1;

    while (idx < words.length) {
      const next = `${line} ${words[idx]}`;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        line = next;
        idx += 1;
      } else {
        break;
      }
    }

    lines.push(line);
  }

  if (idx < words.length && lines.length > 0) {
    let last = lines[lines.length - 1];
    const ell = "...";
    while (last.length > 0 && font.widthOfTextAtSize(last + ell, size) > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = last + ell;
  }

  return lines.length > 0 ? lines : [String(text || "")];
};

const wrapAfterFixedPrefix = (font, prefix, suffix, size, maxWidth, maxLines) => {
  const suffixNorm = String(suffix || "").replace(/\s+/g, " ").trim();
  const words = suffixNorm ? suffixNorm.split(/\s+/).filter(Boolean) : [];
  const prefixWidth = font.widthOfTextAtSize(prefix, size);

  if (prefixWidth > maxWidth) {
    return wrapToWidth(font, `${prefix}${suffixNorm}`, size, maxWidth, maxLines);
  }

  if (words.length === 0) {
    return [prefix];
  }

  const lines = [];
  let line = prefix;
  let wi = 0;

  while (wi < words.length) {
    const candidate = line === prefix ? `${prefix}${words[wi]}` : `${line} ${words[wi]}`;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
      wi += 1;
    } else {
      break;
    }
  }

  if (wi === 0) {
    lines.push(prefix);
  } else {
    lines.push(line);
  }

  while (wi < words.length && lines.length < maxLines) {
    let nextLine = words[wi];
    wi += 1;

    while (wi < words.length) {
      const candidate = `${nextLine} ${words[wi]}`;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        nextLine = candidate;
        wi += 1;
      } else {
        break;
      }
    }

    lines.push(nextLine);
  }

  if (wi < words.length && lines.length > 0) {
    let last = lines[lines.length - 1];
    const ell = "...";
    while (last.length > 0 && font.widthOfTextAtSize(last + ell, size) > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = last + ell;
  }

  return lines.length > 0 ? lines : [prefix];
};

const appendSalarySameLine = (font, lines, salaryLine, maxWidth, bodySize) => {
  const tailNorm = String(salaryLine || "").replace(/\s+/g, " ").trim();
  const out = lines.map((text) => ({ text, size: bodySize }));

  if (!tailNorm) {
    return out;
  }

  if (out.length === 0) {
    return wrapToWidth(font, tailNorm, bodySize, maxWidth, 6).map((text) => ({ text, size: bodySize }));
  }

  const last = out[out.length - 1]?.text || "";
  const glue = last.endsWith(" ") ? "" : " ";
  const merged = `${last}${glue}${tailNorm}`;

  let size = bodySize;
  while (size > OFFER_SALARY_MIN_PTS && font.widthOfTextAtSize(merged, size) > maxWidth) {
    size -= 0.25;
  }

  if (font.widthOfTextAtSize(merged, size) <= maxWidth) {
    out[out.length - 1] = { text: merged, size };
    return out;
  }

  let trimmed = merged;
  const ell = "...";
  while (trimmed.length > 0 && font.widthOfTextAtSize(trimmed + ell, OFFER_SALARY_MIN_PTS) > maxWidth) {
    trimmed = trimmed.slice(0, -1);
  }

  out[out.length - 1] = { text: trimmed + ell, size: OFFER_SALARY_MIN_PTS };
  return out;
};

const drawInline = (page, font, text, x, yBaseline, size, coverWidth) => {
  whiteout(page, x, yBaseline, coverWidth, size);
  page.drawText(text, { x, y: yBaseline, size, font, color: rgb(0, 0, 0) });
};

export const generateOfferLetterFromTemplate = async ({
  refNo = "",
  offerAsOn = "",
  startDate = "",
  month = "",
  name = "",
  subject = "",
  salary = "",
  email = "",
  mobile = "",
  offsetX = 0,
  offsetY = 0
}) => {
  const templatePath = path.resolve(__dirname, "..", "templates", "offer-letter-template.pdf");

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Offer letter template not found at ${templatePath}`);
  }

  const templateBytes = fs.readFileSync(templatePath);
  const doc = await PDFDocument.load(templateBytes);
  const pages = doc.getPages();

  const page2 = pages[1];
  const page3 = pages[2];
  const page5 = pages[4];

  if (!page2 || !page3 || !page5) {
    throw new Error("Template must have at least 5 pages (offer letter format)");
  }

  const font = await doc.embedFont(StandardFonts.Helvetica);

  const ox = Number(offsetX) || 0;
  const oy = Number(offsetY) || 0;

  const ref = String(refNo || "").trim();
  if (ref) {
    drawLine(page2, font, `REF NO: ${ref}`, 26.4 + ox, 693.2 + oy, BODY, 520);
  }

  const startDateText = String(startDate || "").trim();

  const candidateName = String(name || "").trim();
  if (candidateName) {
    drawLine(page3, font, `Name - ${candidateName}`, 49.6 + ox, 678.1 + oy, BODY, 520);
    if (startDateText) {
      drawLine(page3, font, `Start Date- ${startDateText}`, 395 + ox, 678.1 + oy, BODY, 200);
    }
    drawLine(page3, font, `Dear, Mr. ${candidateName}`, 49.6 + ox, 622.9 + oy, BODY, 520);
    drawInline(page5, font, candidateName, 90.5 + ox, 324.4 + oy, BODY, 220);
  }

  const subjectText = String(subject || "").trim();
  if (subjectText) {
    drawLine(page3, font, `SUB: ${subjectText}`, 49.6 + ox, 595.3 + oy, BODY, 520);
  }

  const position = String(offerAsOn || "").trim() || "MERN Stack Developer";
  const roleTrack = position.replace(/\s+Developer$/i, "").trim() || position;
  const readableDate = startDateText || "06/03/2026";
  const bodyParagraphs = [
    `This has reference to your application for internship with our organization. We are pleased to offer you an Internship for the position of ${position} with our company.`,
    `Your internship will commence from ${readableDate}. This internship will provide you with practical exposure and learning opportunities in web development technologies related to the ${roleTrack}.`,
    "Please note that this is an Unpaid Internship (No Stipend) and no financial remuneration will be provided during the internship period. The purpose of this internship is to provide hands-on experience, industry exposure, and skill development.",
    "During the internship period, you will be expected to maintain discipline, complete assigned tasks, and follow company policies and guidelines.",
    "Upon successful completion of the internship and satisfactory performance, the company may provide an Internship Completion Certificate and Experience Letter."
  ];

  const bodyX = 49.6 + ox;
  const bodyTopBaseline = 568.4 + oy;
  const bodyMaxWidth = 500;
  const bodyLineHeight = BODY * 1.12;

  const bodyLines = [];
  for (const paragraph of bodyParagraphs) {
    const wrapped = wrapToWidth(font, paragraph, BODY, bodyMaxWidth, 8);
    bodyLines.push(...wrapped, "");
  }
  if (bodyLines.length > 0 && bodyLines[bodyLines.length - 1] === "") {
    bodyLines.pop();
  }

  const bodyHeight = Math.max(bodyLines.length, 1) * bodyLineHeight + 8;
  page3.drawRectangle({
    x: 40 + ox,
    y: bodyTopBaseline - bodyHeight + 8,
    width: 550,
    height: bodyHeight,
    color: rgb(1, 1, 1),
    borderWidth: 0
  });

  let bodyY = bodyTopBaseline;
  for (const line of bodyLines) {
    if (line) {
      page3.drawText(line, {
        x: bodyX,
        y: bodyY,
        size: BODY,
        font,
        color: rgb(0, 0, 0)
      });
    }
    bodyY -= bodyLineHeight;
  }

  const emailValue = String(email || "").trim();
  if (emailValue) {
    drawInline(page5, font, emailValue, 89.1 + ox, 311.9 + oy, NARROW, 340);
  }

  const mobileValue = String(mobile || "").trim();
  if (mobileValue) {
    const mobileLine = mobileValue.startsWith("+") || mobileValue.startsWith("91") ? mobileValue : `+91-${mobileValue}`;
    drawInline(page5, font, mobileLine, 91.9 + ox, 299.5 + oy, NARROW, 260);
  }

  return doc.save();
};

export default generateOfferLetterFromTemplate;
