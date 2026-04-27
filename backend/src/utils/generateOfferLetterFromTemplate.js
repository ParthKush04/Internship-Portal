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

const drawAddressSafe = (page, font, address, x, yFirstBaseline, size, maxWidth) => {
  const oneLine = `Address - ${String(address || "").replace(/\r\n/g, " ").replace(/\s+/g, " ").trim()}`;
  const lineHeight = size * 1.12;

  let lines = wrapToWidth(font, oneLine, size, maxWidth, 2);
  let lastBaseline = yFirstBaseline - (lines.length - 1) * lineHeight;

  if (lastBaseline < PAGE3_SAFE_Y) {
    lines = wrapToWidth(font, oneLine, size, maxWidth, 1);
    lastBaseline = yFirstBaseline;
  }

  const desc = 2.5;
  const asc = size * 0.85;
  const yBottom = Math.max(PAGE3_SAFE_Y - 1, lastBaseline - desc);
  const yTopUncapped = yFirstBaseline + asc + 3;
  const yTop = Math.min(yTopUncapped, 676.5);

  page.drawRectangle({
    x: x - 2,
    y: yBottom,
    width: maxWidth + 4,
    height: yTop - yBottom,
    color: rgb(1, 1, 1),
    borderWidth: 0
  });

  let yy = yFirstBaseline;
  for (const ln of lines) {
    page.drawText(ln, { x, y: yy, size, font, color: rgb(0, 0, 0) });
    yy -= lineHeight;
  }
};

const drawInline = (page, font, text, x, yBaseline, size, coverWidth) => {
  whiteout(page, x, yBaseline, coverWidth, size);
  page.drawText(text, { x, y: yBaseline, size, font, color: rgb(0, 0, 0) });
};

export const generateOfferLetterFromTemplate = async ({
  refNo = "",
  offerAsOn = "",
  month = "",
  name = "",
  address = "",
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

  const candidateName = String(name || "").trim();
  if (candidateName) {
    drawLine(page3, font, `Name - ${candidateName}`, 49.6 + ox, 678.1 + oy, BODY, 520);
    drawLine(page3, font, `Dear, ${candidateName}`, 49.6 + ox, 622.9 + oy, BODY, 520);
    drawInline(page5, font, candidateName, 90.5 + ox, 324.4 + oy, BODY, 220);
  }

  const fullAddress = String(address || "").trim();
  if (fullAddress) {
    drawAddressSafe(page3, font, fullAddress, 49.6 + ox, 664.3 + oy, BODY, 500);
  }

  const subjectText = String(subject || "").trim();
  if (subjectText) {
    drawLine(page3, font, `SUB: ${subjectText}`, 49.6 + ox, 595.3 + oy, BODY, 520);
  }

  const offerValue = String(offerAsOn || "").trim();
  const salaryValue = String(salary || "").trim();
  const monthValue = String(month || "").trim();

  const offerX = 49.6 + ox;
  const offerTopBaseline = 568.4 + oy;
  const offerMaxWidth = 500;
  const offerLineHeight = BODY * 1.12;
  const offerPrefix = "This has reference to your application for employment, the Company is pleased to offer you as on ";

  const offerLines = wrapAfterFixedPrefix(font, offerPrefix, offerValue, BODY, offerMaxWidth, 6);

  const salaryLine = `On Salary of Rs - ${salaryValue}/- for ${monthValue} month and there after depend on Performance with effect.`;

  const blockLines = appendSalarySameLine(font, offerLines, salaryLine, offerMaxWidth, BODY);

  const desc = 3;
  const asc = BODY * 0.85;
  const lastBaseline = offerTopBaseline - (blockLines.length - 1) * offerLineHeight;
  const blockTop = offerTopBaseline + asc + 2;
  const blockBottom = lastBaseline - desc;

  page3.drawRectangle({
    x: 40 + ox,
    y: blockBottom,
    width: 550,
    height: blockTop - blockBottom,
    color: rgb(1, 1, 1),
    borderWidth: 0
  });

  let offerY = offerTopBaseline;
  for (const { text, size } of blockLines) {
    page3.drawText(text, {
      x: offerX,
      y: offerY,
      size,
      font,
      color: rgb(0, 0, 0)
    });
    offerY -= offerLineHeight;
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
