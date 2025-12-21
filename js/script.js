// Main initializer: wires navigation and tab-specific initializers

document.addEventListener('DOMContentLoaded', () => {
  // Attach checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn && typeof checkout === 'function') {
    checkoutBtn.addEventListener('click', checkout);
  }

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    const paymentModal = document.getElementById('paymentModal');
    const cartModal = document.getElementById('cartModal');

    if (e.target === paymentModal && typeof closePaymentModal === 'function') {
      closePaymentModal();
    }
    if (e.target === cartModal && typeof closeCartModal === 'function') {
      closeCartModal();
    }
  });

  // Navigation buttons and pages
  const navButtons = document.querySelectorAll('.nav-btn');
  const pages = document.querySelectorAll('.page');

  const pageInitMap = {
    inicio: typeof initInicio === 'function' ? initInicio : null,
    petiscos: typeof initPetiscos === 'function' ? initPetiscos : null,
    lanches: typeof initLanches === 'function' ? initLanches : null,
    doces: typeof initDoces === 'function' ? initDoces : null,
    drinks: typeof initDrinks === 'function' ? initDrinks : null,
    feedback: typeof initFeedback === 'function' ? initFeedback : null,
    sobre: typeof initSobre === 'function' ? initSobre : null,
  };

  const loadPageTemplate = async (pageName) => {
    const container = document.getElementById(`${pageName}-page`);
    if (!container || container.dataset.loaded === 'true') return;
    const buildOfflineMarkup = (name) => {
      switch (name) {
        case 'inicio':
          return `
            <section>
              <h2>Mais pedidos</h2>
              <div id="maispedidosGrid" class="menu-grid"></div>
            </section>
            <section>
              <h2>Promoções</h2>
              <div id="promocaoGrid" class="menu-grid"></div>
            </section>
            <section>
              <h2>Combos</h2>
              <div id="combosGrid" class="menu-grid"></div>
            </section>
          `;
        case 'petiscos':
          return `<div id="petiscosGrid" class="menu-grid"></div>`;
        case 'lanches':
          return `<div id="lanchesGrid" class="menu-grid"></div>`;
        case 'doces':
          return `<div id="docesGrid" class="menu-grid"></div>`;
        case 'drinks':
          return `<div id="drinksGrid" class="menu-grid"></div>`;
        case 'sobre':
          return `
            <header class="page-header">
              <h1 id="aboutNameDisplay">Sobre o Restaurante</h1>
            <p id="aboutSloganDisplay" style="color: var(--muted); margin-top:4px;"></p>
            </header>
            <div class="about-hero" style="margin:8px 0 16px 0;">
              <img id="aboutImageDisplay" alt="Foto do restaurante" style="width:100%;max-height:260px;object-fit:cover;border-radius:12px;display:none;">
            </div>
            <div class="about-content" style="display:grid; gap:16px;">
              <section>
                <h2>História</h2>
                <p id="aboutHistoryDisplay">Conteúdo não definido ainda.</p>
              </section>
              <section>
                <h2>Nossa Comida</h2>
                <p id="aboutFoodDisplay">Conteúdo não definido ainda.</p>
              </section>
              <section>
                <h2>Equipe</h2>
                <p id="aboutStaffDisplay">Conteúdo não definido ainda.</p>
              </section>
            </div>
          `;
        default:
          return '';
      }
    };

    const isFileProto = window.location.protocol === 'file:';
    if (isFileProto) {
      const offlineHTML = buildOfflineMarkup(pageName);
      if (offlineHTML) {
        container.innerHTML = offlineHTML;
        container.dataset.loaded = 'true';
      }
      return;
    }

    try {
      const res = await fetch(`html/${pageName}.html`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch');
      const html = await res.text();
      container.innerHTML = html;
      container.dataset.loaded = 'true';
    } catch (err) {
      // Fallback to offline markup if fetch fails
      const offlineHTML = buildOfflineMarkup(pageName);
      if (offlineHTML) {
        container.innerHTML = offlineHTML;
        container.dataset.loaded = 'true';
      }
    }
  };

  const initPage = async (pageName) => {
    await loadPageTemplate(pageName);
    const initFn = pageInitMap[pageName];
    if (typeof initFn === 'function') {
      initFn();
    }
  };

  navButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const pageName = button.getAttribute('data-page');

      // Toggle active classes
      navButtons.forEach((btn) => btn.classList.remove('active'));
      pages.forEach((page) => page.classList.remove('active'));

      button.classList.add('active');
      const targetPage = document.getElementById(`${pageName}-page`);
      if (targetPage) {
        targetPage.classList.add('active');
      }

      // Show/hide cart bar based on page
      const cartBar = document.querySelector('.cart-bar');
      if (cartBar) {
        cartBar.style.display = pageName === 'sobre' ? 'none' : 'flex';
      }

      // Initialize selected page
      await initPage(pageName);
    });
  });

  // Clicking the logo opens the 'Sobre' page
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', async () => {
      // Deactivate current active page and buttons
      navButtons.forEach((btn) => btn.classList.remove('active'));
      pages.forEach((page) => page.classList.remove('active'));
      // Activate 'sobre' page
      const targetPage = document.getElementById('sobre-page');
      if (targetPage) {
        targetPage.classList.add('active');
      }
      // Hide cart bar on about page
      const cartBar = document.querySelector('.cart-bar');
      if (cartBar) {
        cartBar.style.display = 'none';
      }
      await initPage('sobre');
    });
  }

  // Initialize the active page on load
  const activePageEl = document.querySelector('.page.active');
  if (activePageEl) {
    const initialPageName = activePageEl.id.replace('-page', '');
    initPage(initialPageName);
  }
});
