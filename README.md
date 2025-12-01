# 🌐 Google OAuth Login – Node.js + Express + Passport

This project demonstrates a clean, industry-standard implementation of Google OAuth2 Login using:

- Node.js
- Express.js
- Passport.js
- passport-google-oauth20
- EJS Views (optional UI)

Users can log in with their Google account, view a profile page, and securely log out.

## 🌍 Live Demo
Try the app instantly — no setup required:

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_App-blue?style=for-the-badge)](https://socail-login.krishnaagrawal.deno.net/)

---

## Project Structure
```
project/
├── server.js
├── package.json
├── .env
```
---

## Installation
```
1. Clone the repository
git clone https://github.com/your-username/social-login.git
cd social-login

2. Install dependencies
npm install
```
---

## Google OAuth Setup
1. Go to: https://console.cloud.google.com/
2. Create a new project
3. Navigate to:
          **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
4. Choose:
          **Web Application**
6. Add the redirect URL:
```
http://localhost:5000/auth/google/callback
```
6. Copy your:
- Google Client ID
- Google Client Secret

---

## Environment Variables
Create a .env file:
```
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
SESSION_SECRET=your_session_secret
PORT=5000
```

---

## Running the Application
```
node server.js
```
Visit the app:
```
http://localhost:5000
```

---

## How Authentication Works
1. User clicks “Login with Google”
2. Google opens the OAuth consent screen
3. After authentication, Google redirects to
```
/auth/google/callback
```
4. Passport verifies the user
5. User data is saved in the session
6. User is redirected to the profile page
7. Logout clears session

---

## Routes Overview
| Route                   | Description                 |
| ----------------------- | --------------------------- |
| `/`                     | Login page                  |
| `/auth/google`          | Start Google OAuth          |
| `/auth/google/callback` | Google redirect handler     |
| `/profile`              | Protected user profile page |
| `/logout`               | Destroy session and logout  |

---

## Technologies Used
1. Node.js
2. Express
3. Passport.js
4. Passport Google OAuth Strategy
5. Express-Session
6. EJS Templates

---

## License
MIT License

---
