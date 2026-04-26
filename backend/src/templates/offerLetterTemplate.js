// Offer Letter HTML Template for Provisioning Tech
const offerLetterTemplate = (data) => {
  const {
    refNumber = "HR/INT/2026/001",
    studentName = "Student Name",
    startDate = "06/03/2026",
    role = "Internship Position",
    duration = "3",
    hrContactName = "Parth Kushwaha",
    hrContactEmail = "parthkush1000@gmail.com",
    hrContactPhone = "+91- 9044775397"
  } = data;

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

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }

        .page {
            width: 210mm;
            height: 297mm;
            margin: 0 auto;
            background: white;
            page-break-after: always;
        }

        /* ===== PAGE 1: COVER PAGE ===== */
        .page-cover {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 0;
        }

        .header-banner {
            background-color: #A3271A;
            color: white;
            padding: 15px 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .header-left h1 {
            font-size: 28px;
            font-weight: bold;
            margin: 0;
            color: white;
        }

        .header-left p {
            font-size: 10px;
            color: #FFB81C;
            margin: 5px 0 0 0;
        }

        .header-right {
            text-align: right;
            font-size: 9px;
            color: #000;
        }

        .header-right p {
            margin: 5px 0;
            color: #000;
        }

        .header-right a {
            color: #FFB81C;
            text-decoration: none;
        }

        .left-border {
            position: absolute;
            left: 0;
            top: 70px;
            width: 20px;
            height: 650px;
            background-color: #FFB81C;
        }

        .cover-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 60px 40px;
            margin-top: 70px;
        }

        .cover-content h2 {
            font-size: 36px;
            color: #A3271A;
            font-weight: bold;
            margin: 0 0 10px 0;
        }

        .cover-content p {
            font-size: 14px;
            color: #666;
            margin: 0;
        }

        .cover-content h3 {
            font-size: 20px;
            color: #666;
            margin-top: 60px;
            font-weight: normal;
        }

        .cover-footer {
            display: flex;
            height: 90px;
            margin-top: auto;
        }

        .cover-footer-red {
            flex: 1;
            background-color: #A3271A;
        }

        .cover-footer-yellow {
            width: 50%;
            background-color: #FFB81C;
        }

        /* ===== PAGE 2 & 3: CONTENT PAGES ===== */
        .page-content {
            padding: 40px;
            font-size: 10px;
            line-height: 1.6;
        }

        .page-content h3 {
            font-size: 11px;
            font-weight: bold;
            margin: 15px 0 8px 0;
        }

        .page-content p {
            margin: 8px 0;
            text-align: justify;
        }

        .ref-details {
            padding-bottom: 15px;
            border-bottom: 2px solid #A3271A;
            margin-bottom: 15px;
        }

        .ref-no {
            font-weight: bold;
            margin-bottom: 8px;
        }

        .recipient-info {
            margin-bottom: 15px;
            font-size: 10px;
        }

        .recipient-info p {
            margin: 4px 0;
        }

        .greeting {
            margin-bottom: 10px;
            font-size: 10px;
        }

        .subject {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 10px;
        }

        .body-text {
            margin-bottom: 10px;
            text-align: justify;
        }

        .bold-inline {
            font-weight: bold;
        }

        .terms-section {
            margin-top: 15px;
            margin-bottom: 10px;
        }

        .terms-title {
            font-size: 11px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .term-item {
            margin-bottom: 10px;
            font-size: 9px;
            text-align: justify;
        }

        .term-item h4 {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .signature-section {
            margin-top: 20px;
            font-size: 10px;
        }

        .signature-section p {
            margin: 8px 0;
            font-style: italic;
        }

        .hr-details {
            margin: 15px 0;
            font-size: 10px;
        }

        .hr-details p {
            margin: 4px 0;
        }

        .documents-section {
            margin-top: 15px;
            font-size: 10px;
        }

        .documents-section h4 {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 10px;
        }

        .documents-section ul {
            list-style: none;
            padding-left: 20px;
            margin: 5px 0 10px 0;
        }

        .documents-section li {
            margin: 4px 0;
        }

        .documents-section li:before {
            content: "• ";
            font-weight: bold;
            margin-right: 5px;
        }

        .footer-border {
            border-top: 1px solid #A3271A;
            margin-top: 15px;
            padding-top: 10px;
        }

        .footer-info {
            font-size: 9px;
            color: #333;
        }

        .footer-info p {
            margin: 3px 0;
        }

        .footer-info a {
            color: #A3271A;
            text-decoration: none;
        }

        @media print {
            body {
                margin: 0;
                padding: 0;
            }
            .page {
                margin: 0;
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <!-- PAGE 1: COVER PAGE -->
    <div class="page page-cover">
        <!-- Header Banner -->
        <div class="header-banner">
            <div class="header-left">
                <h1>PROVISIONING TECH</h1>
                <p>COMPLETE IT SOLUTION</p>
            </div>
            <div class="header-right">
                <p><strong>E – Mail Us</strong></p>
                <p>info@provisioningtech.com</p>
                <p style="margin-top: 10px;"><strong>Visit Us</strong></p>
                <p>www.provisioningtech.com</p>
            </div>
        </div>

        <!-- Yellow Left Border -->
        <div class="left-border"></div>

        <!-- Cover Content -->
        <div class="cover-content">
            <h2>PROVISIONING TECH</h2>
            <p>Complete IT Solution</p>
            <h3>Internship offer Letter</h3>
        </div>

        <!-- Cover Footer -->
        <div class="cover-footer">
            <div class="cover-footer-red"></div>
            <div class="cover-footer-yellow"></div>
        </div>
    </div>

    <!-- PAGE 2: MAIN CONTENT -->
    <div class="page page-content">
        <!-- Reference Number Section -->
        <div class="ref-details">
            <div class="ref-no">REF NO:</div>
            <div>${refNumber}</div>
        </div>

        <!-- Recipient Information -->
        <div class="recipient-info">
            <p><strong>Name –</strong> ${studentName}</p>
            <p><strong>Start Date-</strong> ${startDate}</p>
        </div>

        <!-- Greeting -->
        <div class="greeting">
            <p>Dear, Mr. ${studentName}</p>
        </div>

        <!-- Subject Line -->
        <div class="subject">
            <p>SUB: Internship Offer Letter for the post of ${role}</p>
        </div>

        <!-- Main Body -->
        <div class="body-text">
            <p>This has reference to your application for internship with our organization. We are pleased to offer you an <span class="bold-inline">Internship for the position of ${role}</span> with our company.</p>
        </div>

        <div class="body-text">
            <p>Your internship will commence from <strong>${startDate}</strong>. This internship will provide you with practical exposure and learning opportunities in web development technologies related to the ${role}.</p>
        </div>

        <div class="body-text">
            <p><span class="bold-inline">Please note that this is an Unpaid Internship (No Stipend)</span> and no financial remuneration will be provided during the internship period. The purpose of this internship is to provide hands-on experience, industry exposure, and skill development.</p>
        </div>

        <div class="body-text">
            <p>During the internship period, you will be expected to maintain discipline, complete assigned tasks, and follow company policies and guidelines.</p>
        </div>

        <div class="body-text">
            <p>Upon successful completion of the internship and satisfactory performance, the company may provide an <span class="bold-inline">Internship Completion Certificate and Experience Letter.</span></p>
        </div>

        <div class="body-text">
            <p>We welcome you to the team and wish you a successful learning experience with us.</p>
        </div>

        <!-- Terms and Conditions -->
        <div class="terms-section">
            <div class="terms-title">TERMS AND CONDITIONS OF INTERNSHIP OFFER</div>

            <div class="term-item">
                <h4>1. Internship Period</h4>
                <p>You will initially be engaged as an <span class="bold-inline">Intern for a period of ${duration} months</span> starting from the date mentioned in this letter. The internship period may be <span class="bold-inline">extended or shortened at the sole discretion of the Company</span> based on your performance and project requirements.</p>
                <p>This internship is <span class="bold-inline">purely for training and learning purposes and does not constitute permanent employment</span> with the Company.</p>
            </div>

            <div class="term-item">
                <h4>2. Unpaid Internship</h4>
                <p>This internship is <span class="bold-inline">unpaid, and no stipend or financial remuneration will be provided</span> during the internship period. The purpose of this internship is to provide practical exposure, technical learning, and real-world project experience.</p>
            </div>
        </div>
    </div>

    <!-- PAGE 3: TERMS CONTINUED -->
    <div class="page page-content">
        <div class="terms-section">
            <div class="term-item">
                <h4>3. Termination</h4>
                <p>During the internship period, either the Company or the Intern may terminate the internship <span class="bold-inline">without prior notice</span> if required.</p>
                <p>The Company reserves the right to terminate the internship immediately if:</p>
                <ul style="list-style-type: disc; margin-left: 20px;">
                    <li>Any information provided by the intern is found to be false.</li>
                    <li>Company rules or policies are violated.</li>
                    <li>Performance is found unsatisfactory.</li>
                </ul>
            </div>

            <div class="term-item">
                <h4>4. Verification of Information</h4>
                <p>If any information provided by you in your application, resume, or documents is found to be <span class="bold-inline">false, misleading, or incorrect,</span> the Company reserves the right to <span class="bold-inline">terminate the internship immediately without any further notice.</span></p>
            </div>

            <div class="term-item">
                <h4>5. Duties and Responsibilities</h4>
                <p>(a) You are expected to work with <span class="bold-inline">discipline, sincerity, and efficiency</span> while performing your assigned tasks.</p>
                <p>(b) During the internship period, you shall <span class="bold-inline">not engage directly or indirectly in any activity, business, or employment</span> that may conflict with the interests of the Company.</p>
                <p>(c) You must <span class="bold-inline">maintain strict confidentiality</span> regarding any company information, project data, source code, client information, technical processes, or internal documentation during and after the internship period.</p>
                <p>(d) All project files, source code, documents, or materials developed during the internship <span class="bold-inline">will remain the property of the Company.</span></p>
                <p>(e) The intern is expected to <span class="bold-inline">complete assigned tasks or projects within the given timeline</span> provided by the Company.</p>
                <p>(f) If the intern leaves the internship before completing the assigned project, the intern must <span class="bold-inline">submit all project files, source code, and related materials</span> to the Company.</p>
            </div>

            <div class="term-item">
                <h4>6. Performance Evaluation</h4>
                <p>Your performance will be evaluated based on <span class="bold-inline">work quality, punctuality, discipline, learning ability, and project completion.</span> Based on satisfactory performance and company requirements, the Company <span class="bold-inline">may consider future employment opportunities, but this is not guaranteed.</span></p>
            </div>

            <div class="term-item">
                <h4>7. Company Policies</h4>
                <p>During the internship period, you will be required to follow <span class="bold-inline">all company rules, policies, and guidelines</span> as may be in force or updated from time to time.</p>
            </div>

            <div class="term-item">
                <h4>8. Internship Completion Certificate</h4>
                <p>Upon successful completion of the internship and satisfactory performance, the Company will issue an <span class="bold-inline">Internship Completion Certificate.</span></p>
            </div>

            <div class="term-item">
                <h4>9. Acceptance of Offer</h4>
                <p>You are requested to sign and return a copy of this letter as a <span class="bold-inline">token of acceptance of the terms and conditions of this internship.</span></p>
                <p>We are excited to have you join our team! If you have any questions, please feel free to reach out at any time.</p>
            </div>
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <p>For and on behalf of Company</p>
        </div>

        <div class="hr-details">
            <p><strong>Name:</strong> ${hrContactName}</p>
            <p><strong>Email:</strong> ${hrContactEmail}</p>
            <p><strong>Mobile:</strong> ${hrContactPhone}</p>
        </div>

        <!-- Documents Required -->
        <div class="documents-section">
            <h4>Provide some document through E-mail :</h4>
            <ul>
                <li>Aadhar Card</li>
                <li>Bank Passbook</li>
                <li>Last Academic Qualification</li>
            </ul>
            <p>You may be fired from the company, if your documents do not contain the correct declaration..</p>
        </div>

        <!-- Footer -->
        <div class="footer-border">
            <div class="footer-info">
                <p>Phone - +91– 8650559698</p>
                <p>Email - info@provisioningtech.com</p>
                <p><a href="http://www.provisioningtech.com">www.provisioningtech.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

export default offerLetterTemplate;
