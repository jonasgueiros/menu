    // Theme color logic
    const themePrimaryInput = document.getElementById('themePrimaryColor');
    const themePrimaryHoverInput = document.getElementById('themePrimaryHoverColor');
    const themeAccentInput = document.getElementById('themeAccentColor');
    const themeAccentDarkInput = document.getElementById('themeAccentDarkColor');
    const saveThemeBtn = document.getElementById('saveThemeBtn');

    // Load saved theme
    if (themePrimaryInput && themePrimaryHoverInput && themeAccentInput && themeAccentDarkInput) {
        const savedTheme = JSON.parse(localStorage.getItem('themeColors') || '{}');
        if (savedTheme.primary) themePrimaryInput.value = savedTheme.primary;
        if (savedTheme.primaryHover) themePrimaryHoverInput.value = savedTheme.primaryHover;
        if (savedTheme.accent) themeAccentInput.value = savedTheme.accent;
        if (savedTheme.accentDark) themeAccentDarkInput.value = savedTheme.accentDark;
        applyThemeColors(savedTheme);
    }

    if (saveThemeBtn) {
        saveThemeBtn.addEventListener('click', () => {
            const themeColors = {
                primary: themePrimaryInput.value,
                primaryHover: themePrimaryHoverInput.value,
                accent: themeAccentInput.value,
                accentDark: themeAccentDarkInput.value
            };
            localStorage.setItem('themeColors', JSON.stringify(themeColors));
            applyThemeColors(themeColors);
            updateThemeCss(themeColors);
            alert('🎨 Tema salvo e aplicado!');
        });
    }

    // Update theme.css file (requires backend or local file write capability)
    function updateThemeCss(theme) {
        if (!theme) return;
        const css = `:root {\n  /* Brand */\n  --primary: ${theme.primary};\n  --primary-hover: ${theme.primaryHover};\n  --accent: ${theme.accent};\n  --accent-dark: ${theme.accentDark};\n\n  /* Text */\n  --text: #333;\n  --muted: #666;\n  --subtle: #999;\n\n  /* Surfaces & Borders */\n  --bg: #f5f5f5;\n  --bg-panel: #f9f9f9;\n  --border: #ddd;\n  --border-light: #eee;\n\n  /* Status */\n  --success: #4CAF50;\n  --warning: #ff9800;\n  --info: #2196F3;\n  --danger: #ff4444;\n  --danger-dark: #dd3333;\n  --danger-strong: #f44336;\n\n  /* Gradients */\n  --gradient-primary: linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%);\n  --gradient-soft: linear-gradient(180deg, var(--bg) 0%, #ffffff 100%);\n}`;
        fetch('theme.css', { method: 'PUT', body: css }); // This will only work with a backend or local server that allows PUT
    }

    function applyThemeColors(theme) {
        if (!theme) return;
        const root = document.documentElement;
        if (theme.primary) root.style.setProperty('--primary', theme.primary);
        if (theme.primaryHover) root.style.setProperty('--primary-hover', theme.primaryHover);
        if (theme.accent) root.style.setProperty('--accent', theme.accent);
        if (theme.accentDark) root.style.setProperty('--accent-dark', theme.accentDark);
        if (theme.primary && theme.accent) {
            root.style.setProperty('--gradient-primary', `linear-gradient(135deg, ${theme.primary} 0%, ${theme.accent} 100%)`);
        }
    }
// Restaurant Info Management Functions

// Initialize about/restaurant info features
function initializeAboutFeatures() {
    const aboutForm = document.getElementById('aboutForm');
    const aboutCancel = document.getElementById('aboutCancel');
    if (aboutForm) {
        aboutForm.addEventListener('submit', saveAboutInfo);
        loadAboutInfoForm();
    }
    if (aboutCancel) {
        aboutCancel.addEventListener('click', loadAboutInfoForm);
    }
    
    const aboutImageInput = document.getElementById('aboutImage');
    if (aboutImageInput) {
        aboutImageInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            const preview = document.getElementById('aboutImagePreview');
            if (file && preview) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    preview.src = ev.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
        });
    }
    
    const logoInput = document.getElementById('aboutLogo');
    if (logoInput) {
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            const preview = document.getElementById('aboutLogoPreview');
            if (file && preview) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    preview.src = ev.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
        });
    }
    
    const logoMobileInput = document.getElementById('aboutLogoMobile');
    if (logoMobileInput) {
        logoMobileInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            const preview = document.getElementById('aboutLogoMobilePreview');
            if (file && preview) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    preview.src = ev.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
        });
    }
}

// Toggle table count field visibility based on delivery type
function toggleTableCountField() {
    const deliveryType = document.getElementById('aboutDeliveryType')?.value;
    const tableCountGroup = document.getElementById('tableCountGroup');
    
    if (tableCountGroup) {
        // Hide table count only for "delivery-only"
        if (deliveryType === 'delivery-only') {
            tableCountGroup.style.display = 'none';
        } else {
            tableCountGroup.style.display = 'grid';
        }
    }
}

