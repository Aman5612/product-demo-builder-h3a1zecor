"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { google } from "googleapis";
import Cookies from "js-cookie";

interface GoogleDriveIntegrationProps {
  onConnect?: (fileId: string) => void;
}

const GoogleDriveIntegration: React.FC<GoogleDriveIntegrationProps> = ({
  onConnect,
}) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check if tokens exist in cookies
    const accessToken = Cookies.get("google_access_token");
    const refreshToken = Cookies.get("google_refresh_token");

    setIsConnected(!!(accessToken && refreshToken));
  }, []);

  const handleGoogleDriveConnect = () => {
    const scopes = [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}` +
      `&response_type=code` +
      `&scope=${scopes.join(" ")}` +
      `&access_type=offline` +
      `&prompt=consent`;

    window.location.href = authUrl;
  };

  const uploadToDrive = async (file: File) => {
    if (!isConnected) {
      console.error("Google Drive not connected");
      return null;
    }

    try {
      const accessToken = Cookies.get("google_access_token");
      const oauth2Client = new google.auth.OAuth2(
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
      );
      oauth2Client.setCredentials({ access_token: accessToken });

      const drive = google.drive({ version: "v3", auth: oauth2Client });

      const response = await drive.files.create({
        requestBody: {
          name: file.name,
          parents: ["root"],
        },
        media: {
          mimeType: file.type,
          body: file,
        },
      });

      // Callback to parent component with file ID
      onConnect?.(response.data.id ?? "");
      return response.data;
    } catch (error) {
      console.error("Drive upload error:", error);
      return null;
    }
  };

  return (
    <Button
      onClick={handleGoogleDriveConnect}
      variant={isConnected ? "secondary" : "default"}
    >
      {isConnected ? "Google Drive Connected" : "Connect Google Drive"}
    </Button>
  );
};

export default GoogleDriveIntegration;
