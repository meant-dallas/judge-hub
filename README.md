# JudgeHub

A Next.js judging application with Google OAuth authentication, role-based access control, and Google Sheets backend integration.

## Overview

JudgeHub is a web application designed to streamline the judging process for competitions and events. It features three distinct user personas (Admin, Coordinator, and Judge) with role-based access control, and uses Google Sheets as a backend for storing scores and evaluations.

## Features

- **Google OAuth Authentication**: Secure login using Google accounts
- **Role-Based Access Control**: Three user personas with different permissions
  - **Admin**: Manage users, competitions, projects, and view all data
  - **Coordinator**: Assign judges, track progress, and monitor submissions
  - **Judge**: Evaluate assigned projects and submit scores
- **Google Sheets Integration**: Backend storage for scores and data
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Track judging progress in real-time

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Backend**: Google Sheets API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- Google Cloud Console account
- Google Sheets account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd judgehub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required values (see Configuration section below)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google OAuth API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
6. Copy the Client ID and Client Secret to your `.env.local`

### Google Sheets API Setup

1. In Google Cloud Console, enable Google Sheets API
2. Create a service account
3. Download the service account JSON key file
4. Extract the `private_key` and `client_email` values
5. Create a Google Sheet for your data
6. Share the sheet with the service account email (with edit permissions)
7. Copy the spreadsheet ID from the URL to your `.env.local`

### Environment Variables

See `.env.example` for all required environment variables.

## Project Structure

```
judgehub/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   ├── coordinator/       # Coordinator pages
│   ├── judge/             # Judge pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable React components
├── lib/                   # Utility libraries and helpers
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
├── public/                # Static assets
└── TASKS.md              # Development task list
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Style

This project uses ESLint and Prettier for code formatting. Configuration files:
- `.eslintrc.json` - ESLint rules
- `.prettierrc` - Prettier configuration

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables from `.env.example` in your Vercel project settings.

## Contributing

See `TASKS.md` for the current development roadmap and task list.

## License

MIT
