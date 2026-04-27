import puppeteer from "puppeteer";

export const generatePdf = async (html) => {
  let browser;
  try {
    const sharedArgs = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
    const launchOptionsList = [
      {
        headless: "new",
        args: sharedArgs,
        executablePath
      },
      {
        headless: true,
        args: sharedArgs,
        executablePath
      },
      {
        headless: true,
        args: sharedArgs
      }
    ];

    let launchError;
    for (const launchOptions of launchOptionsList) {
      try {
        console.log("Launching Puppeteer browser with options:", {
          headless: launchOptions.headless,
          executablePath: launchOptions.executablePath ? "provided" : "default"
        });
        browser = await puppeteer.launch(launchOptions);
        break;
      } catch (error) {
        launchError = error;
        console.warn("Puppeteer launch attempt failed:", error.message);
      }
    }

    if (!browser) {
      throw launchError || new Error("Failed to launch Puppeteer browser");
    }

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
