# Mini CRM Frontend

A comprehensive Customer Relationship Management (CRM) system built with Next.js 14, featuring modern UI components and full CRUD operations for contacts, projects, and users.

## Features

- **Authentication**: Login and registration with form validation
- **Auto Redirect**: Automatic redirect after login/register, prevents access to auth pages when authenticated
- **Protected Routes**: Automatic protection for all routes with authentication guard
- **Dashboard**: Overview with statistics cards
- **Contact Management**: Full CRUD operations for contacts
- **Project Management**: Full CRUD operations for projects with status tracking
- **User Management**: Full CRUD operations for system users
- **Responsive Design**: Mobile-friendly interface
- **Loading States**: Skeleton loaders and loading indicators
- **Confirmation Modals**: Delete confirmation dialogs
- **Form Validation**: Comprehensive form validation with error handling

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: Shadcn/ui components
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Laravel API backend running on `http://localhost:8000`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Mini CRM
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Integration

The frontend integrates with a Laravel API backend. Make sure your Laravel API is running and accessible at the URL specified in your environment variables.

### API Endpoints

The application expects the following API endpoints:

- **Authentication**: `/api/auth/*`
- **Users**: `/api/users/*`
- **Contacts**: `/api/contacts/*`
- **Projects**: `/api/projects/*`

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── contacts/          # Contact CRUD pages
│   ├── projects/          # Project CRUD pages
│   ├── users/             # User CRUD pages
│   ├── login/             # Authentication pages
│   └── register/
├── components/            # Reusable components
│   ├── ui/               # Shadcn/ui components
│   ├── layout/           # Layout components
│   ├── contacts/         # Contact-specific components
│   ├── projects/         # Project-specific components
│   └── users/            # User-specific components
├── lib/                  # Utilities and configurations
│   ├── api.ts           # API client configuration
│   ├── store.ts         # Zustand store
│   ├── validations.ts   # Zod validation schemas
│   └── utils.ts         # Utility functions
└── middleware.ts         # Next.js middleware
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features Overview

### Authentication
- Secure login and registration
- Form validation with error messages
- Automatic token management
- Protected routes with AuthGuard
- Auto redirect after login/register
- Prevents access to auth pages when authenticated
- Automatic logout on token expiration

### Dashboard
- Statistics cards showing totals
- Recent activity feed
- Quick action buttons
- Responsive grid layout

### Contact Management
- List all contacts with search functionality
- Create new contacts with validation
- View contact details
- Edit existing contacts
- Delete contacts with confirmation

### Project Management
- List all projects with search and status filtering
- Create new projects with contact assignment
- View project details
- Edit existing projects
- Delete projects with confirmation
- Status tracking (Planning, In Progress, Completed)

### User Management
- List all users with search functionality
- Create new users with validation
- View user details
- Edit existing users
- Delete users with confirmation
- Email verification status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.