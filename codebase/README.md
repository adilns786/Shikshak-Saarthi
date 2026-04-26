# Shikshak Sarthi - Faculty Appraisal System

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/adils-projects-8c66b898/v0-faculty-appraisal-system)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/YgWzVJp5YBl)

A comprehensive Faculty Performance Based Appraisal System (PBAS) designed for educational institutions to streamline faculty performance evaluation, research tracking, and academic contributions management.

## 🌟 Features

### For Faculty Members

- **Personal Dashboard**: View and manage your academic profile with real-time metrics
- **PBAS Form Management**: Complete and submit Performance Based Appraisal System forms
- **Research & Publications**: Track research papers, publications, patents, and projects
- **Professional Development**: Record conferences, workshops, FDPs, and training
- **AI Assistant**: Get help with form completion and queries via integrated chatbot
- **Data Export**: Export your complete faculty data to CSV format
- **Profile Management**: Update personal information, qualifications, and employment history
- **Dark/Light Mode**: Switch between dark and light themes for comfortable viewing
- **Mobile Responsive**: Full mobile app-like experience with responsive design

### For Head of Department (HOD)

- **Department Dashboard**: Overview of all department faculty and their performance
- **Faculty Management**: Manage and review faculty appraisals
- **Department Analytics**: Visual insights into department research output and trends
- **Department Data Export**: Export complete department data to CSV
- **Activity Logs**: Monitor all activities within your department
- **Performance Tracking**: Track faculty publications, projects, and achievements

### For Administrators

- **User Management**: Create and manage faculty, HOD, and admin accounts
- **System-wide Analytics**: Access reports and statistics across all departments
- **Activity Monitoring**: View complete system activity logs and user actions
- **Department Reports**: Filter and view data by department
- **Bulk Operations**: Manage multiple users efficiently
- **Email Notifications**: Automated onboarding and notification emails

### Key System Features

- **Activity Logging**: Every user action is logged for audit trails
- **Automated Emails**:
  - Onboarding emails for new users with temporary passwords
  - Notification emails for form submissions and approvals
  - Password reset emails via Firebase and Resend
- **CSV Export**: Export individual, department, or system-wide data
- **Forgot Password**: Secure password reset via email
- **Real-time Updates**: Live data synchronization with Firebase
- **Theme Support**: System-wide dark and light mode
- **Responsive Design**: Mobile-first design that looks like a native app on mobile devices

## 🚀 Tech Stack

### Frontend

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library
- **Recharts**: Data visualization
- **next-themes**: Theme management

### Backend

- **Firebase**:
  - Authentication (Email/Password)
  - Firestore (Database)
  - Storage (File uploads)
  - Admin SDK (User management)
- **Resend**: Email delivery service

### AI/ML

- **Google Generative AI**: AI-powered assistance

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ and npm/pnpm installed
- Firebase project set up
- Resend account for email services (optional but recommended)
- Git for version control

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/shikshak-saarthi.git
cd shikshak-saarthi
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.storage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin SDK (for server-side operations)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"

# Resend Email Service
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Generative AI (for chatbot)
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

### 4. Firebase Setup

#### 4.1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create Firestore Database
5. Enable Storage

#### 4.2. Get Firebase Admin SDK Credentials

1. Go to Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file securely
4. Copy the values to your `.env.local` file

#### 4.3. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId ||
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'misAdmin'];
    }

    // Activity logs
    match /activity_logs/{logId} {
      allow read: if request.auth != null &&
                     (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'misAdmin', 'hod'] ||
                      resource.data.user_id == request.auth.uid);
      allow create: if request.auth != null;
    }

    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 5. Resend Setup (Email Service)

