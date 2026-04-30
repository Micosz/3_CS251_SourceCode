/* ============================================================
   ZOO WEB APP - SHARED LAYOUT HELPERS
   Fixes:
   - Provides global initNavbar/initFooter so every page can render them.
   - Provides safe UI helpers so one missing element does not break a page.
   - Provides updateCartBadge/showToast/openModal used by other scripts.
   ============================================================ */

(function () {
  'use strict';

  function safe(fn, fallback) {
    try {
      return fn();
    } catch (err) {
      console.error(err);
      return fallback;
    }
  }

  function isAdminPath() {
    return window.location.pathname.includes('/admin/');
  }

  function assetBase() {
    return isAdminPath() ? '../' : '';
  }

  function getUser() {
    if (window.AUTH && typeof window.AUTH.getUser === 'function') {
      return window.AUTH.getUser();
    }

    return safe(function () {
      const raw = localStorage.getItem('zoo_session');
      return raw ? JSON.parse(raw) : null;
    }, null);
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initNavbar(activePage) {
    safe(function () {
      const base = assetBase();
      const user = getUser();
      const existing = document.querySelector('.navbar');

      if (existing) existing.remove();

      const links = [
        { key: 'home', href: 'index.html', label: 'Home' },
        { key: 'animals', href: 'animals.html', label: 'Animals' },
        { key: 'tickets', href: 'tickets.html', label: 'Tickets' },
        { key: 'history', href: 'ticket-history.html', label: 'History', auth: true }
      ];

      const navLinks = links
        .filter(function (link) { return !link.auth || user; })
        .map(function (link) {
          return '<a class="nav-link ' + (activePage === link.key ? 'active' : '') + '" href="' + base + link.href + '">' + link.label + '</a>';
        })
        .join('');

      const authHTML = user
        ? '<div class="nav-account-dropdown">' +
            '<button class="nav-account-toggle" type="button" id="account-toggle">' +
              '<span>' + escapeHTML(user.firstName || user.name || user.username || 'Account') + '</span>' +
              '<span class="account-menu-icon">›</span>' +
            '</button>' +
            '<div class="account-dropdown-menu" id="account-menu">' +
              (user.role === 'admin' ? '<a class="dropdown-item" href="' + base + 'admin/users.html">Admin</a>' : '') +
              '<a class="dropdown-item" href="' + base + 'ticket-history.html">Ticket history</a>' +
              '<button class="dropdown-item" type="button" id="logout-btn">Logout</button>' +
            '</div>' +
          '</div>'
        : '<a class="btn-nav-auth" href="' + base + 'login.html">Login</a>';

      const nav = document.createElement('nav');
      nav.className = 'navbar';
      nav.innerHTML =
        '<div class="container navbar-inner">' +
          '<a class="nav-brand" href="' + base + 'index.html" aria-label="Zoo home">' +
            '<span class="nav-logo-wrap">' +
              '<img class="nav-logo" src="' + base + 'images/ZOOLogo.png" alt="Zoo logo" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' +
              '<span class="nav-logo-fallback" style="display:none;">Z</span>' +
            '</span>' +
          '</a>' +
          '<button class="nav-toggle" type="button" id="nav-toggle" aria-label="Menu"><span></span><span></span><span></span></button>' +
          '<div class="nav-right-group" id="nav-menu">' +
            navLinks +
            '<a class="cart-btn" href="' + base + 'cart.html" aria-label="Cart">Cart<span class="cart-badge" id="cart-badge"></span></a>' +
            authHTML +
          '</div>' +
        '</div>';

      document.body.insertBefore(nav, document.body.firstChild);

      const toggle = document.getElementById('nav-toggle');
      const menu = document.getElementById('nav-menu');
      if (toggle && menu) {
        toggle.addEventListener('click', function () {
          toggle.classList.toggle('active');
          menu.classList.toggle('active');
        });
      }

      const accountToggle = document.getElementById('account-toggle');
      const accountMenu = document.getElementById('account-menu');
      if (accountToggle && accountMenu) {
        accountToggle.addEventListener('click', function (event) {
          event.stopPropagation();
          accountToggle.classList.toggle('active');
          accountMenu.classList.toggle('active');
        });

        document.addEventListener('click', function () {
          accountToggle.classList.remove('active');
          accountMenu.classList.remove('active');
        });
      }

      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
          if (window.AUTH && typeof window.AUTH.logout === 'function') {
            window.AUTH.logout();
          } else {
            localStorage.removeItem('zoo_session');
            window.location.href = base + 'login.html';
          }
        });
      }

      updateCartBadge();
    });
  }

  function initFooter() {
    safe(function () {
      if (document.querySelector('.site-footer')) return;

      const base = assetBase();
      const footer = document.createElement('footer');
      footer.className = 'site-footer';
      footer.style.cssText = 'margin-top:4rem;padding:2rem 0;background:#1B4332;color:white;';
      footer.innerHTML =
        '<div class="container" style="display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;align-items:center;">' +
          '<div style="font-weight:700;">Khao Mai Rak Zoo</div>' +
          '<div style="display:flex;gap:1rem;font-size:0.9rem;">' +
            '<a href="' + base + 'index.html">Home</a>' +
            '<a href="' + base + 'animals.html">Animals</a>' +
            '<a href="' + base + 'tickets.html">Tickets</a>' +
          '</div>' +
        '</div>';
      document.body.appendChild(footer);
    });
  }

  function initToaster() {
    safe(function () {
      if (document.getElementById('toast-container')) return;
      const container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    });
  }

  function showToast(message, type) {
    safe(function () {
      initToaster();
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = 'toast toast-' + (type || 'info');
      toast.textContent = message || '';
      container.appendChild(toast);

      requestAnimationFrame(function () {
        toast.classList.add('show');
      });

      setTimeout(function () {
        toast.classList.remove('show');
        setTimeout(function () { toast.remove(); }, 300);
      }, 2600);
    });
  }

  function updateCartBadge() {
    safe(function () {
      const badge = document.getElementById('cart-badge');
      if (!badge) return;

      const count = window.CART && typeof window.CART.getCount === 'function'
        ? window.CART.getCount()
        : safe(function () {
            const items = JSON.parse(localStorage.getItem('zoo_cart') || '[]');
            return items.reduce(function (sum, item) { return sum + (Number(item.qty) || 0); }, 0);
          }, 0);

      badge.classList.toggle('show', count > 0);
      badge.textContent = count > 0 ? String(count) : '';
      badge.style.width = count > 0 ? '18px' : '';
      badge.style.height = count > 0 ? '18px' : '';
      badge.style.fontSize = count > 0 ? '0.7rem' : '';
      badge.style.display = count > 0 ? 'flex' : '';
      badge.style.alignItems = count > 0 ? 'center' : '';
      badge.style.justifyContent = count > 0 ? 'center' : '';
      badge.style.color = count > 0 ? '#fff' : '';
    });
  }

  function openModal(id) {
    safe(function () {
      const modal = document.getElementById(id);
      if (modal) modal.classList.add('active');
    });
  }

  function closeModal(id) {
    safe(function () {
      const modal = document.getElementById(id);
      if (modal) modal.classList.remove('active');
    });
  }

  function validatePromo(code, subtotal) {
    const normalized = String(code || '').trim().toUpperCase();
    const total = Number(subtotal) || 0;
    const promos = {
      '3SALE': { code: '3SALE', amount: 30, min: 0 },
      'ZOO10': { code: 'ZOO10', percent: 10, min: 0 },
      'SAVE50': { code: 'SAVE50', amount: 50, min: 300 }
    };

    const promo = promos[normalized];
    if (!promo) {
      return { valid: false, message: 'Invalid promotion code' };
    }

    if (total < promo.min) {
      return { valid: false, message: 'Minimum total is ' + promo.min + ' baht' };
    }

    const discountAmount = Math.min(total, promo.amount || Math.round(total * promo.percent / 100));
    return {
      valid: true,
      promo: promo,
      discountAmount: discountAmount,
      message: 'Promotion applied'
    };
  }

  function initPasswordToggles() {
    safe(function () {
      document.querySelectorAll('[data-toggle-password], .input-icon-right').forEach(function (toggle) {
        if (toggle.dataset.boundPasswordToggle === '1') return;
        toggle.dataset.boundPasswordToggle = '1';
        toggle.addEventListener('click', function () {
          const groupInput = toggle.parentElement ? toggle.parentElement.querySelector('input') : null;
          const target = toggle.getAttribute('data-toggle-password');
          const input = target ? document.querySelector(target) : groupInput;
          if (!input) return;
          input.type = input.type === 'password' ? 'text' : 'password';
          toggle.textContent = input.type === 'password' ? 'Show' : 'Hide';
        });
      });
    });
  }

  function getFeaturedAnimals() {
    return [
      { id: 1, nameTH: 'Hedgehog', speciesTH: 'Hedgehog', cardImage: 'images/animals/3.png' },
      { id: 2, nameTH: 'Lion', speciesTH: 'Lion', cardImage: 'images/Orangutan.png' },
      { id: 3, nameTH: 'Rhino', speciesTH: 'Rhino', cardImage: 'images/rhino-white-background-1 1.png' }
    ];
  }

  window.initNavbar = initNavbar;
  window.initFooter = initFooter;
  window.initToaster = initToaster;
  window.showToast = showToast;
  window.updateCartBadge = updateCartBadge;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.validatePromo = validatePromo;
  window.initPasswordToggles = initPasswordToggles;
  window.getFeaturedAnimals = window.getFeaturedAnimals || getFeaturedAnimals;
})();
