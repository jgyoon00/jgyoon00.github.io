/* ── Theme Toggle ────────────────────────────────────────────── */
(function () {
  const root = document.documentElement;
  const toggles = document.querySelectorAll('[data-theme-toggle]');
  let theme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  root.setAttribute('data-theme', theme);

  function updateToggleIcon(t) {
    toggles.forEach(el => {
      el.setAttribute('aria-label', 'Switch to ' + (t === 'dark' ? 'light' : 'dark') + ' mode');
      el.innerHTML = t === 'dark'
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    });
  }

  updateToggleIcon(theme);
  toggles.forEach(el => {
    el.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', theme);
      updateToggleIcon(theme);
    });
  });
})();

/* ── Sticky Nav ──────────────────────────────────────────────── */
const nav = document.querySelector('.site-nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

/* ── Mobile Menu ─────────────────────────────────────────────── */
const mobileToggle = document.querySelector('.nav-mobile-toggle');
const navLinks = document.querySelector('.nav-links');
if (mobileToggle && navLinks) {
  mobileToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

/* ── Scroll Fade Animations ──────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

/* ── Publication Filter & Groups ─────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const pubItems = document.querySelectorAll('.pub-item');
const hdToggle = document.querySelector('.pub-group-toggle');
const hdPanel = document.getElementById('pub-group-hd');

function setHdPanelOpen(open) {
  if (!hdPanel || !hdToggle) return;
  hdPanel.classList.toggle('is-open', open);
  hdToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  hdToggle.classList.toggle('is-open', open);
}

function applyPubFilter(filter) {
  let hdHasMatch = false;

  pubItems.forEach(item => {
    const types = (item.dataset.type || '').split(' ').filter(Boolean);
    const matches = filter === 'all' || types.includes(filter);
    if (filter === 'all') {
      item.style.display = '';
    } else {
      item.style.display = matches ? 'block' : 'none';
      if (matches && item.dataset.group === 'hd') hdHasMatch = true;
    }
  });

  if (filter === 'all') {
    setHdPanelOpen(false);
  } else if (hdHasMatch) {
    setHdPanelOpen(true);
  }
}

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyPubFilter(btn.dataset.filter);
  });
});

if (hdToggle && hdPanel) {
  hdToggle.addEventListener('click', () => {
    setHdPanelOpen(!hdPanel.classList.contains('is-open'));
  });
}

/* ── Tab Navigation ──────────────────────────────────────────── */
const tabLinks  = document.querySelectorAll('[data-tab]');
const tabPanels = document.querySelectorAll('.tab-panel');
const VALID_TABS = ['home', 'research', 'publications', 'contact'];

function switchTab(tabId) {
  if (!VALID_TABS.includes(tabId)) tabId = 'home';

  // Show/hide panels
  tabPanels.forEach(panel => {
    panel.classList.toggle('active', panel.id === 'tab-' + tabId);
  });

  // Update active tab link
  tabLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.tab === tabId);
  });

  // Trigger fade-up for newly visible elements
  const active = document.getElementById('tab-' + tabId);
  if (active) {
    active.querySelectorAll('.fade-up').forEach(el => el.classList.add('visible'));
  }

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Sync URL hash without pushing history
  history.replaceState(null, '', '#' + tabId);
}

// Init from URL hash (or default to home)
switchTab(window.location.hash.slice(1) || 'home');

// Tab clicks
tabLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    switchTab(link.dataset.tab);
    if (navLinks) navLinks.classList.remove('open');
  });
});

// Handle hero CTA buttons like <a href="#research"> → switch tab
document.querySelectorAll('a[href^="#"]').forEach(a => {
  if (!a.dataset.tab) {
    const target = a.getAttribute('href').slice(1);
    if (VALID_TABS.includes(target)) {
      a.addEventListener('click', e => {
        e.preventDefault();
        switchTab(target);
      });
    }
  }
});

// Browser back/forward
window.addEventListener('popstate', () => {
  switchTab(window.location.hash.slice(1) || 'home');
});