1. Sign up at [Resend](https://resend.com/)
2. Verify your domain or use the test domain
3. Create an API key
4. Add the API key to `.env.local`

### 6. Run the Development Server

```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Mobile Responsiveness

The application is fully responsive and provides a mobile app-like experience:

- Touch-friendly interfaces
- Responsive navigation with mobile menu
- Optimized forms for mobile input
- Gesture-friendly components
- Adaptive layouts for all screen sizes
- Mobile-first CSS with Tailwind breakpoints

## 🎨 Theme System

The application supports dark and light modes:

- System preference detection
- Manual theme toggle in navigation
- Persistent theme selection
- Smooth transitions between themes
- Theme-aware components throughout

## 📊 Data Export Features

### Faculty Export

Faculty can export their complete profile data including:

- Personal information
- Research papers and publications
- Patents and awards
- Teaching experience
- Professional development activities

### HOD Export

HODs can export:

- Individual faculty data
- Complete department data
- Department analytics

### Admin Export

Admins can export:

- Any user's data
- Any department's data
- System-wide reports

## 📧 Email Notifications

Automated emails are sent for:

- **Account Creation**: Welcome email with temporary password
- **HOD Account**: Special welcome for HOD role assignments
- **Form Submission**: Confirmation when PBAS forms are submitted
- **Form Approval/Rejection**: Status updates
- **Password Reset**: Secure password reset links

## 🔐 Activity Logging

All user actions are logged including:

- Login/Logout
- Form submissions and updates
- Data exports
- Profile changes
- Password resets
- Admin actions

### Viewing Activity Logs

- **Faculty**: View own activity logs
- **HOD**: View department-wide activity logs at `/hod/activity-logs`
- **Admin**: View all system logs at `/admin/activity-logs`

## 👥 User Roles

### Faculty

- Complete PBAS forms
- Track research and publications
- Export personal data
- View personal activity logs

### HOD (Head of Department)

- All faculty permissions
- View department dashboard
- Export department data
- View department activity logs
- Manage department faculty

### Admin/MIS Admin

- All HOD permissions for all departments
- Create and manage users
- View system-wide analytics
- Access all activity logs
- System configuration

## 🔒 Security Features

- Firebase Authentication with email/password
- Secure password reset flow
- Activity logging for audit trails
- Role-based access control (RBAC)
- Firestore security rules
- Environment variable protection
- HTTPS enforcement in production

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

Your project is live at:
**[https://vercel.com/adils-projects-8c66b898/v0-faculty-appraisal-system](https://vercel.com/adils-projects-8c66b898/v0-faculty-appraisal-system)**

## 📁 Project Structure

```
shikshak-saarthi/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── activity-logs/        # Activity logging API
│   │   ├── admin/                # Admin operations
│   │   ├── email/                # Email notifications
│   │   └── export/               # Data export APIs
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Faculty dashboard
│   ├── hod/                      # HOD pages
│   │   ├── dashboard/            # HOD dashboard
│   │   └── activity-logs/        # HOD activity logs
│   ├── admin/                    # Admin pages
│   │   ├── appraisals/           # Appraisal management
│   │   └── activity-logs/        # Admin activity logs
│   └── layout.tsx                # Root layout with theme provider
├── components/
│   ├── ui/                       # Reusable UI components
│   │   ├── export-button.tsx     # CSV export component
│   │   ├── activity-logs-viewer.tsx  # Activity logs display
│   │   ├── theme-toggle.tsx      # Theme switcher
│   │   └── ...                   # Other components
│   └── theme-provider.tsx        # Theme context provider
├── lib/
│   ├── firebase.ts               # Firebase configuration
│   ├── types.ts                  # TypeScript types
│   ├── csv-export.ts             # CSV export utilities
│   ├── activity-logger.ts        # Activity logging utilities
│   └── utils.ts                  # Utility functions
├── public/                       # Static assets
└── styles/                       # Global styles
```

## 🐛 Troubleshooting

### Firebase Connection Issues

- Verify all Firebase environment variables are set correctly
- Check Firebase project permissions
- Ensure Firestore and Authentication are enabled

### Email Not Sending

- Verify Resend API key is valid
- Check domain verification in Resend
- Review email logs in Resend dashboard
- Emails will fallback to Firebase if Resend is not configured

### Activity Logs Not Appearing

- Verify Firestore security rules allow read access
- Check if activity logging API is working
- Ensure user is properly authenticated

### Theme Not Persisting

- Clear browser local storage
- Check if `next-themes` is properly initialized
- Verify ThemeProvider is wrapping the app

## 📝 API Documentation

### Activity Logs API

**POST /api/activity-logs**

```typescript
{
  action: string,
  description: string,
  resourceType?: string,
  resourceId?: string,
  metadata?: Record<string, any>
}
```

**GET /api/activity-logs**
Query params: `department`, `limit`, `offset`

### Export APIs

**GET /api/export/faculty**
Export faculty data (requires authentication)

**GET /api/export/department**
Export department data (HOD/Admin only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👏 Acknowledgments

- VESIT (Vivekanand Education Society's Institute of Technology)
- Next.js team for the amazing framework
- Firebase for backend services
- Resend for email delivery
- All contributors and users

## 📞 Support

For support and queries:

- Email: support@shikshaksaarthi.com
- Issues: [GitHub Issues](https://github.com/your-org/shikshak-saarthi/issues)

## 🗺️ Roadmap

- [ ] Integration with more email providers
- [ ] Advanced analytics and reporting
- [ ] Mobile apps (iOS/Android)
- [ ] Integration with institutional systems
- [ ] Multi-language support
- [ ] Automated performance reports
- [ ] Integration with research databases (Scopus, Web of Science)
- [ ] Calendar integration for events and deadlines

---

**Built with ❤️ for educational institutions**
