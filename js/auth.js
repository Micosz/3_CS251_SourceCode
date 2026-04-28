/* ============================================================
   ZOO WEB APP - AUTH
   Fixes:
   - Uses username + plain-text password.
   - Stores one simple localStorage session.
   - Exposes AUTH on window so every page can safely call it.
   - Login/register always return a predictable { success, message, user } object.
   ============================================================ */

(function () {
  'use strict';

  const SESSION_KEY = 'zoo_session';
  const API_BASE = '/api';

  function safeJSON(response) {
    return response.text().then(function (text) {
      try {
        return text ? JSON.parse(text) : {};
      } catch (err) {
        return {
          success: false,
          message: 'Server returned an invalid response.'
        };
      }
    });
  }

  const AUTH = {
    getUser() {
      try {
        const data = localStorage.getItem(SESSION_KEY);
        return data ? JSON.parse(data) : null;
      } catch (err) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
    },

    setUser(user) {
      if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      }
    },

    async login(username, password) {
      try {
        const res = await fetch(API_BASE + '/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: String(username || '').trim(),
            password: String(password || '')
          })
        });

        const result = await safeJSON(res);

        if (res.ok && result.success && result.user) {
          this.setUser(result.user);
        }

        return {
          success: !!(res.ok && result.success),
          message: result.message || (res.ok ? '' : 'Login failed.'),
          user: result.user || null
        };
      } catch (err) {
        console.error('Login error:', err);
        return {
          success: false,
          message: 'Cannot connect to the server.',
          user: null
        };
      }
    },

    async register(data) {
      try {
        const res = await fetch(API_BASE + '/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data || {})
        });

        const result = await safeJSON(res);

        if (res.ok && result.success && result.user) {
          this.setUser(result.user);
        }

        return {
          success: !!(res.ok && result.success),
          message: result.message || (res.ok ? '' : 'Register failed.'),
          user: result.user || null
        };
      } catch (err) {
        console.error('Register error:', err);
        return {
          success: false,
          message: 'Cannot connect to the server.',
          user: null
        };
      }
    },

    logout() {
      localStorage.removeItem(SESSION_KEY);

      if (window.CART && typeof window.CART.clear === 'function') {
        window.CART.clear();
      }

      window.location.href = window.location.pathname.includes('/admin/')
        ? '../login.html'
        : 'login.html';
    },

    requireAuth() {
      const user = this.getUser();

      if (!user) {
        window.location.href = window.location.pathname.includes('/admin/')
          ? '../login.html'
          : 'login.html';
        return null;
      }

      return user;
    },

    requireAdmin() {
      const user = this.getUser();

      if (!user) {
        window.location.href = '../login.html';
        return null;
      }

      if (String(user.role).toLowerCase() !== 'admin') {
        window.location.href = '../index.html';
        return null;
      }

      return user;
    },

    isLoggedIn() {
      return !!this.getUser();
    },

    isAdmin() {
      const user = this.getUser();
      return !!user && String(user.role).toLowerCase() === 'admin';
    }
  };

  window.AUTH = AUTH;
})();
