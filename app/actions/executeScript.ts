"use server";

import * as playwright from "playwright";
import { wrap, configure } from "agentql";

export async function executeAutomationScript(
  url: string,
  script: string,
  credentials: any
) {
  let browser = null;

  try {
    configure({
      apiKey: "uw10FVT6rMQgMQHzQT4ccOTdjagsdfrTbaPATRQmCwlnXT9uRH6sfw",
    });

    browser = await playwright.chromium.launch({
      headless: false,
    });

    const context = await browser.newContext();
    const page = await wrap(await context.newPage());

    await page.goto(url);

    // Execute automation steps
    const result = await eval(`(async () => { 
      try {
        ${script}
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    })()`);

    await context.close();
    await browser.close();

    return { success: true, message: "Script executed successfully", result };
  } catch (error: any) {
    if (browser) await browser.close();
    throw new Error(`Script execution failed: ${error.message}`);
  }
}
