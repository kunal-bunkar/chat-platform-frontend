# Vercel Deployment Guide

This guide will help you deploy the frontend to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your backend API URL (for production)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**
   - Make sure the `client` folder is in your repository

2. **Import Project in Vercel**
   - Go to https://vercel.com/new
   - Import your Git repository
   - **Important**: Set the **Root Directory** to `client`
   - Vercel will auto-detect the framework (Create React App)

3. **Configure Environment Variables**
   - In the Vercel project settings, go to "Environment Variables"
   - Add the following variable:
     ```
     REACT_APP_API_URL=https://your-backend-domain.com
     ```
   - Replace `https://your-backend-domain.com` with your actual backend server URL
   - Make sure to add it for all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Navigate to client directory**
   ```bash
   cd client
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy**
   ```bash
   vercel
   ```
   - Follow the prompts
   - When asked for environment variables, add:
     - `REACT_APP_API_URL` = your backend URL

5. **For production deployment**
   ```bash
   vercel --prod
   ```

## Environment Variables

The following environment variable is required:

- **REACT_APP_API_URL**: The base URL of your backend API server
  - Example for production: `https://api.yourdomain.com`
  - Example for development: `http://localhost:5000`
  - **Note**: The app will automatically append `/api` to this URL for API calls
  - **Note**: Socket.IO will use this URL (without `/api`) for WebSocket connections

## Important Notes

1. **Root Directory**: Make sure to set the root directory to `client` in Vercel settings if deploying from the monorepo root

2. **Build Output**: The build output directory is `build` (standard for Create React App)

3. **Client-Side Routing**: The `vercel.json` file includes rewrites to handle React Router's client-side routing

4. **Caching**: Static assets are cached for optimal performance

5. **Backend CORS**: Make sure your backend server allows requests from your Vercel domain

## Troubleshooting

- **Build fails**: Check that all dependencies are listed in `package.json`
- **API calls fail**: Verify `REACT_APP_API_URL` is set correctly in Vercel environment variables
- **Socket.IO connection fails**: Ensure your backend URL is correct and supports WebSocket connections
- **404 on routes**: The rewrites in `vercel.json` should handle this, but verify the configuration

## Post-Deployment

After deployment, you'll get a URL like `https://your-app.vercel.app`. Make sure to:

1. Update your backend CORS settings to allow this domain
2. Test all functionality (login, chat, etc.)
3. Set up a custom domain (optional) in Vercel project settings
