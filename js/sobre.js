// Sobre tab script: renders editable info saved by staff

let feedbackInitialized = false;

function closeFeedbackModal() {
  const modal = document.getElementById('feedbackModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function initFeedback() {
  const feedbackForm = document.querySelector('.feedback-form');
  const feedbackBtn = document.getElementById('feedbackBtn');
  const feedbackModal = document.getElementById('feedbackModal');

  if (feedbackBtn && !feedbackBtn.dataset.initialized) {
    feedbackBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (feedbackModal) {
        feedbackModal.style.display = 'flex';
      }
    });
    feedbackBtn.dataset.initialized = 'true';
  }

  if (!feedbackForm || feedbackForm.dataset.initialized) return;
  
  feedbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const feedbackType = feedbackForm.querySelector('input[name="feedbackType"]:checked');
    const textarea = feedbackForm.querySelector('textarea');
    const email = feedbackForm.querySelector('input[type="email"]');
    
    if (!feedbackType) {
      alert('Por favor, selecione se é sobre o Restaurante ou Sistema.');
      return;
    }
    
    if (textarea.value.trim()) {
      const typeLabel = feedbackType.value === 'restaurante' ? '🍽️ Restaurante' : '💻 Sistema';
      alert(`Obrigado pelo seu feedback sobre ${typeLabel}!`);
      feedbackForm.reset();
      closeFeedbackModal();
    } else {
      alert('Por favor, escreva seu comentário.');
    }
  });

  // Close modal when clicking outside
  if (feedbackModal) {
    feedbackModal.addEventListener('click', (e) => {
      if (e.target === feedbackModal) {
        closeFeedbackModal();
      }
    });
  }

  feedbackForm.dataset.initialized = 'true';
}

function initSobre() {
  const about = JSON.parse(localStorage.getItem('aboutInfo') || '{}');
  const nameEl = document.getElementById('aboutNameDisplay');
  const sloganEl = document.getElementById('aboutSloganDisplay');
  const historyEl = document.getElementById('aboutHistoryDisplay');
  const foodEl = document.getElementById('aboutFoodDisplay');
  const staffEl = document.getElementById('aboutStaffDisplay');
  const imageEl = document.getElementById('aboutImageDisplay');
  
  // Contact elements
  const phoneEl = document.getElementById('aboutPhoneDisplay');
  const emailEl = document.getElementById('aboutEmailDisplay');
  const addressEl = document.getElementById('aboutAddressDisplay');
  const instagramBtn = document.getElementById('aboutInstagramBtn');
  const whatsappBtn = document.getElementById('aboutWhatsappBtn');
  
  // Hours elements
  const hoursMFEl = document.getElementById('aboutHoursMFDisplay');
  const hoursSatEl = document.getElementById('aboutHoursSatDisplay');
  const hoursSunEl = document.getElementById('aboutHoursSunDisplay');
  
  if (!nameEl || !sloganEl || !historyEl || !foodEl || !staffEl) return;

  nameEl.textContent = about.name || 'Sobre o Restaurante';
  sloganEl.textContent = about.slogan || '';
  historyEl.textContent = about.history || 'Conteúdo não definido ainda.';
  foodEl.textContent = about.food || 'Conteúdo não definido ainda.';
  staffEl.textContent = about.staff || 'Conteúdo não definido ainda.';

  if (imageEl) {
    if (about.imageDataUrl) {
      imageEl.src = about.imageDataUrl;
      imageEl.style.display = 'block';
    } else {
      imageEl.src = '';
      imageEl.style.display = 'none';
    }
  }

  // Load contact info
  if (phoneEl) phoneEl.textContent = about.phone || '(11) 9999-9999';
  if (emailEl) emailEl.textContent = about.email || 'contato@restaurante.com';
  if (addressEl) addressEl.textContent = about.address || 'Rua Principal, 123 - Cidade, Estado';
  
  // Update contact button links
  if (instagramBtn && about.instagram) {
    instagramBtn.href = about.instagram;
  }
  if (whatsappBtn && about.whatsapp) {
    whatsappBtn.href = `https://wa.me/${about.whatsapp}`;
  }

  // Load hours
  if (hoursMFEl) hoursMFEl.textContent = about.hoursMF || '11:00 - 22:00';
  if (hoursSatEl) hoursSatEl.textContent = about.hoursSat || '11:00 - 23:00';
  if (hoursSunEl) hoursSunEl.textContent = about.hoursSun || '11:00 - 21:00';

  // Initialize feedback after DOM is ready
  initFeedback();
}
