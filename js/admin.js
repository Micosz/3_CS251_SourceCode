/**
 * Admin Layout Helper
 */

// Side links configuration
const ADMIN_LINKS = [
  { id: 'users', label: 'จัดการบัญชีผู้ใช้', icon: '👥', url: 'users.html' },
  { id: 'animals', label: 'จัดการข้อมูลสัตว์', icon: '🦏', url: 'zones.html' },
  { id: 'tickets', label: 'จัดการระบบตั๋ว', icon: '🎟️', url: 'tickets.html' }
];

function initAdminLayout(activeId) {
  // Check auth
  const user = AUTH.getUser();
  console.log('Admin Auth Check - User:', user);
  if (!user || user.role !== 'admin') {
    console.warn('Admin access denied. Redirecting to login. Current role:', user ? user.role : 'none');
    window.location.href = '../login.html';
    return;
  }

  // Sidebar HTML
  const sidebar = document.createElement('aside');
  sidebar.className = 'admin-sidebar';
  
  let navItems = ADMIN_LINKS.map(link => `
    <a href="${link.url}" class="nav-item ${link.id === activeId ? 'active' : ''}">
      <span class="nav-icon">${link.icon}</span>
      <span class="nav-label">${link.label}</span>
    </a>
  `).join('');

  sidebar.innerHTML = `
    <div class="admin-sidebar-header">
      <img src="../images/ZOOLogo.png" class="sidebar-logo" alt="Logo" onerror="this.src='https://ui-avatars.com/api/?name=Zoo&background=1B4332&color=fff'">
      <span>สวนสัตว์เขาไม่รัก <small>Admin</small></span>
    </div>
    <nav class="admin-nav">
      ${navItems}
    </nav>
    <div class="admin-sidebar-footer">
      <button onclick="AUTH.logout()" class="nav-item logout-btn">
        <span class="nav-icon">🚪</span>
        <span class="nav-label">ออกจากระบบ</span>
      </button>
    </div>
  `;

  document.body.prepend(sidebar);

  // Mobile Sidebar Toggle
  if (!document.querySelector('.admin-sidebar-toggle')) {
    const toggle = document.createElement('button');
    toggle.className = 'admin-sidebar-toggle';
    toggle.innerHTML = '☰';
    toggle.onclick = () => {
      sidebar.classList.toggle('active');
      toggle.innerHTML = sidebar.classList.contains('active') ? '✕' : '☰';
    };
    document.body.appendChild(toggle);
  }
}

// Utility to generate random ID like in screenshot
function generateMockId(prefix = '#') {
  return prefix + Math.floor(100000 + Math.random() * 900000);
}
