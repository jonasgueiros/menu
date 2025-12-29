// Main initializer: wires navigation and tab-specific initializers

document.addEventListener('DOMContentLoaded', () => {
  // Initialize restaurant status on first load
  if (!localStorage.getItem('restaurantOpen')) {
    localStorage.setItem('restaurantOpen', 'true');
    localStorage.setItem('dayStartTime', new Date().toLocaleString('pt-BR'));
  }

  // Load logos from localStorage
  loadLogos();

  // Mobile: Hide/show top bar on scroll
  if (window.innerWidth <= 768) {
    let lastScrollTop = 0;
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (mainContent && sidebar) {
      mainContent.addEventListener('scroll', () => {
        const scrollTop = mainContent.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          // Scrolling down - hide sidebar
          sidebar.classList.add('hide');
        } else {
          // Scrolling up - show sidebar
          sidebar.classList.remove('hide');
        }
        
        lastScrollTop = scrollTop;
      });
    }
  }

  // Attach checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn && typeof checkout === 'function') {
    checkoutBtn.addEventListener('click', checkout);
  }

  // Close modals when clicking outside
  window.addEventListener('click', (e) => {
    const paymentModal = document.getElementById('paymentModal');
    const cartModal = document.getElementById('cartModal');
    const itemDetailsModal = document.getElementById('itemDetailsModal');

    if (e.target === paymentModal && typeof closePaymentModal === 'function') {
      closePaymentModal();
    }
    if (e.target === cartModal && typeof closeCartModal === 'function') {
      closeCartModal();
    }
    if (e.target === itemDetailsModal && typeof closeItemDetailsModal === 'function') {
      closeItemDetailsModal();
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
    sobre: typeof initSobre === 'function' ? initSobre : null,
  };

  const loadPageTemplate = async (pageName) => {
    const container = document.getElementById(`${pageName}-page`);
    if (!container || container.dataset.loaded === 'true') return;
    const buildOfflineMarkup = (name) => {
      switch (name) {
        case 'inicio':
          return `
            <header class="page-header">
              <h1>Bem-vindo</h1>
            </header>
            <div class="sections-container">
              <section class="category-section">
                <h2>📈 Mais Pedidos</h2>
                <div class="menu-grid" id="maispedidosGrid"></div>
              </section>
              <section class="category-section">
                <h2>🏷️ Promoção</h2>
                <div class="menu-grid" id="promocaoGrid"></div>
              </section>
              <section class="category-section">
                <h2>🎁 Combos</h2>
                <div class="menu-grid" id="combosGrid"></div>
              </section>
            </div>
          `;
        case 'petiscos':
          return `
            <header class="page-header">
              <h1>Petiscos</h1>
            </header>
            <div class="menu-grid" id="petiscosGrid"></div>
          `;
        case 'lanches':
          return `
            <header class="page-header">
              <h1>Lanches</h1>
            </header>
            <div class="menu-grid" id="lanchesGrid"></div>
          `;
        case 'doces':
          return `
            <header class="page-header">
              <h1>Doces</h1>
            </header>
            <div class="menu-grid" id="docesGrid"></div>
          `;
        case 'drinks':
          return `
            <header class="page-header">
              <h1>Bebidas</h1>
            </header>
            <div class="menu-grid" id="drinksGrid"></div>
          `;
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

      // Clear about page when leaving it
      const sobrePage = document.getElementById('sobre-page');
      if (pageName !== 'sobre' && sobrePage) {
        sobrePage.innerHTML = '';
        sobrePage.dataset.loaded = 'false';
      }

      // Initialize selected page
      await initPage(pageName);
    });
  });

  // Clicking the logo opens the 'Sobre' page
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    
    // Load logo from localStorage
    const about = JSON.parse(localStorage.getItem('aboutInfo') || '{}');
    if (about.logoDataUrl) {
      const logoImg = document.createElement('img');
      logoImg.src = about.logoDataUrl;
      logoImg.style.maxWidth = '100%';
      logoImg.style.maxHeight = '100%';
      logoImg.style.borderRadius = '8px';
      logo.innerHTML = '';
      logo.appendChild(logoImg);
    }
    
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

// Load desktop and mobile logos from localStorage
function loadLogos() {
  const about = JSON.parse(localStorage.getItem('aboutInfo') || '{}');
  const logoDesktopEl = document.getElementById('logoDesktop');
  const logoMobileEl = document.getElementById('logoMobile');
  const logoFallback = document.getElementById('logoFallback');

  // Load desktop logo
  if (logoDesktopEl && about.logoDataUrl) {
    logoDesktopEl.src = about.logoDataUrl;
    if (logoFallback) logoFallback.style.display = 'none';
  }

  // Load mobile logo
  if (logoMobileEl && about.logoMobileDataUrl) {
    logoMobileEl.src = about.logoMobileDataUrl;
  }
}
