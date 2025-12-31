// Main initializer: wires navigation and tab-specific initializers

document.addEventListener('DOMContentLoaded', () => {
  // Initialize restaurant status on first load
  if (!localStorage.getItem('restaurantOpen')) {
    localStorage.setItem('restaurantOpen', 'true');
    localStorage.setItem('dayStartTime', new Date().toLocaleString('pt-BR'));
  }

  // Load logos from localStorage
  loadLogos();

  // Add logo animation effect (switch between image and emoji every 10 seconds)
  startLogoAnimation();

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
    const orderTypeModal = document.getElementById('orderTypeModal');
    const tableSelectionModal = document.getElementById('tableSelectionModal');
    const deliveryAddressModal = document.getElementById('deliveryAddressModal');
    const addToCartModal = document.getElementById('addToCartModal');

    if (e.target === paymentModal && typeof closePaymentModal === 'function') {
      closePaymentModal();
    }
    if (e.target === cartModal && typeof closeCartModal === 'function') {
      closeCartModal();
    }
    if (e.target === itemDetailsModal && typeof closeItemDetailsModal === 'function') {
      closeItemDetailsModal();
    }
    if (e.target === orderTypeModal && typeof closeOrderTypeModal === 'function') {
      closeOrderTypeModal();
    }
    if (e.target === tableSelectionModal && typeof closeTableSelectionModal === 'function') {
      closeTableSelectionModal();
    }
    if (e.target === deliveryAddressModal && typeof closeDeliveryAddressModal === 'function') {
      closeDeliveryAddressModal();
    }
    if (e.target === addToCartModal && typeof closeAddToCartModal === 'function') {
      closeAddToCartModal();
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
            <div class="about-layout">
              <div class="about-left">
                <div class="about-image-section">
                  <img id="aboutImageDisplay" alt="Foto do restaurante">
                </div>
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
              <div class="about-right">
                <section class="about-contact-section">
                  <h2>📞 Contato</h2>
                  <div class="contact-info">
                    <p><strong>Telefone:</strong> <span id="aboutPhoneDisplay">(11) 9999-9999</span></p>
                    <p><strong>Email:</strong> <span id="aboutEmailDisplay">contato@restaurante.com</span></p>
                    <p><strong>Endereço:</strong> <span id="aboutAddressDisplay">Rua Principal, 123 - Cidade, Estado</span></p>
                    <div class="contact-buttons">
                      <a href="https://instagram.com" target="_blank" class="btn-contact" id="aboutInstagramBtn">
                        <span>📷 Instagram</span>
                      </a>
                      <a href="https://wa.me/5511999999999" target="_blank" class="btn-contact" id="aboutWhatsappBtn">
                        <span>💬 WhatsApp</span>
                      </a>
                      <button class="btn-contact" id="feedbackBtn">
                        <span>💭 Deixar Feedback</span>
                      </button>
                    </div>
                  </div>
                </section>
                <section class="about-hours-section">
                  <h2>🕐 Horário</h2>
                  <div class="opening-hours">
                    <p><strong>Seg-Sex:</strong> <span id="aboutHoursMFDisplay">11:00 - 22:00</span></p>
                    <p><strong>Sábado:</strong> <span id="aboutHoursSatDisplay">11:00 - 23:00</span></p>
                    <p><strong>Domingo:</strong> <span id="aboutHoursSunDisplay">11:00 - 21:00</span></p>
                  </div>
                </section>
              </div>
            </div>
            <div class="developer-credit">
              <span>Developed by <a href="https://jonasgueiros.github.io/me/" target="_blank">Jonas Gueiros</a></span>
            </div>
            <div id="feedbackModal" class="modal" style="display:none;">
              <div class="modal-content feedback-modal" style="max-width:400px;">
                <div class="modal-header">
                  <h2>💭 Deixar Feedback</h2>
                  <span class="modal-close" onclick="closeFeedbackModal()">&times;</span>
                </div>
                <form class="feedback-form">
                  <div class="feedback-type">
                    <label>Seu feedback é sobre:</label>
                    <div class="radio-group">
                      <label class="radio-label">
                        <input type="radio" name="feedbackType" value="restaurante" required>
                        <span>🍽️ Restaurante</span>
                      </label>
                      <label class="radio-label">
                        <input type="radio" name="feedbackType" value="sistema" required>
                        <span>💻 Sistema</span>
                      </label>
                    </div>
                  </div>
                  <textarea placeholder="Deixe seu comentário..." rows="5" required></textarea>
                  <input type="email" placeholder="Seu email (opcional)">
                  <button type="submit" class="submit-btn">Enviar Feedback</button>
                </form>
              </div>
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
  const logoContainer = document.querySelector('.logo-container');
  if (logoContainer) {
    logoContainer.style.cursor = 'pointer';
    
    logoContainer.addEventListener('click', async () => {
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

  // Check if we have any logo
  const hasLogo = about.logoDataUrl || about.logoMobileDataUrl;

  // Load desktop logo
  if (logoDesktopEl && about.logoDataUrl) {
    logoDesktopEl.src = about.logoDataUrl;
  }

  // Load mobile logo (or fallback to desktop logo)
  if (logoMobileEl) {
    if (about.logoMobileDataUrl) {
      logoMobileEl.src = about.logoMobileDataUrl;
    } else if (about.logoDataUrl) {
      // Fallback to desktop logo if mobile logo not available
      logoMobileEl.src = about.logoDataUrl;
    }
  }

  // Show/hide fallback emoji based on whether we have logos
  if (logoFallback) {
    logoFallback.style.display = hasLogo ? 'none' : 'block';
  }
}

// Animate logo - switch between image and emoji every 10 seconds
function startLogoAnimation() {
  const about = JSON.parse(localStorage.getItem('aboutInfo') || '{}');
  const hasLogo = about.logoDataUrl || about.logoMobileDataUrl;
  
  // Only animate if we have a logo
  if (!hasLogo) return;
  
  const logoDesktopEl = document.getElementById('logoDesktop');
  const logoMobileEl = document.getElementById('logoMobile');
  const logoFallback = document.getElementById('logoFallback');
  
  if (!logoDesktopEl || !logoMobileEl || !logoFallback) return;
  
  let showingLogo = true;
  
  setInterval(() => {
    if (showingLogo) {
      // Switch to emoji - fade out logos, fade in emoji
      logoDesktopEl.style.opacity = '0';
      logoMobileEl.style.opacity = '0';
      setTimeout(() => {
        logoDesktopEl.style.visibility = 'hidden';
        logoMobileEl.style.visibility = 'hidden';
        logoFallback.style.display = 'block';
        logoFallback.style.visibility = 'visible';
        setTimeout(() => {
          logoFallback.style.opacity = '1';
        }, 50);
      }, 300);
    } else {
      // Switch back to logo - fade out emoji, fade in logos
      logoFallback.style.opacity = '0';
      setTimeout(() => {
        logoFallback.style.visibility = 'hidden';
        logoFallback.style.display = 'none';
        logoDesktopEl.style.visibility = 'visible';
        logoMobileEl.style.visibility = 'visible';
        setTimeout(() => {
          logoDesktopEl.style.opacity = '1';
          logoMobileEl.style.opacity = '1';
        }, 50);
      }, 300);
    }
    showingLogo = !showingLogo;
  }, 10000); // Every 10 seconds
}