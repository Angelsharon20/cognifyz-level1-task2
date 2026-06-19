/**
 * validation.js  –  Cognifyz Level 1 Task 2
 * ─────────────────────────────────────────────────────────────────
 * Responsibilities:
 *   1. Real-time field validation (blur + input events)
 *   2. Password strength meter (segmented colour-shift bar)
 *   3. Password show/hide toggle
 *   4. Bio character counter
 *   5. Full form gate on submit (prevent POST if client errors exist)
 *   6. Submit button loading state
 *
 * Architecture: each field has a `validate(value)` rule function that
 * returns a string on failure or null on pass.  A shared `setField()`
 * helper applies the UI state.  This keeps each concern isolated and
 * easy to extend.
 * ─────────────────────────────────────────────────────────────────
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('regForm');
  if (!form) return; // Dashboard / 404 page — nothing to do

  // ── Element refs ────────────────────────────────────────────────
  const el = {
    fullName:        form.querySelector('#fullName'),
    email:           form.querySelector('#email'),
    password:        form.querySelector('#password'),
    confirmPassword: form.querySelector('#confirmPassword'),
    role:            form.querySelector('#role'),
    bio:             form.querySelector('#bio'),
    submitBtn:       form.querySelector('#regBtn'),
    eyeBtn:          form.querySelector('#togglePw'),
    eyeIcon:         form.querySelector('#eyeIcon'),
    bioCount:        form.querySelector('#bioCount'),
    pwMeter:         form.querySelector('#pwMeter'),
    pwSegs:          [
      form.querySelector('#seg1'),
      form.querySelector('#seg2'),
      form.querySelector('#seg3'),
      form.querySelector('#seg4'),
    ],
    pwLabel:         form.querySelector('#pwLabel'),
  };

  // ── 1. VALIDATION RULES ─────────────────────────────────────────
  const rules = {
    fullName(v) {
      if (!v.trim())            return 'Full name is required.';
      if (v.trim().length < 2)  return 'Must be at least 2 characters.';
      if (v.trim().length > 60) return 'Must be under 60 characters.';
      if (!/^[a-zA-Z\s'\-]+$/.test(v.trim())) return 'Only letters, spaces, hyphens, or apostrophes allowed.';
      return null;
    },
    email(v) {
      if (!v.trim()) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email (e.g. you@example.com).';
      return null;
    },
    password(v) {
      if (!v)           return 'Password is required.';
      if (v.length < 6) return 'Must be at least 6 characters.';
      if (!/[A-Z]/.test(v)) return 'Must contain at least one uppercase letter.';
      if (!/[0-9]/.test(v)) return 'Must contain at least one number.';
      return null;
    },
    confirmPassword(v) {
      if (!v) return 'Please confirm your password.';
      if (v !== el.password.value) return 'Passwords do not match.';
      return null;
    },
    role(v) {
      if (!v) return 'Please select a role or interest.';
      const valid = ['frontend','backend','fullstack','data-science','devops','mobile','ui-ux'];
      if (!valid.includes(v)) return 'Invalid option selected.';
      return null;
    },
    bio(v) {
      if (!v.trim())             return 'Bio is required.';
      if (v.trim().length < 10)  return 'Must be at least 10 characters.';
      if (v.trim().length > 300) return 'Must be under 300 characters.';
      return null;
    },
  };

  // ── 2. UI STATE HELPER ──────────────────────────────────────────
  /**
   * Apply error or success styling to a field group.
   * @param {string} fieldName  - matches id pattern `grp-{fieldName}`
   * @param {string|null} msg   - error message, or null for valid state
   */
  const setField = (fieldName, msg) => {
    const group  = document.getElementById(`grp-${fieldName}`);
    const errEl  = document.getElementById(`err-${fieldName}`);
    if (!group) return;

    if (msg) {
      group.classList.add('has-err');
      group.classList.remove('is-ok');
      if (errEl) errEl.innerHTML = `<i class="bi bi-x-circle-fill"></i> ${msg}`;
    } else {
      group.classList.remove('has-err');
      group.classList.add('is-ok');
      if (errEl) errEl.innerHTML = '';
    }
  };

  // Validate a single named field and apply UI state
  const validateField = (name) => {
    const input = el[name];
    if (!input || !rules[name]) return true;
    const msg = rules[name](input.value);
    setField(name, msg);
    return msg === null;
  };

  // ── 3. BIND REAL-TIME LISTENERS ─────────────────────────────────
  Object.keys(rules).forEach(name => {
    const input = el[name];
    if (!input) return;

    // Validate when user leaves the field
    input.addEventListener('blur', () => validateField(name));

    // Re-validate on input while a field already has an error
    input.addEventListener('input', () => {
      const group = document.getElementById(`grp-${name}`);
      if (group && (group.classList.contains('has-err') || group.classList.contains('is-ok'))) {
        validateField(name);
      }
      // Confirm password should also re-check when main password changes
      if (name === 'password' && el.confirmPassword.value) {
        validateField('confirmPassword');
      }
    });
  });

  // ── 4. PASSWORD STRENGTH METER ──────────────────────────────────
  /**
   * Scoring rubric (additive):
   *   +1  length ≥ 6
   *   +1  length ≥ 10
   *   +1  contains uppercase AND lowercase
   *   +1  contains number AND special character
   *
   * Score → strength level:
   *   1 → weak  (red)
   *   2 → fair  (amber)
   *   3 → strong(green)
   *   4 → great (cyan accent)
   */
  const scorePassword = (v) => {
    if (!v) return 0;
    let score = 0;
    if (v.length >= 6)                              score++;
    if (v.length >= 10)                             score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v))        score++;
    if (/[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
    return score;
  };

  const strengthConfig = [
    { level: 'weak',   label: 'Weak password',   colour: 'weak'   },
    { level: 'fair',   label: 'Fair — add a symbol', colour: 'fair'   },
    { level: 'strong', label: 'Strong password',  colour: 'strong' },
    { level: 'great',  label: 'Excellent password ✓', colour: 'great'  },
  ];

  const updateMeter = (value) => {
    if (!el.pwMeter) return;

    if (!value) {
      el.pwMeter.style.display = 'none';
      el.pwSegs.forEach(s => { s.className = 'pw-seg'; });
      return;
    }

    el.pwMeter.style.display = 'block';
    const score  = Math.max(1, Math.min(4, scorePassword(value)));
    const config = strengthConfig[score - 1];

    el.pwSegs.forEach((seg, i) => {
      seg.className = `pw-seg${i < score ? ` ${config.colour}` : ''}`;
    });

    if (el.pwLabel) {
      el.pwLabel.textContent = config.label;
      el.pwLabel.style.color =
        score === 1 ? 'var(--error)' :
        score === 2 ? 'var(--warn)'  :
        score === 3 ? 'var(--ok)'    : 'var(--accent)';
    }
  };

  if (el.password) {
    el.password.addEventListener('input', () => updateMeter(el.password.value));
    el.password.addEventListener('blur',  () => {
      if (!el.password.value) {
        if (el.pwMeter) el.pwMeter.style.display = 'none';
      }
    });
  }

  // ── 5. PASSWORD SHOW / HIDE ──────────────────────────────────────
  if (el.eyeBtn && el.password) {
    el.eyeBtn.addEventListener('click', () => {
      const isHidden = el.password.type === 'password';
      el.password.type = isHidden ? 'text' : 'password';
      if (el.eyeIcon) {
        el.eyeIcon.className = isHidden ? 'bi bi-eye-slash' : 'bi bi-eye';
      }
      el.eyeBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
  }

  // ── 6. BIO CHARACTER COUNTER ─────────────────────────────────────
  const MAX_BIO = 300;
  const updateBioCount = () => {
    if (!el.bio || !el.bioCount) return;
    const len = el.bio.value.length;
    el.bioCount.textContent = `${len} / ${MAX_BIO}`;
    el.bioCount.className = 'char-ct' +
      (len >= MAX_BIO ? ' limit' : len >= MAX_BIO * 0.85 ? ' warn' : '');
  };
  if (el.bio) {
    el.bio.addEventListener('input', updateBioCount);
    updateBioCount(); // init on load (repopulated forms)
  }

  // ── 7. FULL FORM SUBMIT GATE ─────────────────────────────────────
  form.addEventListener('submit', (e) => {
    // Run all rules and collect results
    const fieldNames  = ['fullName', 'email', 'password', 'confirmPassword', 'role', 'bio'];
    const allValid    = fieldNames.every(name => validateField(name));

    if (!allValid) {
      e.preventDefault();
      // Scroll to first error so mobile users don't miss it
      const firstErr = form.querySelector('.has-err .field-input');
      if (firstErr) {
        firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        requestAnimationFrame(() => firstErr.focus());
      }
      return;
    }

    // Show loading state — prevents double-submit
    if (el.submitBtn) {
      el.submitBtn.classList.add('loading');
      el.submitBtn.disabled = true;
    }
  });

});
