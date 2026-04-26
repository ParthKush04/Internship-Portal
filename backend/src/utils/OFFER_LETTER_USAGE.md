# Offer Letter Generator - Usage Guide

## Overview

The `generateOfferLetterPdf.js` utility generates professional internship offer letters that exactly match the Provisioning Tech template design with red and yellow branding, all terms & conditions, and dynamic student information.

## Features

✅ Replaces all dynamic student information  
✅ Keeps template design, colors, fonts, and layout exactly same  
✅ Auto-generates reference number (HR/INT/YYYY/ID)  
✅ No student address (as requested)  
✅ All terms and conditions included  
✅ Professional 3-page PDF document  
✅ Saves to file system for record-keeping

## Function Signature

```javascript
const generateOfferLetterPdf = async ({
  studentId,                    // Required: Student/Application ID
  studentName,                  // Required: Student's full name
  role,                         // Required: Internship position (e.g., "MERN Stack Developer")
  startDate,                    // Required: Start date (Date object or ISO string)
  duration,                     // Required: Duration in months (e.g., "3")
  hrContactName,               // Optional: HR contact name (default: "Parth Kushwaha")
  hrContactEmail,              // Optional: HR email (default: "parthkush1000@gmail.com")
  hrContactPhone               // Optional: HR phone (default: "+91- 9044775397")
}) => Promise<{
  fileName: string,             // Generated filename
  absoluteFilePath: string,     // Full path where PDF is saved
  relativeFilePath: string      // Relative path for serving
}>
```

## Usage Examples

### 1. Basic Usage in Controller

```javascript
import generateOfferLetterPdf from "../utils/generateOfferLetterPdf.js";

const generateOfferLetterForStudent = async (req, res) => {
  try {
    const { applicationId, studentName, position, startDate, duration } =
      req.body;

    const result = await generateOfferLetterPdf({
      studentId: applicationId,
      studentName: studentName,
      role: position,
      startDate: startDate,
      duration: duration,
    });

    // Return PDF file path to frontend or send file directly
    res.json({
      success: true,
      filePath: result.relativeFilePath,
      fileName: result.fileName,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 2. Generate and Send PDF Directly

```javascript
const getOfferLetterPdf = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    const pdfResult = await generateOfferLetterPdf({
      studentId: application._id,
      studentName: `${application.firstName} ${application.lastName}`,
      role: application.assignedInternship || "Internship Candidate",
      startDate: application.startDate,
      duration: 3,
    });

    // Send PDF directly to browser
    const fs = require("fs");
    const pdfBuffer = fs.readFileSync(pdfResult.absoluteFilePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${pdfResult.fileName}`,
    );
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 3. Generate with Custom HR Information

```javascript
const generateOfferWithCustomHR = async (req, res) => {
  try {
    const result = await generateOfferLetterPdf({
      studentId: "12345",
      studentName: "John Doe",
      role: "Full Stack Developer",
      startDate: "2026-05-01",
      duration: 3,
      hrContactName: "Parth Kushwaha",
      hrContactEmail: "hr@provisioningtech.com",
      hrContactPhone: "+91-9876543210",
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## Dynamic Fields Replaced

| Field               | Source                                    | Example                   |
| ------------------- | ----------------------------------------- | ------------------------- |
| Name                | studentName param                         | "Parth Kushwaha"          |
| Start Date          | startDate param (formatted as DD/MM/YYYY) | "06/03/2026"              |
| Internship Position | role param                                | "MERN Stack Developer"    |
| REF NO              | Auto-generated from studentId             | "HR/INT/2026/001"         |
| Duration            | duration param                            | "03 months"               |
| HR Name             | hrContactName param                       | "Parth Kushwaha"          |
| HR Email            | hrContactEmail param                      | "parthkush1000@gmail.com" |
| HR Phone            | hrContactPhone param                      | "+91- 9044775397"         |

## Template Features Preserved

✅ **Design Elements:**

- Red (#A3271A) and Yellow (#FFB81C) color scheme
- Company logo and branding
- Professional header with contact information
- Decorative elements and banner styling

✅ **Document Structure:**

- Page 1: Title/Cover page with company branding
- Page 2-3: Complete offer letter with T&Cs
- 3-page professional document

✅ **Content Sections:**

- Reference number
- Student name and start date (dynamic)
- Greeting with personalized name
- Subject line with position
- Internship details and terms
- Complete Terms and Conditions (9 sections)
- Required document checklist
- Footer with company contact info

✅ **Typography & Formatting:**

- Helvetica font family
- Proper font weights (Bold, Regular, Oblique)
- Justified text alignment
- Professional spacing and margins
- Horizontal dividers

## Output

The function returns:

```javascript
{
  fileName: "offer-letter-12345-1700000000000.pdf",
  absoluteFilePath: "c:\\path\\to\\backend\\uploads\\offer-letters\\offer-letter-12345-1700000000000.pdf",
  relativeFilePath: "/uploads/offer-letters/offer-letter-12345-1700000000000.pdf"
}
```

## File Storage

PDFs are automatically saved to: `backend/uploads/offer-letters/`

This directory is created automatically if it doesn't exist.

## Integration with Internship Controller

To integrate with your internship assignment workflow:

```javascript
// In internshipController.js
import generateOfferLetterPdf from "../utils/generateOfferLetterPdf.js";

export const assignInternshipAndGenerateOffer = async (req, res) => {
  try {
    const { applicationId, assignedInternship, startDate } = req.body;

    // Update internship assignment
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { assignedInternship, startDate },
      { new: true },
    );

    // Generate offer letter
    const offerLetter = await generateOfferLetterPdf({
      studentId: application._id,
      studentName: `${application.firstName} ${application.lastName}`,
      role: assignedInternship,
      startDate: startDate,
      duration: 3,
    });

    // Save offer letter path in application record
    application.offerLetterPath = offerLetter.relativeFilePath;
    await application.save();

    res.json({
      success: true,
      message: "Internship assigned and offer letter generated",
      offerLetterPath: offerLetter.relativeFilePath,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

## Date Format

The function automatically formats dates as DD/MM/YYYY:

- Input: `"2026-03-06"` or `new Date("2026-03-06")`
- Output in PDF: `"06/03/2026"`

## Customization

To customize the default HR contact information, modify these defaults in the function:

```javascript
((hrContactName = "Parth Kushwaha"),
  (hrContactEmail = "parthkush1000@gmail.com"),
  (hrContactPhone = "+91- 9044775397"));
```

## Error Handling

The function includes proper error handling:

```javascript
try {
  const result = await generateOfferLetterPdf({...});
} catch (error) {
  // Handle file system errors
  // Handle PDF generation errors
  console.error("Offer letter generation failed:", error);
}
```

## Performance Notes

- PDF generation typically takes 1-2 seconds
- PDFs are saved to disk for record-keeping
- Files are automatically named with timestamps to avoid conflicts
- Regular cleanup recommended for old offer letters (optional)

## Dependencies

- `pdfkit` - PDF generation library (already in package.json)
- `fs` - File system module (Node.js built-in)
- `path` - Path module (Node.js built-in)
