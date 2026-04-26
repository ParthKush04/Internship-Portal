import PDFDocument from "pdfkit";

export const generateOfferLetter = (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on("error", reject);

    // Header
    doc
      .fontSize(18)
      .text("PROVISIONING TECH", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .text("Complete IT Solution", { align: "center" })
      .moveDown(2);

    // Title
    doc
      .fontSize(16)
      .text("Internship Offer Letter", { align: "center" })
      .moveDown(2);

    // Dynamic content
    doc.fontSize(12);

    doc.text(`Name: ${data.name}`);
    doc.text(`Role: ${data.internshipType}`);
    doc.text(`Start Date: ${data.startDate}`);
    doc.text(`Duration: ${data.duration} months`);
    doc.moveDown();

    doc.text(`Dear ${data.name},`);
    doc.moveDown();

    doc.text(
      `We are pleased to offer you the position of ${data.internshipType} Intern at Provisioning Tech.`
    );

    doc.moveDown();

    doc.text(
      `Your internship will commence from ${data.startDate} for a duration of ${data.duration} months.`
    );

    doc.moveDown();

    doc.text("This is an unpaid internship focused on learning and practical exposure.");

    doc.moveDown();

    doc.text("We welcome you and wish you success.");

    doc.end();
  });
};