const express = require("express");
const cors = require("cors");
const playwright = require("playwright");
const { wrap, configure } = require("agentql");
const app = express();
app.use(cors());
app.use(express.json());
const port = 3001;

app.post("/execute", async (req: any, res: any) => {
  let browser = null;
  let context = null;
  let page = null;
  
  try {
    const { url, script, credentials } = req.body;
    
    // Configure agentql
    configure({
      apiKey: "uw10FVT6rMQgMQHzQT4ccOTdjagsdfrTbaPATRQmCwlnXT9uRH6sfw",
    });
    
    // Launch browser with specific options
    browser = await playwright.chromium.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    
    // Create new context with timeout settings
    context = await browser.newContext({
      navigationTimeout: 30000,
      actionTimeout: 30000,
    });
    
    // Create and wrap page
    page = await wrap(await context.newPage());
    
    // Execute the automation script in a controlled context
    const executeScript = new Function(
      "page",
      `
      return (async () => {
        try {
          ${script}
          // Call the executeAutomation function if it exists
          if (typeof executeAutomation === 'function') {
            return await executeAutomation(page);
          }
          return { success: true, message: 'Script executed successfully' };
        } catch (error) {
          console.error('Script execution error:', error);
          return { success: false, error: error.message };
        }
      })();
    `
    );

    // Execute the script and wait for the result
    const result = await executeScript(page);
    
    // Only close resources after script execution is complete
    await page.close();
    await context.close();
    await browser.close();
    
    res.json({ success: true, result });
    
  } catch (error: any) {
    console.error("Server error:", error);
    
    // Cleanup in case of error
    try {
      if (page) await page.close();
      if (context) await context.close();
      if (browser) await browser.close();
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.stack,
    });
  }
});

// Error handling for uncaught exceptions
process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

app.listen(port, () => {
  console.log(`Automation server running on port ${port}`);
});