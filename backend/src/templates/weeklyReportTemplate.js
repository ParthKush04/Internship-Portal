const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderParagraphList = (items, emptyText = "Not available") => {
  if (!items || items.length === 0) {
    return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  }

  return items
    .map((item) => `<p class="list-item">${escapeHtml(item)}</p>`)
    .join("");
};

const weeklyReportTemplate = (data) => {
  const {
    application = {},
    metrics = {},
    summary = {},
    weeklyBreakdown = [],
    generatedAt = new Date().toISOString()
  } = data || {};

  const studentName = [application?.studentId?.name, `${application?.firstName || ""} ${application?.lastName || ""}`.trim()]
    .filter(Boolean)
    .join(" / ") || "Student Name";

  const internshipType = application?.assignedInternship || application?.internshipPreference || "Internship Program";
  const duration = application?.duration || "Not available";
  const totalHours = Number(metrics?.totalHours || 0);
  const totalWeeks = Number(metrics?.totalWeeks || 0);
  const performanceRating = summary?.overallPerformance || "Not available";
  const adminFeedback = summary?.adminFeedback || "No admin feedback has been recorded yet.";

  const weeklyCards = weeklyBreakdown.length
    ? weeklyBreakdown
        .map((week) => {
          const tasks = escapeHtml(week.tasksCompleted || "Not available");
          const achievements = escapeHtml(week.achievements || "Not available");
          const challenges = escapeHtml(week.challenges || "Not available");

          return `
            <section class="week-card">
              <div class="week-header">
                <div>
                  <div class="week-label">Week ${week.weekNumber}</div>
                  <div class="week-range">${escapeHtml(week.weekRange || "Not available")}</div>
                </div>
                <div class="week-meta">${escapeHtml(week.status || "pending")}</div>
              </div>

              <div class="week-grid">
                <div class="week-block">
                  <h4>Tasks</h4>
                  <p>${tasks}</p>
                </div>
                <div class="week-block">
                  <h4>Achievements</h4>
                  <p>${achievements}</p>
                </div>
                <div class="week-block">
                  <h4>Challenges</h4>
                  <p>${challenges}</p>
                </div>
                <div class="week-block compact">
                  <h4>Hours</h4>
                  <p>${Number(week.hoursWorked || 0)} hrs</p>
                </div>
              </div>
            </section>
          `;
        })
        .join("")
    : `<div class="empty-state">No weekly logs were submitted for this internship.</div>`;

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Weekly Report - Provisioning Tech</title>
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #f3f4f6; }
      body {
        font-family: Georgia, serif;
        color: #1f2937;
        padding: 22px;
      }
      .report {
        max-width: 1100px;
        margin: 0 auto;
        background: #fff;
        border: 3px solid #a3271a;
        box-shadow: 0 12px 30px rgba(0,0,0,0.08), 0 0 0 8px rgba(163,39,26,0.06);
        position: relative;
        overflow: hidden;
      }
      .report::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(circle at 10% 10%, rgba(255, 184, 28, 0.07) 0%, transparent 35%),
          radial-gradient(circle at 90% 90%, rgba(163, 39, 26, 0.05) 0%, transparent 35%);
        pointer-events: none;
      }
      .accent-top, .accent-bottom {
        height: 12px;
        background: linear-gradient(to right, #a3271a 0%, #a3271a 35%, #ffb81c 52%, #a3271a 100%);
      }
      .accent-bottom {
        background: linear-gradient(to right, #a3271a 0%, #ffb81c 40%, #a3271a 100%);
      }
      .content {
        position: relative;
        z-index: 1;
        padding: 36px 46px 42px;
      }
      .brand-row {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
        padding-bottom: 22px;
        border-bottom: 2px solid rgba(255,184,28,0.6);
      }
      .brand h1 {
        margin: 0;
        font-size: 34px;
        letter-spacing: 1px;
        color: #a3271a;
      }
      .brand p {
        margin: 4px 0 0;
        font-size: 12px;
        letter-spacing: 3px;
        text-transform: uppercase;
        color: #b45309;
        font-weight: 700;
      }
      .meta-box {
        min-width: 250px;
        text-align: right;
        font-size: 12px;
        color: #374151;
        background: linear-gradient(180deg, #fff8e7, #fffdf7);
        border: 1px solid rgba(255,184,28,0.7);
        border-radius: 14px;
        padding: 14px 16px;
      }
      .hero {
        padding: 28px 0 18px;
        text-align: center;
      }
      .hero h2 {
        margin: 0;
        font-size: 34px;
        color: #111827;
        letter-spacing: 1px;
      }
      .hero p {
        margin: 10px auto 0;
        max-width: 760px;
        font-size: 14px;
        color: #6b7280;
        line-height: 1.7;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
        margin: 24px 0 28px;
      }
      .info-card {
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        padding: 16px 18px;
        background: #fff;
        box-shadow: 0 1px 0 rgba(0,0,0,0.02);
      }
      .info-card .label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1.4px;
        color: #9ca3af;
        margin-bottom: 8px;
      }
      .info-card .value {
        font-size: 17px;
        font-weight: 700;
        color: #1f2937;
      }
      .section-title {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 30px 0 16px;
      }
      .section-title h3 {
        margin: 0;
        font-size: 22px;
        color: #a3271a;
      }
      .section-title .line {
        flex: 1;
        height: 2px;
        background: linear-gradient(to right, rgba(163,39,26,0.6), rgba(255,184,28,0.9), transparent);
      }
      .week-card {
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        padding: 18px 18px 16px;
        background: linear-gradient(180deg, #ffffff, #fafafa);
        margin-bottom: 14px;
        page-break-inside: avoid;
      }
      .week-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 14px;
        margin-bottom: 14px;
      }
      .week-label {
        font-size: 18px;
        font-weight: 700;
        color: #111827;
      }
      .week-range {
        margin-top: 4px;
        font-size: 12px;
        color: #6b7280;
      }
      .week-meta {
        border-radius: 999px;
        background: #fff7ed;
        color: #c2410c;
        border: 1px solid #fdba74;
        padding: 6px 12px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .week-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .week-block {
        border-radius: 14px;
        padding: 14px 14px 12px;
        background: #fff;
        border: 1px solid #e5e7eb;
      }
      .week-block.compact {
        grid-column: span 2;
      }
      .week-block h4 {
        margin: 0 0 8px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        color: #a3271a;
      }
      .week-block p, .summary-card p {
        margin: 0;
        font-size: 13px;
        line-height: 1.7;
        color: #374151;
        white-space: pre-line;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 14px;
      }
      .summary-card {
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        background: #fff;
        padding: 16px 18px;
      }
      .summary-card.full {
        grid-column: span 2;
      }
      .summary-card h4 {
        margin: 0 0 8px;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        color: #b45309;
      }
      .footer {
        margin-top: 28px;
        padding-top: 16px;
        border-top: 2px solid rgba(255,184,28,0.6);
        display: flex;
        justify-content: space-between;
        gap: 20px;
        align-items: center;
        font-size: 11px;
        color: #6b7280;
      }
      .muted { color: #6b7280; }
      .empty-state {
        border: 1px dashed #d1d5db;
        background: #fafafa;
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        color: #6b7280;
      }
      @media print {
        body { padding: 0; background: white; }
        .report { box-shadow: none; border: none; }
      }
    </style>
  </head>
  <body>
    <div class="report">
      <div class="accent-top"></div>
      <div class="content">
        <div class="brand-row">
          <div class="brand">
            <h1>PROVISIONING TECH</h1>
            <p>Weekly Internship Performance Report</p>
          </div>
          <div class="meta-box">
            <div><strong>Report Date:</strong> ${escapeHtml(new Date(generatedAt).toLocaleDateString("en-US"))}</div>
            <div style="margin-top: 4px;"><strong>Student:</strong> ${escapeHtml(studentName)}</div>
          </div>
        </div>

        <div class="hero">
          <h2>Weekly Report Summary</h2>
          <p>A professional summary of the internship journey, weekly progress, achievements, challenges, and administrative feedback.</p>
        </div>

        <div class="info-grid">
          <div class="info-card">
            <div class="label">Student Name</div>
            <div class="value">${escapeHtml(studentName)}</div>
          </div>
          <div class="info-card">
            <div class="label">Internship Type</div>
            <div class="value">${escapeHtml(internshipType)}</div>
          </div>
          <div class="info-card">
            <div class="label">Duration</div>
            <div class="value">${escapeHtml(duration)}</div>
          </div>
        </div>

        <div class="section-title">
          <h3>Weekly Breakdown</h3>
          <div class="line"></div>
        </div>
        ${weeklyCards}

        <div class="section-title">
          <h3>Summary Section</h3>
          <div class="line"></div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <h4>Total Hours</h4>
            <p>${escapeHtml(String(totalHours))}</p>
          </div>
          <div class="summary-card">
            <h4>Total Weeks</h4>
            <p>${escapeHtml(String(totalWeeks))}</p>
          </div>
          <div class="summary-card">
            <h4>Performance Rating</h4>
            <p>${escapeHtml(performanceRating)}</p>
          </div>
          <div class="summary-card">
            <h4>Admin Feedback</h4>
            <p>${escapeHtml(adminFeedback)}</p>
          </div>
          <div class="summary-card full">
            <h4>Highlighted Achievements</h4>
            ${renderParagraphList(summary.achievements, "No achievements reported yet.")}
          </div>
          <div class="summary-card full">
            <h4>Highlighted Challenges</h4>
            ${renderParagraphList(summary.challenges, "No challenges reported yet.")}
          </div>
        </div>

        <div class="footer">
          <div>Generated by Provisioning Tech</div>
          <div>Professional internship reporting</div>
        </div>
      </div>
      <div class="accent-bottom"></div>
    </div>
  </body>
  </html>
  `;
};

export default weeklyReportTemplate;