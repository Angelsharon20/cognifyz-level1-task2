// middleware/validateRegistration.js
// ─────────────────────────────────────────────────────────────────────────────
// Server-side validation layer using express-validator.
// Acts as a pipeline step between the POST route and the business logic handler.
// If any rule fails, the form is re-rendered with error details and safe
// repopulated values (password is intentionally never repopulated).
// ─────────────────────────────────────────────────────────────────────────────

const { body, validationResult } = require('express-validator');

// ── Allowed role values (single source of truth shared with EJS) ──────────────
const VALID_ROLES = [
  'frontend',
  'backend',
  'fullstack',
  'data-science',
  'devops',
  'mobile',
  'ui-ux',
];

// ── Validation rule chain ─────────────────────────────────────────────────────
const registrationRules = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters.')
    .matches(/^[a-zA-Z\s'\-]+$/)
    .withMessage('Name may only contain letters, spaces, hyphens, or apostrophes.'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please enter a valid email address (e.g. you@example.com).')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number.'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password.')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),

  body('role')
    .trim()
    .notEmpty()
    .withMessage('Please select a role or interest.')
    .isIn(VALID_ROLES)
    .withMessage('Invalid role selected. Please choose from the list.'),

  body('bio')
    .trim()
    .notEmpty()
    .withMessage('Bio is required.')
    .isLength({ min: 10, max: 300 })
    .withMessage('Bio must be between 10 and 300 characters.'),
];

// ── Error handler middleware ──────────────────────────────────────────────────
/**
 * Reads the result of the validation chain above.
 * On failure → re-renders register.ejs in 'form' view with per-field errors.
 * On success → calls next() to reach the business logic handler.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const handleValidationErrors = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    // Collapse multiple errors per field → keep only the first
    const fieldErrors = {};
    result.array().forEach(({ path, msg }) => {
      if (!fieldErrors[path]) fieldErrors[path] = msg;
    });

    return res.status(422).render('register', {
      view: 'form',
      errors: fieldErrors,
      // Repopulate safe fields; never echo the password back
      formData: {
        fullName:        req.body.fullName        || '',
        email:           req.body.email           || '',
        role:            req.body.role            || '',
        bio:             req.body.bio             || '',
      },
      users:   req.app.locals.userDatabase,
      VALID_ROLES,
      flashMessage: null,
    });
  }

  next();
};

module.exports = { registrationRules, handleValidationErrors, VALID_ROLES };
