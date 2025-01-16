import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Ensure this is only used in server-side contexts
if (typeof window !== 'undefined') {
  throw new Error('Google Drive API can only be used server-side');
}

export async function uploadToDrive(file: Blob): Promise<string> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !('googleDriveAccessToken' in session.user)) {
      throw new Error('Google Drive access token not found');
    }

    const oauth2Client = new google.auth.OAuth2();
    
    // Type-safe credential setting
    const credentials: {
      access_token: string;
      refresh_token?: string;
    } = {
      access_token: session.user.googleDriveAccessToken as string
    };
    
    // Only add refresh token if it exists
    if ('googleDriveRefreshToken' in session.user && session.user.googleDriveRefreshToken) {
      credentials.refresh_token = session.user.googleDriveRefreshToken as string;
    }
    
    oauth2Client.setCredentials(credentials);

    const drive = google.drive({
      version: 'v3',
      auth: oauth2Client,
      http2: false // Explicitly disable http2
    });

    const metadata = {
      name: `recording_${Date.now()}.webm`,
      mimeType: 'video/webm',
      parents: ['root']
    };

    const media = {
      mimeType: 'video/webm',
      body: file
    };

    const response = await drive.files.create({
      requestBody: metadata,
      media: media,
      fields: 'id,webViewLink'
    });

    if (!response.data.webViewLink) {
      throw new Error('Failed to get file URL');
    }

    return response.data.webViewLink;
  } catch (error) {
    console.error('Google Drive upload error:', error);
    throw new Error('Failed to upload to Google Drive');
  }
}
