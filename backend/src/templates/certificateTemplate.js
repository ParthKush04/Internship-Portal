const certificateTemplate = (data) => {
  const {
    studentName = "Student Name",
    internshipType = "Internship Position",
    startDate = "01/01/2026",
    endDate = "31/12/2026",
    certificateNumber = "CERT/2026/001",
    companyName = "Provisioning Tech",
    companyTagline = "Complete IT Solution"
  } = data || {};

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Internship Completion Certificate</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
    }

    body {
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .certificate {
      width: 100%;
      max-width: 900px;
      aspect-ratio: 16 / 12.5;
      background: white;
      position: relative;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1), 0 0 0 8px rgba(163, 39, 26, 0.08), inset 0 0 0 2px #DAA520;
      border: 3px solid #A3271A;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 80px;
      background-image: 
        radial-gradient(circle at 10% 10%, rgba(255, 184, 28, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 90% 90%, rgba(163, 39, 26, 0.03) 0%, transparent 50%);
    }

    /* Watermark background */
    .certificate::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 500px;
      height: 500px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><text x="100" y="100" font-size="80" font-weight="bold" text-anchor="middle" fill="rgba(163,39,26,0.08)" font-family="Georgia">PT</text></svg>');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      z-index: 0;
      opacity: 0.5;
      pointer-events: none;
    }

    /* Decorative top gold border */
    .top-border {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 12px;
      background: linear-gradient(to right, #A3271A 0%, #A3271A 30%, #DAA520 50%, #FFB81C 70%, #A3271A 100%);
      box-shadow: 0 2px 8px rgba(218, 165, 32, 0.3);
    }

    /* Decorative bottom gold border */
    .bottom-border {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 12px;
      background: linear-gradient(to right, #A3271A 0%, #FFB81C 30%, #DAA520 50%, #FFB81C 70%, #A3271A 100%);
      box-shadow: 0 -2px 8px rgba(218, 165, 32, 0.3);
    }

    /* Left decorative stripe */
    .left-stripe {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 16px;
      background: linear-gradient(to bottom, #FFB81C, #DAA520, #A3271A);
      box-shadow: 2px 0 8px rgba(163, 39, 26, 0.2);
    }

    /* Right decorative stripe */
    .right-stripe {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      width: 16px;
      background: linear-gradient(to bottom, #A3271A, #DAA520, #FFB81C);
      box-shadow: -2px 0 8px rgba(163, 39, 26, 0.2);
    }

    /* Decorative corner circles */
    .corner-accent {
      position: absolute;
      width: 30px;
      height: 30px;
      border: 2px solid #DAA520;
      border-radius: 50%;
    }

    .corner-tl {
      top: 15px;
      left: 15px;
    }

    .corner-tr {
      top: 15px;
      right: 15px;
    }

    .corner-bl {
      bottom: 15px;
      left: 15px;
    }

    .corner-br {
      bottom: 15px;
      right: 15px;
    }

    .content {
      position: relative;
      z-index: 2;
      text-align: center;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .header {
      margin-bottom: 20px;
    }

    .company-name {
      font-size: 42px;
      font-weight: bold;
      color: #A3271A;
      letter-spacing: 2px;
      margin-bottom: 5px;
    }

    .company-tagline {
      font-size: 14px;
      color: #FFB81C;
      font-weight: 600;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    .certificate-title {
      font-size: 48px;
      font-weight: bold;
      color: #333;
      margin: 30px 0 10px 0;
      letter-spacing: 1px;
    }

    .certificate-subtitle {
      font-size: 14px;
      color: #666;
      font-style: italic;
      margin-bottom: 30px;
      position: relative;
      padding-bottom: 15px;
    }

    .certificate-subtitle::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 2px;
      background: linear-gradient(to right, transparent, #DAA520 20%, #FFB81C 50%, #DAA520 80%, transparent);
    }

    .recipient {
      margin: 30px 0;
    }

    .recipient-label {
      font-size: 14px;
      color: #555;
      margin-bottom: 10px;
    }

    .recipient-name {
      font-size: 38px;
      font-weight: bold;
      color: #A3271A;
      border-bottom: 3px solid #FFB81C;
      padding-bottom: 8px;
      margin: 0 auto;
      max-width: 600px;
      letter-spacing: 1px;
    }

    .details {
      margin: 30px 0;
      font-size: 15px;
      line-height: 2;
      color: #333;
    }

    .detail-line {
      margin: 12px 0;
    }

    .detail-label {
      font-weight: bold;
      color: #A3271A;
    }

    .detail-value {
      color: #333;
    }

    .statement {
      margin: 30px auto;
      max-width: 700px;
      font-size: 14px;
      line-height: 1.8;
      color: #333;
      font-style: italic;
      position: relative;
      padding: 15px 0;
    }

    .statement::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 2px;
      background: linear-gradient(to right, transparent, #DAA520 20%, #FFB81C 50%, #DAA520 80%, transparent);
    }

    .statement::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 120px;
      height: 2px;
      background: linear-gradient(to right, transparent, #DAA520 20%, #FFB81C 50%, #DAA520 80%, transparent);
    }

    .signatures {
      display: flex;
      justify-content: space-around;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 2px solid #FFB81C;
    }

    .signature-block {
      text-align: center;
      flex: 1;
    }

    .signature-line {
      width: 150px;
      height: 3px;
      background: #A3271A;
      margin-bottom: 5px;
    }

    .signature-name {
      font-weight: bold;
      font-size: 13px;
      color: #333;
      margin-top: 5px;
    }

    .signature-title {
      font-size: 11px;
      color: #666;
      margin-top: 3px;
    }

    .certificate-number {
      position: absolute;
      bottom: 20px;
      right: 30px;
      font-size: 11px;
      color: #999;
      font-family: 'Courier New', monospace;
    }

    .seal {
      position: absolute;
      bottom: 30px;
      left: 30px;
      width: 70px;
      height: 70px;
      border: 4px solid #DAA520;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: #DAA520;
      font-weight: bold;
      background: radial-gradient(circle at 30% 30%, rgba(218, 165, 32, 0.1), transparent);
      box-shadow: 0 0 20px rgba(218, 165, 32, 0.3), inset 0 0 10px rgba(218, 165, 32, 0.1);
      z-index: 3;
    }

    @media print {
      body {
        padding: 0;
      }

      .certificate {
        box-shadow: none;
        max-width: 100%;
        aspect-ratio: auto;
      }
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="top-border"></div>
    <div class="bottom-border"></div>
    <div class="left-stripe"></div>
    <div class="right-stripe"></div>
    
    <!-- Corner accents -->
    <div class="corner-accent corner-tl"></div>
    <div class="corner-accent corner-tr"></div>
    <div class="corner-accent corner-bl"></div>
    <div class="corner-accent corner-br"></div>
    
    <div class="seal">★</div>

    <div class="content">
      <div class="header">
        <div class="company-name">${companyName}</div>
        <div class="company-tagline">${companyTagline}</div>
      </div>

      <div>
        <div class="certificate-title">Certificate of Completion</div>
        <div class="certificate-subtitle">Internship Program</div>

        <div class="recipient">
          <div class="recipient-label">This is to certify that</div>
          <div class="recipient-name">${studentName}</div>
        </div>

        <div class="statement">
          Has successfully completed an internship in <strong>${internshipType}</strong>
          demonstrating commitment, dedication, and proficiency in practical application of technical skills.
        </div>

        <div class="details">
          <div class="detail-line">
            <span class="detail-label">Program:</span>
            <span class="detail-value">${internshipType}</span>
          </div>
          <div class="detail-line">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">${startDate} to ${endDate}</span>
          </div>
        </div>

        <div class="signatures">
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">Internship Coordinator</div>
            <div class="signature-title">${companyName}</div>
          </div>
          <div class="signature-block">
            <div class="signature-line"></div>
            <div class="signature-name">Program Manager</div>
            <div class="signature-title">${companyName}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="certificate-number">${certificateNumber}</div>
  </div>
</body>
</html>
  `;
};

export default certificateTemplate;
