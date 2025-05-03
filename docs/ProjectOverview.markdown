# Project Overview: Wedding Asset Tracker (Updated)

## Purpose
The Wedding Asset Tracker is a web application for users to record and manage gold and money received as wedding gifts. Users can track donors (from groom’s or bride’s side) and monitor asset values over time, with a Turkish-language interface.

## Target Audience
- Newlyweds in Turkey managing wedding gifts.
- Users tracking gold and money for financial or sentimental purposes.

## Key Features
- **Asset Entry**: Add/edit/delete assets (gold: Çeyrek Altın, Tam Altın, Reşat, Beşi Bir Yerde, Bilezik, Gram Gold; money: Turkish Lira, Dollar, Euro).
- **Donor Management**: Track donors with name and side (groom or bride).
- **Value Tracking**: Manually update values and visualize trends with charts.
- **Authentication**: Secure login with Google OAuth or email/password.
- **Turkish UI**: Fully in Turkish, responsive with Tailwind CSS.
- **Data Persistence**: PostgreSQL with Prisma.

## Tech Stack
- **Frontend/Backend**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma
- **Authentication**: NextAuth.js
- **Charting**: Chart.js
- **HTTP Client**: Axios
- **Hosting**: VPS (Node.js, PM2, Nginx)

## Project Goals
- Build a secure, scalable app with a Turkish interface.
- Ensure data privacy (e.g., authenticated API routes).
- Provide clear VPS deployment instructions.