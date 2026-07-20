/* ============================================================
   SHARED NAVIGATION + FOOTER
   Injects the same nav bar and footer into every public page,
   so there is exactly one place to edit them. Each page just
   needs:
     <div id="nav-root"></div>
     <div id="footer-root"></div>
   and must load this file, then call initSite('pageId').
============================================================ */

const SITE_LINKS = [
  { id: 'home',          href: 'index.html',         label: 'Home' },
  { id: 'announcements',  href: 'announcements.html', label: 'Balita' },
  { id: 'about',          href: 'about.html',         label: 'Tungkol Sa Amin' },
  { id: 'faqs',           href: 'faqs.html',          label: 'FAQs' },
  { id: 'enrollment',     href: 'enrollment.html',    label: 'Mag-Enroll', enroll: true },
];

function renderNav(activePage) {
  const root = document.getElementById('nav-root');
  if (!root) return;

  const linksHtml = SITE_LINKS.map(link => {
    const classes = [
      link.id === activePage ? 'active' : '',
      link.enroll ? 'nav-enroll' : ''
    ].filter(Boolean).join(' ');
    return `<li><a href="${link.href}"${classes ? ` class="${classes}"` : ''}>${link.label}</a></li>`;
  }).join('');

  root.innerHTML = `
    <nav>
      <div class="nav-inner">
        <div class="nav-brand">
          <a href="index.html" style="display:flex; align-items:center; gap:12px;">
            <img src="assets/logo.png" alt="School Logo" class="nav-logo" />
            <span class="nav-name">Tiu Cho Teg - Ana Ros Foundation Integrated Farm School</span>
          </a>
        </div>
        <button class="nav-toggle" onclick="toggleNav()" aria-label="Menu">☰</button>
        <ul class="nav-links" id="navLinks">
          ${linksHtml}
        </ul>
      </div>
    </nav>
  `;
}

function renderFooter() {
  const root = document.getElementById('footer-root');
  if (!root) return;

  root.innerHTML = `
    <footer>
      <div class="footer-inner">
        <p class="footer-name">Tiu Cho Teg - Ana Ros Foundation Integrated Farm School</p>
        <p class="footer-meta">Iloilo Radial By-Pass Rd 4, Lanit, Jaro, Iloilo City · +63 33 337 8522 · 500191@deped.gov.ph</p>
        <p class="footer-meta">Pampublikong Paaralan · Department of Education</p>
        <div class="footer-links">
          <a href="index.html">Home</a>
          <a href="announcements.html">Balita</a>
          <a href="about.html">Tungkol Sa Amin</a>
          <a href="faqs.html">FAQs</a>
          <a href="enrollment.html">Enrollment</a>
          <a href="admin.html">Admin</a>
        </div>
      </div>
    </footer>
  `;
}

function toggleNav() {
  document.getElementById('navLinks').classList.toggle('open');
}

function initSite(activePage) {
  renderNav(activePage);
  renderFooter();
}
