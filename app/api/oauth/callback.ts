import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Invalid authorization code" });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI
  );

  try {
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens securely (example using cookies)
    res.setHeader("Set-Cookie", [
      `google_access_token=${tokens.access_token}; HttpOnly; Path=/; Max-Age=3600`,
      `google_refresh_token=${tokens.refresh_token}; HttpOnly; Path=/; Max-Age=31536000`,
    ]);

    // Redirect back to main application
    res.redirect("/");
  } catch (error) {
    console.error("OAuth token exchange error:", error);
    res.status(500).json({ error: "Failed to exchange authorization code" });
  }
}
