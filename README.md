<p align="center">
<h1 align="center">ClientDeck Mini-CRM</h1>
</p>

<p align="center">
<img src="https://img.shields.io/badge/build-passing-green.svg" alt="Build Status">
<img src="https://img.shields.io/badge/version-1.0.0--mvp-blue.svg" alt="Version">
<img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
</p>

<p align="center">
<a href="#-features">Features</a> •
<a href="#-tech-stack">Tech Stack</a> •
<a href="#-getting-started">Getting Started</a> •
<a href="#-future-roadmap">Roadmap</a> •
<a href="#-license">License</a>
</p>

📖 About ClientDeck
ClientDeck is a simple, modern, and powerful Mini-CRM (Customer Relationship Management) application built as a full-stack showcase project. It's designed for freelancers and small agencies to manage their contacts and track the status of related projects efficiently.

We believe development should be an enjoyable and creative experience. ClientDeck is built to demonstrate a professional development workflow using a decoupled backend API and a reactive, modern, and fast frontend single-page application (SPA).

✨ Features
The initial (MVP) version of ClientDeck focuses on core functionalities, including:

🔐 Secure User Authentication: Secure registration and login using Laravel Sanctum.

📊 Simple Dashboard: An overview of key metrics, such as total contacts and active projects.

👤 Contact Management: Full CRUD (Create, Read, Update, Delete) operations for client contacts.

🚀 Project Management: Full CRUD operations for projects, complete with trackable statuses.

🔗 Entity Linking: The ability to associate projects with specific contacts for better organization.

🛠️ Tech Stack
ClientDeck is built with a modern and industry-tested tech stack to ensure scalability and maintainability.

<p align="center">
<a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="200" alt="Laravel Logo"></a>
<a href="https://nextjs.org" target="_blank"><img src="https://www.google.com/search?q=https://upload.wikimedia.org/wikipedia/commons/8/8e/Nextjs-logo.svg" width="180" alt="Next.js Logo"></a>
</p>

Backend (API)
Laravel 12: The PHP framework for building robust and elegant REST APIs.

Laravel Sanctum: Lightweight token-based API authentication.

PostgreSQL: A powerful, open-source object-relational database.

Frontend (Client)
Next.js 14: The React framework for production-ready web applications.

Tailwind CSS: A utility-first CSS framework for rapid UI design.

Shadcn/UI: Re-usable UI components built with Radix UI and Tailwind CSS.

TanStack Query: Powerful server state management for fetching, caching, and updating data.

Zustand: A simple and fast global state management solution.

React Hook Form: A performant and flexible forms library.

🚀 Getting Started
To get a local copy up and running, make sure you meet the prerequisites and follow the installation steps below.

Prerequisites
Node.js (v20+) & NPM / Yarn

PHP (v8.2+) & Composer

PostgreSQL Database Server

Installation
Clone the Repository

git clone [https://github.com/your-username/client-deck-project.git](https://github.com/your-username/client-deck-project.git)
cd client-deck-project

Backend Setup (/api)

# Navigate to the api directory
cd api

# Install dependencies
composer install

# Copy the environment file
cp .env.example .env

# Generate the application key
php artisan key:generate

# Configure your .env file with your database details
# Run the database migrations
php artisan migrate

# Run the server
php artisan serve

Frontend Setup (/frontend)

# Navigate to the frontend directory
cd ../frontend

# Install dependencies
npm install

# Copy the environment file
cp .env.local.example .env.local

# Update .env.local to point to your API URL
# NEXT_PUBLIC_API_BASE_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)

# Run the development server
npm run dev

🗺️ Future Roadmap
We have plans to expand ClientDeck's functionality. Future features may include:

[ ] Kanban Board for visual project management.

[ ] Notes System for contacts and projects.

[ ] File Uploads for project attachments.

[ ] Dashboard Enhancements with charts and analytics.

🤝 Contributing
Thank you for considering contributing to ClientDeck! We are currently drafting contribution guidelines. In the meantime, feel free to open an issue or pull request.

📄 License
The ClientDeck project is open-source software licensed under the MIT License.