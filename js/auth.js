/* ============================================================
   ZOO WEBAPP — AUTH.JS
   Session management, login, logout, route guard
   ============================================================ */

const SESSION_KEY = 'zoo_session';

const AUTH = {
  /**
   * Get current logged-in user from localStorage
   */
  getUser() {
    try {
      const data = localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Login with email and password
   * Returns { success, user, message }
   */
  login(email, password) {
    const user = findUser(email.trim().toLowerCase(), password);
    if (!user) {
      return { success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' };
    }
    if (user.status !== 'active') {
      return { success: false, message: 'บัญชีนี้ถูกระงับการใช้งาน' };
    }
    const session = {
      id: user.id,
      name: user.name,
      firstName: user.firstName,
      email: user.email,
      role: user.role,
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  /**
   * Register new account
   * Returns { success, user, message }
   */
  register(data) {
    if (findUserByEmail(data.email.trim().toLowerCase())) {
      return { success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' };
    }
    const newUser = registerUser({
      ...data,
      email: data.email.trim().toLowerCase()
    });
    const session = {
      id: newUser.id,
      name: newUser.name,
      firstName: newUser.firstName,
      email: newUser.email,
      role: newUser.role,
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  },

  /**
   * Logout - clear session
   */
  logout() {
    localStorage.removeItem(SESSION_KEY);
    CART.clear();
    window.location.href = '/login.html';
  },

  /**
   * Require authentication - redirect to login if not logged in
   */
  requireAuth() {
    const user = this.getUser();
    if (!user) {
      window.location.href = 'login.html';
      return null;
    }
    return user;
  },

  /**
   * Require admin role
   */
  requireAdmin() {
    const user = this.getUser();
    if (!user) {
      window.location.href = '../login.html';
      return null;
    }
    if (user.role !== 'admin') {
      window.location.href = '../index.html';
      return null;
    }
    return user;
  },

  /**
   * Is user logged in?
   */
  isLoggedIn() {
    return !!this.getUser();
  },

  /**
   * Is user admin?
   */
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  }
};

/* ============================================================
   NAVBAR INJECTION — shared across user pages
   ============================================================ */
function initNavbar(activePage = '') {
  const user = AUTH.getUser();
  const cartCount = CART.getCount();
  const isAdmin = window.location.pathname.includes('/admin/');
  const base = isAdmin ? '../' : '';

  const cartSVG = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;

  const rightLinks = user
    ? `
      <a href="${base}index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">หน้าหลัก</a>
      ${user.role === 'admin' ? `<a href="${base}admin/users.html" class="nav-link">จัดการระบบ</a>` : ''}
      <a href="${base}ticket-history.html" class="nav-link ${activePage === 'history' ? 'active' : ''}">ประวัติการซื้อบัตรเข้าชม</a>
      <div class="nav-account-dropdown">
        <button type="button" class="nav-account-toggle" id="account-toggle">
          บัญชี: ${user.firstName}
          <span class="account-menu-icon">☰</span>
        </button>
        <div class="account-dropdown-menu" id="account-menu">
          <a href="#" class="dropdown-item" onclick="AUTH.logout()">
            <span style="font-size: 1.1rem;">🚪</span> ออกจากระบบ
          </a>
        </div>
      </div>
      <button type="button" class="cart-btn" onclick="openCartPanel()" title="ตะกร้า">
        ${cartSVG}
        <span class="cart-badge ${cartCount > 0 ? 'show' : ''}" id="cart-badge"></span>
      </button>
    `
    : `
      <a href="${base}index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">หน้าหลัก</a>
      <a href="${base}login.html" class="btn-nav-auth">ล็อกอิน</a>
    `;

  const logoSrc = `${base}images/ZOOLogo.png`;

  const navbarHTML = `
    <nav class="navbar">
      <div class="container navbar-inner">
        <a href="${base}index.html" class="nav-brand">
          <div class="nav-logo-wrap">
            <img src="${logoSrc}" alt="สวนสัตว์เขาไม่รัก" class="nav-logo"
              onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=nav-logo-fallback>🦁</div>'"
            >
          </div>
        </a>
        
        <div class="nav-toggle" id="mobile-toggle">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div class="nav-right-group" id="nav-menu">
          ${rightLinks}
        </div>
      </div>
    </nav>
  `;

  // ... after injection
  const existingNav = document.querySelector('.navbar');
  if (existingNav) existingNav.remove();
  const div = document.createElement('div');
  div.innerHTML = navbarHTML;
  document.body.insertBefore(div.firstElementChild, document.body.firstChild);

  // Toggle Logic
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      menu.classList.toggle('active');
    });
  }

  // Account Dropdown Toggle
  const accountToggle = document.getElementById('account-toggle');
  const accountMenu = document.getElementById('account-menu');
  if (accountToggle && accountMenu) {
    accountToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      accountMenu.classList.toggle('active');
      accountToggle.classList.toggle('active');
    });
    document.addEventListener('click', () => {
      accountMenu.classList.remove('active');
      accountToggle.classList.remove('active');
    });
  }
}

/**
 * Update cart badge (red dot style)
 */
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const count = CART.getCount();
  badge.className = count > 0 ? 'cart-badge show' : 'cart-badge';
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function initToaster() {
  if (document.querySelector('.toast-container')) return;
  const container = document.createElement('div');
  container.className = 'toast-container';
  container.id = 'toast-container';
  document.body.appendChild(container);
}

function showToast(message, type = 'success', duration = 3500) {
  initToaster();
  const container = document.getElementById('toast-container');

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || '📢'}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => { toast.classList.add('show'); });
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ============================================================
   FOOTER INJECTION
   ============================================================ */
