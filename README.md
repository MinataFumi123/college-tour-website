# College Tour Website

## Overview
The College Tour Website is a comprehensive platform that connects prospective students with colleges by providing virtual tours and detailed information. The platform features an elegant dark-themed interface, interactive maps, personalized dashboards, and an admin panel for colleges to manage their tour information.

## Features

### User Features
- **Interactive College Listings**: Browse and search through a curated list of colleges with filtering capabilities
- **Detailed College Profiles**: View comprehensive information about each college including establishment year, student count, and description
- **Virtual Tour Experience**: Access virtual campus tours with detailed information about campus facilities
- **Campus Facility Viewer**: Explore different floors and facilities through blueprints and actual images
- **Interactive Maps**: View college locations on interactive maps powered by Mapbox
- **User Authentication**: Secure login and registration system with email verification
- **Personalized Dashboards**: Each user gets a personalized dashboard to manage tours and preferences
- **Responsive Design**: Optimized for mobile, tablet, and desktop viewing

### College Admin Features
- **Admin Panel**: Special access for college administrators to manage their college information
- **College Data Management**: Add, edit, and update college details including:
  - Basic information (name, year established, type)
  - Student count and address
  - Detailed descriptions and tour information
  - Campus imagery and location coordinates
- **Multi-floor Facility Management**: Add and manage images for different floors and facilities

### Technical Features
- **Dark Theme**: A sleek dark-themed interface that reduces eye strain
- **Real-time Search**: Instantly filter colleges based on search terms
- **Interactive Maps**: Location-based navigation powered by Mapbox GL JS
- **Responsive Image Galleries**: View facility blueprints and actual images
- **Secure Authentication**: Token-based authentication system
- **Error Handling**: Comprehensive error messaging and fallbacks

## Technologies Used
- **Frontend**: HTML5, CSS3 with Tailwind CSS, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), bcrypt for password hashing
- **Maps & Location**: Mapbox GL JS
- **Image Handling**: Client-side image processing
- **Deployment**: Vercel/Netlify for frontend, Heroku for backend

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd college-tour-website
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Configure the MongoDB connection in `src/config/db.js`.
5. Start the server:
   ```
   npm start
   ```

## Usage
- Visit the home page to learn about the tours.
- Use the login page to authenticate and access tour details.
- Explore the interactive maps to find college locations.
