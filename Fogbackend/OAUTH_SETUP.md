# OAuth Social Login Setup Guide

This guide explains how to configure Google and Facebook OAuth for social login functionality.

## Required Environment Variables

Add the following environment variables to your `.env` file in the backend directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Facebook OAuth Configuration
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# Required for OAuth callback URLs
CLIENT_URL=http://localhost:3000
```

## Getting Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
7. Copy the Client ID and Client Secret to your `.env` file

## Getting Facebook OAuth Credentials

1. Go to the [Facebook Developers Console](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add "Facebook Login" product to your app
4. In Facebook Login settings, add valid OAuth redirect URIs:
   - `http://localhost:5000/api/auth/facebook/callback` (for development)
   - `https://yourdomain.com/api/auth/facebook/callback` (for production)
5. Copy the App ID and App Secret to your `.env` file

## OAuth Flow

1. User clicks "Login with Google/Facebook" button
2. Frontend redirects to backend OAuth endpoint (`/api/auth/google` or `/api/auth/facebook`)
3. Backend redirects to provider's OAuth page
4. User authorizes the application
5. Provider redirects back to backend callback (`/api/auth/google/callback` or `/api/auth/facebook/callback`)
6. Backend creates/updates user record and generates JWT token
7. Backend sets HTTP-only cookie and redirects to frontend success page
8. Frontend receives authenticated user state

## Security Notes

- OAuth credentials should never be committed to version control
- Use environment variables for all sensitive configuration
- Ensure callback URLs match exactly what's configured in OAuth providers
- Use HTTPS in production for secure cookie transmission
- JWT tokens are set as HTTP-only cookies for enhanced security

## Testing

1. Configure OAuth credentials in `.env`
2. Start backend server: `npm start`
3. Start frontend server: `npm run dev`
4. Navigate to login page and test social login buttons
5. Check browser network tab for proper redirects and cookie setting
6. Verify user data is properly stored in database

## Troubleshooting

- **"Invalid client" error**: Check that Client ID/App ID is correct
- **"Redirect URI mismatch"**: Ensure callback URLs match OAuth provider settings
- **"Unauthorized" error**: Verify Client Secret/App Secret is correct
- **Cookie not set**: Check that CLIENT_URL environment variable is correct
- **CORS errors**: Ensure frontend URL is in CORS whitelist (cors.config.js)