function initFooter() {
  const isAdmin = window.location.pathname.includes('/admin/');
  const basePath = isAdmin ? '../' : '';

  const footerHTML = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img src="${basePath}images/ZOOLogo.png" alt="logo" class="nav-logo" onerror="this.style.display='none'">
            <p>สวนสัตว์เขาไม่รัก — แหล่งท่องเที่ยวเชิงนิเวศและการอนุรักษ์ที่ยอดเยี่ยม<br>ยินดีต้อนรับสู่โลกของสัตว์ป่า</p>
          </div>
          <div class="footer-col">
            <h5>เมนูหลัก</h5>
            <ul>
              <li><a href="${basePath}index.html">หน้าหลัก</a></li>
              <li><a href="${basePath}animals.html">สัตว์ในสวน</a></li>
              <li><a href="${basePath}tickets.html">ซื้อบัตรเข้าชม</a></li>
              <li><a href="${basePath}ticket-history.html">ประวัติการซื้อ</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>ข้อมูล</h5>
            <ul>
              <li><a href="#">เกี่ยวกับเรา</a></li>
              <li><a href="#">รายการแสดง</a></li>
              <li><a href="#">แผนที่สวนสัตว์</a></li>
              <li><a href="#">นโยบายความเป็นส่วนตัว</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>ติดต่อเรา</h5>
            <ul>
              <li><a href="tel:020000001">📞 02-000-0001</a></li>
              <li><a href="mailto:info@zoo.th">✉️ info@zoo.th</a></li>
              <li><a href="#">📍 กรุงเทพมหานคร, ไทย</a></li>
              <li><a href="#">⏰ 08:00–18:00 น.</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2026 สวนสัตว์เขาไม่รัก. สงวนลิขสิทธิ์ทุกประการ | Developed for CS251</p>
        </div>
      </div>
    </footer>
  `;

  const existingFooter = document.querySelector('.footer');
  if (existingFooter) existingFooter.remove();

  document.body.insertAdjacentHTML('beforeend', footerHTML);
}

/* ============================================================
   PASSWORD TOGGLE
   ============================================================ */
function initPasswordToggles() {
  document.querySelectorAll('[data-pw-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-pw-toggle');
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.textContent = isPassword ? '👁️' : '🙈';
    });
  });
}

/* ============================================================
   MODAL HELPERS
   ============================================================ */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function initModalCloseHandlers() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });
}

/* ============================================================
   FORMAT HELPERS
   ============================================================ */
function formatPrice(amount) {
  if (amount === 0) return 'ฟรี';
  return `฿${amount.toLocaleString('th-TH')}`;
}

function formatPriceFull(amount) {
  return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`;
}

