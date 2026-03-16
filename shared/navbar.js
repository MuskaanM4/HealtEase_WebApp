document.addEventListener('DOMContentLoaded', () => {
  function safeQuery(sel, ctx=document) { return Array.from((ctx || document).querySelectorAll(sel) || []); }
  const userRaw = localStorage.getItem('he_user');
  const user = userRaw ? JSON.parse(userRaw) : null;

  // Replace login links in offcanvas menus with account/logout when logged in
  const replaceLoginLinks = () => {
    safeQuery('a[href="login.html"]').forEach(a => {
      if (user) {
        a.textContent = 'Logout';
        a.href = '#';
        a.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('he_user'); localStorage.removeItem('he_token'); window.location.reload(); });
      } else {
        // When clicking login, remember where we came from
        a.addEventListener('click', () => sessionStorage.setItem('returnTo', window.location.pathname));
      }
    });
  };

  // Ensure My Account links are visible and direct to account.html
  const ensureAccountLinks = () => {
    safeQuery('a[href="account.html"]').forEach(a => { a.style.display = 'block'; });
  };

  // Show user badge in header if possible (improved UI)
  const showHeaderUser = () => {
    const headers = safeQuery('.he-header');

    headers.forEach(h => {
      if (!h.querySelector('.he-user-badge')) {
        const div = document.createElement('div');
        div.className = 'he-user-badge d-flex align-items-center gap-3 px-3 py-2 rounded-pill shadow';
        div.style.background = '#e7f4f2';
        div.style.border = '1px solid #cfe7e3';

        if (user) {
          const initials = user.email ? user.email.charAt(0).toUpperCase() : 'U';

          div.innerHTML = `
            <div style="width:38px;height:38px;border-radius:50%;background:#0c3b5d;color:white;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.15);">
              ${initials}
            </div>
            <div style="color:#0c3b5d;font-size:13px;font-weight:600;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              ${user.email}
            </div>
            <a href="#" class="small text-danger text-decoration-none ms-2" id="heLogout">Logout</a>
          `;
        } else {
          div.innerHTML = `<a href="login.html" class="text-decoration-none fw-semibold">Login</a>`;
        }

        const right = h.querySelector('.d-flex.align-items-center.gap-3');
        if (right) right.appendChild(div);

        const logoutBtn = div.querySelector('#heLogout');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('he_user');
            localStorage.removeItem('he_token');
            window.location.reload();
          });
        }
      }
    });
  };

  replaceLoginLinks();
  ensureAccountLinks();
  showHeaderUser();
});
