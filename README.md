WISE - Warehouse Integrated System & Execution

A modern, responsive Warehouse Management System prototype built with Tailwind CSS


About

WISE (Warehouse Integrated System & Execution) is a frontend prototype for a Warehouse Management System, developed based on a Figma design for Yogya Group. This application serves as the initial step in developing a full-featured WMS solution.


Features

- Authentication: Secure login/logout with password hashing
- Dashboard: Comprehensive overview with metrics and quick actions
- Configuration: System settings and preferences management
- Profile Management: User profile settings and password change
- Search: Quick search with keyboard shortcut (Ctrl+K)
- Responsive Design: Works on desktop, tablet, and mobile


Getting Started

Prerequisites:
- Node.js (v14 or higher)
- npm (comes with Node.js)

Installation:

1. Clone the repository
   git clone https://github.com/Fannzxyl/warehouse-management-system.git

2. Navigate to project directory
   cd warehouse-management-system

3. Install dependencies
   npm install

4. Build Tailwind CSS
   npm run build

5. Start development server
   npm run dev

Alternatively, open login.html directly in your browser or use the Live Server extension in VS Code.


Demo Credentials

Username              Password
admin@gmail.com       123456
user@wise.com         password123
demo@wise.com         demo1234


Project Structure

warehouse-management-system/
├── dist/              - Compiled CSS output
├── js/                - JavaScript modules
│   ├── auth-guard.js  - Route protection
│   ├── login.js       - Login functionality
│   ├── dashboard.js   - Dashboard logic
│   ├── profile.js     - Profile management
│   └── utils.js       - Shared utilities
├── public/images/     - Static assets
├── src/               - Source files
│   └── input.css      - Tailwind input
├── login.html         - Login page
├── dashboard.html     - Main dashboard
├── configuration.html - Settings page
├── profile.html       - User profile
└── tailwind.config.js - Tailwind configuration


Tech Stack

Technology          Purpose
HTML5               Structure
Tailwind CSS        Styling
JavaScript          Interactivity
Font Awesome        Icons
Google Fonts        Typography (Inter)


Design

Based on Figma design: 
https://www.figma.com/design/8kgArRlq0qhsHK5Wcpt8Rh/FigmaWISE?node-id=0-1&t=TnBF9cen4lW0fhj2-1


Development Team

Developed under the guidance of Michael Suryadi

Name      Role
Alfan     Developer
Evita     Developer
Fajar     Developer


License

This project is developed for Yogya Group as part of an internal WMS initiative.
