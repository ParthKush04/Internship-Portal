import puppeteer from "puppeteer";

export const generatePdf = async (html) => {
  let browser;
  try {
    console.log("Launching Puppeteer browser...");
    browser = await puppeteer.launch({ 
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    console.log("Browser launched, creating new page...");
    const page = await browser.newPage();
    
    console.log("Setting page content...");
    await page.setContent(html, { waitUntil: "load" });

    console.log("Generating PDF...");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    });

    console.log("PDF generated, closing browser...");
    await browser.close();
    console.log("Browser closed successfully");
    return pdf;
  } catch (error) {
    console.error("PDF generation error:", error);
    if (browser) {
      try {
        console.log("Attempting to close browser due to error...");
        await browser.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
    }
    throw error;
  }
};