/* ============================================================
   CART SIDE PANEL (Figma-matching drawer)
   ============================================================ */
function initCartPanel() {
  if (document.getElementById('cart-panel-overlay')) return;
  const el = document.createElement('div');
  el.innerHTML = `
    <div class="cart-panel-overlay" id="cart-panel-overlay">
      <div class="cart-panel" id="cart-panel"></div>
    </div>
  `;
  document.body.appendChild(el.firstElementChild);

  document.getElementById('cart-panel-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeCartPanelForce();
  });
}

function openCartPanel() {
  initCartPanel();
  renderCartPanel();
  requestAnimationFrame(() => {
    document.getElementById('cart-panel-overlay').classList.add('open');
  });
  document.body.style.overflow = 'hidden';
}

function closeCartPanelForce() {
  const overlay = document.getElementById('cart-panel-overlay');
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}

function renderCartPanel() {
  const panel = document.getElementById('cart-panel');
  if (!panel) return;
  const items = CART.getItems();
  const promo = CART.getPromo();

  const header = `
    <div class="cp-header">
      <button class="cp-close" onclick="closeCartPanelForce()">&#10005;</button>
    </div>
  `;

  let body = '';
  if (items.length === 0) {
    body = `<div class="cp-empty">ยังไม่มีอะไรในตะกร้า</div>`;
  } else {
    body = `
      <div class="cp-col-header">
        <span>รายละเอียด</span>
        <span>จำนวน</span>
      </div>
      <div class="cp-divider"></div>
      <div class="cp-items">
        ${items.map(item => `
          <div class="cp-item">
            <div class="cp-item-label">บัตรราคา${item.type}</div>
            <div class="cp-item-qty">
              <button class="cp-qty-btn" onclick="changePanelQty('${item.id}', -1)">⊖</button>
              <span class="cp-qty-val">x${item.qty}</span>
              <button class="cp-qty-btn" onclick="changePanelQty('${item.id}', 1)">⊕</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  const promoHTML = `
    <div class="cp-promo">
      <input
        type="text"
        class="cp-promo-input"
        id="cp-promo-input"
        placeholder="Promocode"
        value="${promo ? promo.code : ''}"
      >
      <div class="cp-promo-msg" id="cp-promo-msg"></div>
    </div>
  `;

  const continueBtn = items.length > 0
    ? `<button class="cp-continue" onclick="window.location.href='payment.html'">ดำเนินการต่อ</button>`
    : '';

  panel.innerHTML = header + body + '<div class="cp-spacer"></div>' + promoHTML + continueBtn;

  const pi = document.getElementById('cp-promo-input');
  if (pi) {
    pi.addEventListener('keypress', e => { if (e.key === 'Enter') applyPanelPromo(); });
  }
}

function changePanelQty(ticketId, delta) {
  const item = CART.getItems().find(i => i.id === ticketId);
  if (!item) return;
  const newQty = item.qty + delta;
  if (newQty <= 0) CART.removeItem(ticketId);
  else CART.setQty(ticketId, newQty);
  renderCartPanel();
  updateCartBadge();
}

function applyPanelPromo() {
  const code = (document.getElementById('cp-promo-input')?.value || '').trim();
  if (!code) return;
  const result = CART.applyPromo(code);
  const msg = document.getElementById('cp-promo-msg');
  if (msg) {
    msg.textContent = result.valid ? `✓ ${result.message}` : `✗ ${result.message}`;
    msg.style.color = result.valid ? 'var(--primary)' : 'var(--danger)';
  }
}
