// Shared utility functions and UI helpers

function parseBRL(brlString) {
    return parseFloat(brlString.replace('R$ ', '').replace('.', '').replace(',', '.'));
}

function formatBRL(value) {
    return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

// Render menu items list into a grid container
function renderMenuItems(items, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'menu-item';

        // Create price HTML with original price if on promotion
        let priceHTML = `<span class="item-price">${item.priceBRL}</span>`;
        if (item.isPromotion && item.originalPriceBRL) {
            const originalPrice = parseBRL(item.originalPriceBRL);
            const discountedPrice = parseBRL(item.priceBRL);
            const discountPercent = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

            priceHTML = `
                <div class="price-container">
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <span class="original-price">${item.originalPriceBRL}</span>
                        <span class="discount-badge">-${discountPercent}%</span>
                    </div>
                    <span class="item-price">${item.priceBRL}</span>
                </div>
            `;
        }

        const categoryLabel = item.isCombo ? 'Combo' : (item.category?.charAt(0).toUpperCase() + item.category?.slice(1));

        const imageHTML = item.imageDataUrl
            ? `<img class="item-image" src="${item.imageDataUrl}" alt="${item.name}" style="width:64px;height:64px;object-fit:cover;border-radius:12px;">`
            : `<div class="item-image">${item.emoji || ''}</div>`;

        const outBadge = item.outOfStock ? '<span class="out-of-stock-badge">🔴 Em falta</span>' : '';
        const btnLabel = item.outOfStock ? 'Indisponível' : 'Pedir';
        const btnDisabledAttr = item.outOfStock ? 'disabled' : '';

        itemEl.innerHTML = `
            ${imageHTML}
            <div class="item-content">
                <div class="item-name">${item.name} ${outBadge}</div>
                <span class="item-category">${categoryLabel || ''}</span>
                <p class="item-description">${item.description}</p>
                <div class="item-footer">
                    ${priceHTML}
                    <button class="item-btn" data-item-id="${item.id}" ${btnDisabledAttr}>${btnLabel}</button>
                </div>
            </div>
        `;

        const button = itemEl.querySelector('.item-btn');
        if (button) {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                if (item.outOfStock) {
                    alert('Este item está em falta no momento.');
                    return;
                }
                if (typeof addToCart === 'function') {
                    addToCart(item);
                }
            });
        }

        container.appendChild(itemEl);
    });
}
