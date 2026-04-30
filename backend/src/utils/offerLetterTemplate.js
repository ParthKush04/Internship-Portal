export const offerLetterTemplate = (data) => {
  // HARD DEBUG - Log exact data received
  console.log("TEMPLATE RECEIVED:", data);
  console.log("TEMPLATE DATA TYPE:", typeof data);
  console.log("TEMPLATE DATA KEYS:", Object.keys(data || {}));

  const {
    name,
    internshipType,
    startDate,
    duration,
    refNumber,
    hrContactName,
    hrContactEmail,
    hrContactPhone,
    studentEmail,
    studentPhone
  } = data;

  console.log("DESTRUCTURED VALUES:", { name, internshipType, startDate, duration });

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Internship Offer Letter - Provisioning Tech</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html, body {
        margin: 0;
        padding: 0;
      }

      body {
        font-family: 'Times New Roman', serif;
        background-color: white;
        color: #333;
      }

      .page {
        width: 100%;
        height: 100vh;
        page-break-after: always;
        position: relative;
        overflow: hidden;
      }

      /* ===== PAGE 1: COVER DESIGN ===== */
      .page-1 {
        background: white;
        display: flex;
        flex-direction: column;
        position: relative;
        overflow: hidden;
      }

      /* Diagonal Banner - THINK BIG */
      .page-1::before {
        content: 'PROVISIONING TECH\ATHINK BIG';
        position: absolute;
        top: -40px;
        left: -100px;
        width: 150%;
        height: 200px;
        background: linear-gradient(135deg, #A3271A 0%, #A3271A 70%, #FFB81C 70%);
        transform: rotate(-25deg);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 64px;
        font-weight: bold;
        color: #FFB81C;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        white-space: pre;
        z-index: 2;
      }

      /* Yellow geometric shapes on right */
      .page-1::after {
        content: '';
        position: absolute;
        top: 0;
        right: -50px;
        width: 400px;
        height: 400px;
        background: linear-gradient(135deg, transparent 30%, #FFB81C 30%, #FFB81C 35%, transparent 35%),
                    linear-gradient(45deg, transparent 40%, #FFB81C 40%, #FFB81C 45%, transparent 45%);
        transform: rotate(20deg);
        opacity: 0.3;
        pointer-events: none;
        z-index: 1;
      }

      .cover-top {
        background-color: #A3271A;
        padding: 20px 40px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        color: white;
        height: 80px;
        position: relative;
        z-index: 3;
      }

      .cover-top-left h1 {
        font-size: 26px;
        font-weight: bold;
        margin: 0;
        line-height: 1.2;
        letter-spacing: 1px;
      }

      .cover-top-left p {
        font-size: 11px;
        color: #FFB81C;
        margin: 4px 0 0 0;
        font-weight: 600;
        letter-spacing: 2px;
      }

      .cover-top-right {
        text-align: right;
        font-size: 9px;
        color: white;
        background: rgba(0,0,0,0.2);
        padding: 8px 12px;
        border-radius: 4px;
      }

      .cover-top-right p {
        margin: 3px 0;
        line-height: 1.3;
      }

      .cover-top-right strong {
        color: #FFB81C;
        font-weight: 700;
        display: block;
        margin-bottom: 2px;
      }

      .cover-top-right a {
        color: #FFB81C;
        text-decoration: none;
      }

      .cover-image {
        flex: 1;
        background: linear-gradient(135deg, #f9f9f9 0%, #f0f0f0 100%);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      /* Geometric shapes in image area */
      .cover-image::before {
        content: '';
        position: absolute;
        width: 200px;
        height: 300px;
        background: #A3271A;
        transform: rotate(-20deg) skewX(-10deg);
        opacity: 0.15;
        top: 20%;
        left: 10%;
      }

      .cover-image::after {
        content: '';
        position: absolute;
        width: 150px;
        height: 200px;
        background: #FFB81C;
        transform: rotate(15deg) skewX(5deg);
        opacity: 0.2;
        bottom: 15%;
        right: 15%;
      }

      /* Yellow accent shapes with clip-path */
      .cover-shapes {
        position: absolute;
        width: 400px;
        height: 400px;
        right: -100px;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.4;
        z-index: 1;
      }

      .shape-1 {
        position: absolute;
        width: 150px;
        height: 150px;
        background: #FFB81C;
        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
        left: 0;
        top: 50px;
        animation: float 4s ease-in-out infinite;
      }

      .shape-2 {
        position: absolute;
        width: 100px;
        height: 100px;
        background: #A3271A;
        clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
        right: 50px;
        top: 100px;
        transform: rotate(45deg);
        opacity: 0.5;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }

      .cover-bottom {
        height: 100px;
        display: flex;
        position: relative;
        z-index: 3;
      }

      .cover-bottom-red {
        flex: 1;
        background: linear-gradient(to bottom, #A3271A 0%, #8B1E14 100%);
        clip-path: polygon(0 0, 100% 20%, 100% 100%, 0 100%);
      }

      .cover-bottom-yellow {
        width: 45%;
        background: linear-gradient(to bottom, #FFB81C 0%, #F5A000 100%);
        clip-path: polygon(0 30%, 100% 0%, 100% 100%, 0 100%);
      }

      /* ===== PAGE 2: TITLE PAGE ===== */
      .page-2 {
        background: white;
        display: flex;
        flex-direction: column;
        position: relative;
        padding: 40px;
      }

      .page-2::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(to right, #A3271A 0%, #A3271A 60%, #FFB81C 60%, #FFB81C 100%);
      }

      .page-2::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: #FFB81C;
      }

      .title-header {
        text-align: center;
        margin-bottom: 20px;
        font-size: 12px;
      }

      .title-header span {
        color: #A3271A;
        font-weight: bold;
        border-bottom: 2px solid #A3271A;
        padding: 0 15px 5px 15px;
        letter-spacing: 1px;
      }

      .ref-no {
        font-size: 11px;
        margin-bottom: 20px;
        color: #333;
      }

      .ref-no-label {
        font-weight: bold;
        color: #A3271A;
      }

      .logo-area {
        text-align: center;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
      }

      /* Yellow accent circle behind logo */
      .logo-area::before {
        content: '';
        position: absolute;
        width: 180px;
        height: 180px;
        background: radial-gradient(circle, #FFB81C 0%, rgba(255,184,28,0.2) 100%);
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 0;
      }

      .logo-placeholder {
        width: 120px;
        height: 120px;
        border: 3px solid #A3271A;
        border-radius: 50%;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #A3271A;
        font-size: 50px;
        background: white;
        position: relative;
        z-index: 1;
        box-shadow: 0 4px 12px rgba(163, 39, 26, 0.2);
      }

      .logo-area h2 {
        color: #A3271A;
        font-size: 36px;
        font-weight: bold;
        margin: 0 0 8px 0;
        letter-spacing: 1px;
        position: relative;
        z-index: 1;
      }

      .logo-area p {
        color: #999;
        font-size: 14px;
        margin: 0 0 30px 0;
        letter-spacing: 2px;
        position: relative;
        z-index: 1;
      }

      .title-main {
        text-align: center;
        color: #999;
        font-size: 20px;
        margin-bottom: 50px;
        font-weight: 300;
        position: relative;
        z-index: 1;
      }

      .decorative-waves {
        height: 100px;
        display: flex;
        gap: 8px;
        justify-content: center;
        align-items: flex-end;
        position: relative;
        z-index: 1;
      }

      .wave {
        width: 40px;
        background: linear-gradient(to top, #A3271A 0%, #A3271A 35%, #FFB81C 35%, #FFB81C 65%, #A3271A 65%, #A3271A 100%);
        height: 80px;
        border-radius: 10px 10px 0 0;
        box-shadow: 0 4px 8px rgba(163, 39, 26, 0.15);
      }

      /* ===== PAGE 3: MAIN CONTENT ===== */
      .page-3,
      .page-4,
      .page-5,
      .page-6 {
        padding: 40px;
        font-size: 11px;
        line-height: 1.5;
      }

      .page-3::before {
        content: '';
        display: block;
        border-top: 2px solid #A3271A;
        margin-bottom: 15px;
      }

      .page-3::after,
      .page-4::after,
      .page-5::after {
        content: '';
        display: block;
        border-bottom: 1px solid #A3271A;
        margin-top: 15px;
      }

      .page-header {
        text-align: center;
        font-size: 10px;
        margin-bottom: 15px;
      }

      .page-header-text {
        font-weight: bold;
        color: #333;
      }

      .ref-section {
        margin-bottom: 15px;
        font-size: 10px;
      }

      .ref-section strong {
        display: block;
        margin-bottom: 3px;
      }

      .recipient-info {
        margin-bottom: 15px;
        font-size: 10px;
      }

      .recipient-info p {
        margin: 3px 0;
      }

      .greeting {
        margin-bottom: 10px;
        font-size: 11px;
      }

      .subject-line {
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 10px;
      }

      .body-text {
        margin-bottom: 8px;
        text-align: justify;
        font-size: 10px;
      }

      .body-text strong {
        font-weight: bold;
      }

      .terms-title {
        font-weight: bold;
        font-size: 11px;
        margin-top: 15px;
        margin-bottom: 8px;
      }

      .term-section {
        margin-bottom: 10px;
      }

      .term-section h4 {
        font-weight: bold;
        font-size: 10px;
        margin-bottom: 5px;
      }

      .term-section p {
        font-size: 9px;
        text-align: justify;
        margin-bottom: 4px;
      }

      .term-section ul {
        list-style: disc;
        margin-left: 20px;
        font-size: 9px;
      }

      .term-section ul li {
        margin-bottom: 3px;
      }

      .signature-section {
        margin-top: 15px;
        font-size: 10px;
      }

      .signature-section p {
        margin: 5px 0;
        font-style: italic;
      }

      .hr-contact {
        margin: 10px 0;
        font-size: 10px;
      }

      .hr-contact p {
        margin: 3px 0;
      }

      .documents-section {
        margin-top: 15px;
        font-size: 10px;
      }

      .documents-section h4 {
        font-weight: bold;
        margin-bottom: 8px;
      }

      .documents-section ul {
        list-style: disc;
        margin-left: 20px;
        font-size: 9px;
      }

      .documents-section ul li {
        margin-bottom: 3px;
      }

      .documents-note {
        font-size: 9px;
        margin-top: 8px;
      }

      .footer-contact {
        font-size: 9px;
        margin-top: 15px;
        padding-top: 10px;
        border-top: 1px solid #A3271A;
        color: #333;
      }

      .footer-contact p {
        margin: 4px 0;
        line-height: 1.4;
      }

      .footer-contact p strong {
        color: #A3271A;
        font-weight: 700;
      }

      .footer-contact a {
        color: #A3271A;
        text-decoration: none;
        font-weight: 600;
      }

      .footer-contact a:hover {
        text-decoration: underline;
      }

      /* Footer branding accent */
      .footer-branding {
        position: absolute;
        bottom: 20px;
        right: 20px;
        text-align: right;
        font-size: 8px;
        color: #A3271A;
      }

      .footer-branding::before {
        content: '';
        display: block;
        width: 40px;
        height: 40px;
        margin-left: auto;
        margin-bottom: 5px;
        border: 2px solid #FFB81C;
        border-radius: 50%;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .page {
          margin: 0;
          box-shadow: none;
          page-break-after: always;
        }
      }
    </style>
  </head>
  <body>
    <!-- PAGE 1: COVER DESIGN -->
    <div class="page page-1">
      <div class="cover-top">
        <div class="cover-top-left">
          <h1>PROVISIONING TECH</h1>
          <p>COMPLETE IT SOLUTION</p>
        </div>
        <div class="cover-top-right">
          <p><strong>E – Mail Us</strong></p>
          <p>info@provisioningtech.com</p>
          <p style="margin-top: 8px;"><strong>Visit Us</strong></p>
          <p>www.provisioningtech.com</p>
          <p style="margin-top: 8px;"><strong>Call Us</strong></p>
          <p>+91– 6397650818</p>
        </div>
      </div>
      <div class="cover-image">
        <!-- Geometric shapes container -->
        <div class="cover-shapes">
          <div class="shape-1"></div>
          <div class="shape-2"></div>
        </div>
      </div>
      <div class="cover-bottom">
        <div class="cover-bottom-red"></div>
        <div class="cover-bottom-yellow"></div>
      </div>
    </div>

    <!-- PAGE 2: TITLE PAGE -->
    <div class="page page-2">
      <div class="title-header">
        <span>PROVISIONING TECH | COMPLETE IT SOLUTION</span>
      </div>

      <div class="ref-no">
        <span class="ref-no-label">REF NO:</span>
        <div>HR/INT/2026/###</div>
      </div>

      <div class="logo-area">
        <div class="logo-placeholder">▶</div>
        <h2>PROVISIONING TECH</h2>
        <p>Complete IT Solution</p>
        <div class="title-main">Internship offer Letter</div>
      </div>

      <div class="decorative-waves">
        <div class="wave"></div>
        <div class="wave"></div>
        <div class="wave"></div>
      </div>
    </div>

    <!-- PAGE 3: MAIN CONTENT START -->
    <div class="page page-3">
      <div class="page-header">
        <span class="page-header-text">PROVISIONING TECH | COMPLETE IT SOLUTION</span>
      </div>

      <div class="ref-section">
        <strong>REF NO:</strong>
        <div>HR/INT/2026/###</div>
      </div>

      <div class="recipient-info">
        <p><strong>Name –</strong> ${name}</p>
        <p><strong>Start Date-</strong> ${startDate}</p>
      </div>

      <div class="greeting">
        <p>Dear, Mr. ${name}</p>
      </div>

      <div class="subject-line">
        <p>SUB: Internship Offer Letter for the post of ${internshipType}</p>
      </div>

      <div class="body-text">
        <p>This has reference to your application for internship with our organization. We are pleased to offer you an <strong>Internship for the position of ${internshipType}</strong> with our company.</p>
      </div>

      <div class="body-text">
        <p>Your internship will commence from <strong>${startDate}</strong>. This internship will provide you with practical exposure and learning opportunities in web development technologies related to the ${internshipType}.</p>
      </div>

      <div class="body-text">
        <p><strong>Please note that this is an Unpaid Internship (No Stipend)</strong> and no financial remuneration will be provided during the internship period. The purpose of this internship is to provide hands-on experience, industry exposure, and skill development.</p>
      </div>

      <div class="body-text">
        <p>During the internship period, you will be expected to maintain discipline, complete assigned tasks, and follow company policies and guidelines.</p>
      </div>

      <div class="body-text">
        <p>Upon successful completion of the internship and satisfactory performance, the company may provide an <strong>Internship Completion Certificate and Experience Letter.</strong></p>
      </div>

      <div class="body-text">
        <p>We welcome you to the team and wish you a successful learning experience with us.</p>
      </div>

      <div class="body-text">
        <p><strong>Internship Period:</strong> ${duration} months</p>
      </div>

      <div class="terms-title">TERMS AND CONDITIONS OF INTERNSHIP OFFER</div>

      <div class="term-section">
        <h4>1. Internship Period</h4>
        <p>You will initially be engaged as an <strong>Intern for a period of ${duration} months</strong> starting from the date mentioned in this letter. The internship period may be <strong>extended or shortened at the sole discretion of the Company</strong> based on your performance and project requirements.</p>
        <p>This internship is <strong>purely for training and learning purposes and does not constitute permanent employment</strong> with the Company.</p>
      </div>

      <div class="term-section">
        <h4>2. Unpaid Internship</h4>
        <p>This internship is <strong>unpaid, and no stipend or financial remuneration will be provided</strong> during the internship period. The purpose of this internship is to provide practical exposure, technical learning, and real-world project experience.</p>
      </div>
    </div>

    <!-- PAGE 4: TERMS CONTINUED -->
    <div class="page page-4">
      <div class="page-header">
        <span class="page-header-text">PROVISIONING TECH | COMPLETE IT SOLUTION</span>
      </div>

      <div class="term-section">
        <h4>3. Termination</h4>
        <p>During the internship period, either the Company or the Intern may terminate the internship <strong>without prior notice</strong> if required.</p>
        <p>The Company reserves the right to terminate the internship immediately if:</p>
        <ul>
          <li>Any information provided by the intern is found to be false.</li>
          <li>Company rules or policies are violated.</li>
          <li>Performance is found unsatisfactory.</li>
        </ul>
      </div>

      <div class="term-section">
        <h4>4. Verification of Information</h4>
        <p>If any information provided by you in your application, resume, or documents is found to be <strong>false, misleading, or incorrect,</strong> the Company reserves the right to <strong>terminate the internship immediately without any further notice.</strong></p>
      </div>

      <div class="term-section">
        <h4>5. Duties and Responsibilities</h4>
        <p>(a) You are expected to work with <strong>discipline, sincerity, and efficiency</strong> while performing your assigned tasks.</p>
        <p>(b) During the internship period, you shall <strong>not engage directly or indirectly in any activity, business, or employment</strong> that may conflict with the interests of the Company.</p>
        <p>(c) You must <strong>maintain strict confidentiality</strong> regarding any company information, project data, source code, client information, technical processes, or internal documentation during and after the internship period.</p>
        <p>(d) All project files, source code, documents, or materials developed during the internship <strong>will remain the property of the Company.</strong></p>
        <p>(e) The intern is expected to <strong>complete assigned tasks or projects within the given timeline</strong> provided by the Company.</p>
        <p>(f) If the intern leaves the internship before completing the assigned project, the intern must <strong>submit all project files, source code, and related materials</strong> to the Company.</p>
      </div>

      <div class="term-section">
        <h4>6. Performance Evaluation</h4>
        <p>Your performance will be evaluated based on <strong>work quality, punctuality, discipline, learning ability, and project completion.</strong> Based on satisfactory performance and company requirements, the Company <strong>may consider future employment opportunities, but this is not guaranteed.</strong></p>
      </div>
    </div>

    <!-- PAGE 5: TERMS FINAL SECTIONS -->
    <div class="page page-5">
      <div class="page-header">
        <span class="page-header-text">PROVISIONING TECH | COMPLETE IT SOLUTION</span>
      </div>

      <div class="term-section">
        <h4>7. Company Policies</h4>
        <p>During the internship period, you will be required to follow <strong>all company rules, policies, and guidelines</strong> as may be in force or updated from time to time.</p>
      </div>

      <div class="term-section">
        <h4>8. Internship Completion Certificate</h4>
        <p>Upon successful completion of the internship and satisfactory performance, the Company will issue an <strong>Internship Completion Certificate.</strong></p>
      </div>

      <div class="term-section">
        <h4>9. Acceptance of Offer</h4>
        <p>You are requested to sign and return a copy of this letter as a <strong>token of acceptance of the terms and conditions of this internship.</strong></p>
        <p>We are excited to have you join our team! If you have any questions, please feel free to reach out at any time.</p>
      </div>

      <div class="signature-section">
        <p>For and on behalf of Company</p>
      </div>

      <div class="hr-contact">
        <p><strong>Name:</strong> Parth Kushwaha</p>
        <p><strong>Email:</strong> ${studentEmail || hrContactEmail || ""}</p>
        <p><strong>Mobile:</strong> ${studentPhone || hrContactPhone || ""}</p>
      </div>
    </div>

    <!-- PAGE 6: DOCUMENTS & FOOTER -->
    <div class="page page-6">
      <div class="page-header">
        <span class="page-header-text">PROVISIONING TECH | COMPLETE IT SOLUTION</span>
      </div>

      <div class="documents-section">
        <h4>Provide some document through E-mail :</h4>
        <ul>
          <li>Aadhar Card</li>
          <li>Bank Passbook</li>
          <li>Last Academic Qualification</li>
        </ul>
        <div class="documents-note">
          <p>You may be fired from the company, if your documents do not contain the correct declaration..</p>
        </div>
      </div>

      <div style="margin-top: 40px; border-top: 1px solid #A3271A; padding-top: 15px;">
        <div class="footer-contact">
          <p><strong>Phone</strong> - +91– 8650559698</p>
          <p><strong>Email</strong> - info@provisioningtech.com</p>
          <p><a href="http://www.provisioningtech.com">www.provisioningtech.com</a></p>
        </div>
      </div>

      <!-- Footer Branding -->
      <div class="footer-branding">
        PROVISIONING TECH<br/>
        <small>COMPLETE IT SOLUTION</small>
      </div>
    </div>
  </body>
  </html>
  `;
};
