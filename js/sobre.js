// Sobre tab script: renders editable info saved by staff

function initSobre() {
  const about = JSON.parse(localStorage.getItem('aboutInfo') || '{}');
  const nameEl = document.getElementById('aboutNameDisplay');
  const sloganEl = document.getElementById('aboutSloganDisplay');
  const historyEl = document.getElementById('aboutHistoryDisplay');
  const foodEl = document.getElementById('aboutFoodDisplay');
  const staffEl = document.getElementById('aboutStaffDisplay');
  const imageEl = document.getElementById('aboutImageDisplay');
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
}