// Load existing About info into the admin form
function loadAboutInfoForm() {
    const about = JSON.parse(localStorage.getItem('aboutInfo') || '{}');
    const nameEl = document.getElementById('aboutName');
    const historyEl = document.getElementById('aboutHistory');
    const foodEl = document.getElementById('aboutFood');
    const staffEl = document.getElementById('aboutStaff');
    const sloganEl = document.getElementById('aboutSlogan');
    const phoneEl = document.getElementById('aboutPhone');
    const emailEl = document.getElementById('aboutEmail');
    const addressEl = document.getElementById('aboutAddress');
    const instagramEl = document.getElementById('aboutInstagram');
    const whatsappEl = document.getElementById('aboutWhatsapp');
    const hoursMFEl = document.getElementById('aboutHoursMF');
    const hoursSatEl = document.getElementById('aboutHoursSat');
    const hoursSunEl = document.getElementById('aboutHoursSun');
    const deliveryTypeEl = document.getElementById('aboutDeliveryType');
    const tableCountEl = document.getElementById('aboutTableCount');
    const imagePreview = document.getElementById('aboutImagePreview');
    const logoPreview = document.getElementById('aboutLogoPreview');
    const logoMobilePreview = document.getElementById('aboutLogoMobilePreview');
    
    if (!nameEl || !historyEl || !foodEl || !staffEl || !sloganEl) return;
    
    nameEl.value = about.name || '';
    historyEl.value = about.history || '';
    foodEl.value = about.food || '';
    staffEl.value = about.staff || '';
    sloganEl.value = about.slogan || '';
    
    if (phoneEl) phoneEl.value = about.phone || '';
    if (emailEl) emailEl.value = about.email || '';
    if (addressEl) addressEl.value = about.address || '';
    if (instagramEl) instagramEl.value = about.instagram || '';
    if (whatsappEl) whatsappEl.value = about.whatsapp || '';
    if (hoursMFEl) hoursMFEl.value = about.hoursMF || '11:00 - 22:00';
    if (hoursSatEl) hoursSatEl.value = about.hoursSat || '11:00 - 23:00';
    if (hoursSunEl) hoursSunEl.value = about.hoursSun || '11:00 - 21:00';
    if (deliveryTypeEl) deliveryTypeEl.value = about.deliveryType || 'with-delivery';
    if (tableCountEl) tableCountEl.value = about.tableCount || '';
    
    // Toggle table count visibility based on loaded delivery type
    toggleTableCountField();
    
    if (imagePreview) {
        if (about.imageDataUrl) {
            imagePreview.src = about.imageDataUrl;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
        }
    }
    
    if (logoPreview) {
        if (about.logoDataUrl) {
            logoPreview.src = about.logoDataUrl;
            logoPreview.style.display = 'block';
        } else {
            logoPreview.src = '';
            logoPreview.style.display = 'none';
        }
    }
    
    if (logoMobilePreview) {
        if (about.logoMobileDataUrl) {
            logoMobilePreview.src = about.logoMobileDataUrl;
            logoMobilePreview.style.display = 'block';
        } else {
            logoMobilePreview.src = '';
            logoMobilePreview.style.display = 'none';
        }
    }
}

// Save About info from admin form to localStorage
function saveAboutInfo(e) {
    e.preventDefault();
    const deliveryType = document.getElementById('aboutDeliveryType')?.value || 'with-delivery';
    const tableCount = deliveryType === 'delivery-only' ? '' : (document.getElementById('aboutTableCount')?.value || '');
    
    const about = {
        name: document.getElementById('aboutName')?.value || '',
        history: document.getElementById('aboutHistory')?.value || '',
        food: document.getElementById('aboutFood')?.value || '',
        staff: document.getElementById('aboutStaff')?.value || '',
        slogan: document.getElementById('aboutSlogan')?.value || '',
        phone: document.getElementById('aboutPhone')?.value || '',
        email: document.getElementById('aboutEmail')?.value || '',
        address: document.getElementById('aboutAddress')?.value || '',
        instagram: document.getElementById('aboutInstagram')?.value || '',
        whatsapp: document.getElementById('aboutWhatsapp')?.value || '',
        hoursMF: document.getElementById('aboutHoursMF')?.value || '11:00 - 22:00',
        hoursSat: document.getElementById('aboutHoursSat')?.value || '11:00 - 23:00',
        hoursSun: document.getElementById('aboutHoursSun')?.value || '11:00 - 21:00',
        deliveryType: deliveryType,
        tableCount: tableCount,
        imageDataUrl: document.getElementById('aboutImagePreview')?.src || '',
        logoDataUrl: document.getElementById('aboutLogoPreview')?.src || '',
        logoMobileDataUrl: document.getElementById('aboutLogoMobilePreview')?.src || ''
    };
    localStorage.setItem('aboutInfo', JSON.stringify(about));
    alert('Informações "Sobre" salvas com sucesso!');
}