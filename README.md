# AI Quiz Platform

A modern, role-based quiz application built with Next.js, Firebase, and AI-powered quiz generation.

## Features

### 🔐 Authentication & Role Management
- **Google OAuth Integration**: Seamless sign-in with Google accounts
- **Email/Password Authentication**: Traditional authentication method
- **Role-Based Access**: Separate dashboards for teachers and students
- **Automatic Role Detection**: Smart routing based on user roles

### 👨‍🏫 Teacher Features
- **AI-Powered Quiz Generation**: Create quizzes using AI with custom prompts
- **Quiz Management**: View, edit, and manage all created quizzes
- **Room Code Generation**: Automatic generation of unique room codes for quiz sharing
- **Student Performance Tracking**: Monitor student scores and rankings
- **Real-time Results**: Live leaderboard and performance analytics

### 👨‍🎓 Student Features
- **Join Quizzes**: Enter room codes to participate in quizzes
- **Real-time Quiz Taking**: Interactive quiz interface with countdown timers
- **Instant Results**: Immediate score calculation and ranking
- **Performance History**: Track all attempted quizzes and scores
- **Leaderboard**: View rankings and compare performance with peers

### 🎯 Quiz Features
- **Multiple Choice Questions**: AI-generated questions with 4 options
- **Difficulty Levels**: Easy, Medium, and Hard difficulty settings
- **Timer Support**: Configurable time limits for quizzes
- **Real-time Updates**: Live leaderboard updates during quiz sessions
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **AI Integration**: Google Gemini AI for quiz generation
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase project with Authentication and Firestore enabled
- Google AI API key for quiz generation

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-quiz-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

   # Google AI Configuration
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Authentication (Google and Email/Password providers)
   - Enable Firestore Database
   - Add your Firebase configuration to `firebase/config.ts`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Project Structure

```
ai-quiz-platform/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   ├── api/                      # API Routes
│   ├── dashboard/                # Dashboard pages
│   │   ├── teacher/             # Teacher dashboard
│   │   └── student/             # Student dashboard
│   ├── join/                    # Quiz joining pages
│   ├── sign-in/                 # Authentication pages
│   ├── sign-up/
│   └── select-role/             # Role selection page
├── components/                   # Reusable components
│   ├── ui/                      # UI components
│   ├── quiz-viewer.tsx          # Quiz taking interface
│   ├── quiz-results-for-student.tsx
│   └── countdown-timer.tsx
├── firebase/                    # Firebase configuration
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions
└── public/                      # Static assets
```

## Key Fixes and Improvements

### 🔧 Authentication Flow Fixes
- **Fixed Google Login Redirects**: Users now properly redirect to their role-based dashboards
- **Role-Based Routing**: Implemented automatic role detection and routing
- **Authentication State Management**: Proper user state management across the app
- **Role Selection Page**: Added page for users without assigned roles

### 🎯 Dashboard Improvements
- **Dynamic User Data**: Replaced hardcoded user IDs with authenticated user data
- **Real-time Updates**: Live updates for quiz results and leaderboards
- **Error Handling**: Improved error handling and user feedback
- **Loading States**: Better loading indicators and user experience

### 📊 Quiz Results Enhancements
- **Enhanced Leaderboard**: Improved leaderboard with rankings, percentages, and icons
- **Score Visualization**: Color-coded scores based on performance
- **Real-time Updates**: Live leaderboard updates during quiz sessions
- **Error Recovery**: Better error handling and retry mechanisms

### 🎨 UI/UX Improvements
- **Responsive Design**: Mobile-friendly interface
- **Loading States**: Smooth loading animations
- **Error Messages**: Clear and helpful error messages
- **Navigation**: Improved navigation with breadcrumbs and back buttons

## Usage Guide

### For Teachers

1. **Sign Up/Login**: Create an account or sign in with Google
2. **Create Quiz**: Navigate to "Create New Quiz" in your dashboard
3. **Configure Quiz**: Set subject, difficulty, number of questions, and topic
4. **Generate Questions**: Use AI to generate quiz questions
5. **Edit & Save**: Review and edit questions, then save the quiz
6. **Share**: Share the generated room code with students
7. **Monitor**: Track student performance and view results

### For Students

1. **Sign Up/Login**: Create an account or sign in with Google
2. **Join Quiz**: Enter the room code provided by your teacher
3. **Take Quiz**: Answer questions within the time limit
4. **View Results**: See your score and ranking immediately
5. **Track Progress**: View your quiz history in your dashboard

## API Endpoints

- `POST /api/generate-quiz`: Generate quiz questions using AI
- `POST /api/save-quiz`: Save quiz to database
- `POST /api/submit-quiz`: Submit quiz answers and calculate scores

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@aiquizplatform.com or create an issue in the repository.

## Acknowledgments

- Firebase for authentication and database services
- Google AI for quiz generation capabilities
- Next.js team for the amazing framework
- Radix UI for accessible component primitives
