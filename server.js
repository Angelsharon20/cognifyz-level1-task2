// server.js
// ─────────────────────────────────────────────────────────────────────────────
// Cognifyz Internship – Level 1 Task 2
// In-memory user registration with EJS dashboard rendering.
// ─────────────────────────────────────────────────────────────────────────────

'use strict';

const express = require('express');
const path    = require('path');
const {
  registrationRules,
  handleValidationErrors,
  VALID_ROLES,
} = require('./middleware/validateRegistration');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── In-Memory "Database" ──────────────────────────────────────────────────────
// This is a module-level array that persists for the lifetime of the Node
// process. It resets on every server restart (intentional for this task).
// In a real app this would be replaced by a Mongoose model or SQL table.
const userDatabase = [];

// Seed two demo accounts so the dashboard is never empty on first load
userDatabase.push(
  {
    id:        'USR-001',
    fullName:  'Aarav Mehta',
    email:     'aarav@cognifyz.tech',
    role:      'fullstack',
    bio:       'Passionate about building scalable web applications with React and Node.',
    joinedAt:  new Date('2024-11-15T09:30:00'),
  },
  {
    id:        'USR-002',
    fullName:  'Priya Krishnan',
    email:     'priya@cognifyz.tech',
    role:      'data-science',
    bio:       'ML engineer focused on NLP pipelines and real-time model serving.',
    joinedAt:  new Date('2024-12-03T14:15:00'),
  }
);

// Expose the array via app.locals so middleware can read it without an import
app.locals.userDatabase = userDatabase;

// ── View Engine ───────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ── Static Assets ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────────────────────

// GET /  →  Redirect to /register
app.get('/', (req, res) => res.redirect('/register'));

// GET /register  →  Show the registration form (empty, clean state)
app.get('/register', (req, res) => {
  res.render('register', {
    view:         'form',
    errors:       {},
    formData:     {},
    users:        userDatabase,
    VALID_ROLES,
    flashMessage: null,
  });
});

// POST /register  →  Validate → push to array → show dashboard
app.post(
  '/register',
  registrationRules,         // Step 1: run express-validator rule chain
  handleValidationErrors,    // Step 2: intercept failures → re-render form
  (req, res) => {            // Step 3: all valid – persist and redirect to dashboard

    const { fullName, email, role, bio } = req.body;

    // Check for duplicate email (case-insensitive)
    const duplicate = userDatabase.some(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (duplicate) {
      return res.status(409).render('register', {
        view: 'form',
        errors: { email: 'This email address is already registered.' },
        formData: { fullName, email, role, bio },
        users: userDatabase,
        VALID_ROLES,
        flashMessage: null,
      });
    }

    // Build a new user record (password is intentionally NOT stored in memory –
    // storing plain-text passwords, even in a demo, is bad practice).
    const newUser = {
      id:       `USR-${String(userDatabase.length + 1).padStart('3', '0')}`,
      fullName: fullName.trim(),
      email:    email.trim().toLowerCase(),
      role:     role.trim(),
      bio:      bio.trim(),
      joinedAt: new Date(),
    };

    userDatabase.push(newUser);

    console.log(`✅ Registered: ${newUser.fullName} <${newUser.email}> [${newUser.role}]`);

    // Render the dashboard and highlight the newly added row
    res.render('register', {
      view:         'dashboard',
      errors:       {},
      formData:     {},
      users:        userDatabase,
      VALID_ROLES,
      flashMessage: {
        type: 'success',
        text: `Welcome aboard, ${newUser.fullName}! Your account has been created.`,
        newId: newUser.id,
      },
    });
  }
);

// GET /dashboard  →  View-only dashboard (no flash message)
app.get('/dashboard', (req, res) => {
  res.render('register', {
    view:         'dashboard',
    errors:       {},
    formData:     {},
    users:        userDatabase,
    VALID_ROLES,
    flashMessage: null,
  });
});

// GET /clear  →  Dev helper: clear all non-seed users and redirect
app.get('/clear', (req, res) => {
  // Keep only the two seed accounts
  userDatabase.splice(2);
  res.redirect('/dashboard');
});

// 404 handler
app.use((req, res) => {
  res.status(404).render('register', {
    view:         '404',
    errors:       {},
    formData:     {},
    users:        userDatabase,
    VALID_ROLES,
    flashMessage: null,
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Cognifyz L1-T2 running → http://localhost:${PORT}`);
  console.log(`   Register : http://localhost:${PORT}/register`);
  console.log(`   Dashboard: http://localhost:${PORT}/dashboard`);
});
