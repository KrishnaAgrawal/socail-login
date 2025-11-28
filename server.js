require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const PORT = process.env.PORT || 3000;
const app = express();

// --- Simple in-memory "database" for demo (do NOT use in prod) ---
const users = new Map(); // key: id, value: profile

// --- Passport session setup ---
passport.serializeUser((user, done) => {
    // user.id should be unique; store only small data
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    const user = users.get(id) || null;
    done(null, user);
});

// --- Google Strategy ---
const googleCredentials = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
};

passport.use(new GoogleStrategy(googleCredentials, (accessToken, refreshToken, profile, done) => {
    // save minimal user info
    const id = `google:${profile.id}`;
    const user = {
        id,
        provider: 'google',
        displayName: profile.displayName,
        emails: profile.emails || [],
        photos: profile.photos || [],
        raw: profile._json
    };
    users.set(id, user);
    done(null, user);
}));

// --- Middleware ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set true if using HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
// home
app.get('/', (req, res) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        res.send(`<h1>Hello ${req.user.displayName}</h1>
      <p><a href="/profile">Profile</a></p>
      <p><a href="/logout">Logout</a></p>`);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <title>Login</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
                    <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background: #f8f9fa;
                    }
                    .card {
                        border-radius: 20px;
                        padding: 40px;
                        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
                    }
                    .login-btn {
                        border-radius: 50px;
                        padding: 12px;
                        font-size: 1.1rem;
                        margin-bottom: 15px;
                    }
                    </style>
                </head>

                <body>
                    <div class="card text-center" style="width: 400px;">
                        <h2 class="mb-4">Welcome</h2>
                        <p class="text-muted mb-4">Login with your preferred method</p>

                        <a href="/auth/google" class="btn btn-danger login-btn w-100">
                            <img src="https://img.icons8.com/color/24/google-logo.png"> Login with Google
                        </a>
                    </div>
                </body>
            </html>
        `)
    }
});

// Google auth
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', (req, res, next) => {
        const { error } = req.query;
         // User clicked "Cancel" on Google login
        if (error === "access_denied") {
            return res.redirect('/?error=google_cancelled');
        }

        next(); // continue to passport if no cancel error
    },
    passport.authenticate('google', {
        failureRedirect: '/?error=google_failed',
        session: true
    }),
    (req, res) => {
        res.redirect('/profile');
    }
);

// Protected profile route
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.redirect('/');
  }

  const u = req.user;
  const photo =
    u.photos?.[0]?.value ||
    u.raw?.picture?.data?.url ||
    "https://via.placeholder.com/150";

  res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>Profile</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
    <style>
      body {
        background: #f0f2f5;
        padding-top: 50px;
      }
      .profile-card {
        max-width: 450px;
        margin: auto;
        padding: 30px;
        border-radius: 20px;
        background: white;
        text-align: center;
        box-shadow: 0 5px 25px rgba(0,0,0,0.1);
      }
      .profile-img {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
        margin-bottom: 20px;
        border: 4px solid #ddd;
      }
    </style>
  </head>

  <body>
    <div class="profile-card">
      <img src="${photo}" class="profile-img" />

      <h3>${u.displayName}</h3>
      <p class="text-muted">${u.provider.toUpperCase()} Login</p>

      <hr>

      <p><strong>Email:</strong><br>
      ${u.emails && u.emails.length > 0 ? u.emails.map(e => e.value).join("<br>") : "No email"}</p>

      <a href="/logout" class="btn btn-dark w-100 mt-3">Logout</a>
    </div>
  </body>
  </html>
  `);
});

// Logout
app.get('/logout', (req, res) => {
    req.logout(() => {
        // callback after logout in recent passport versions
        req.session.destroy(err => {
            res.redirect('/');
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
