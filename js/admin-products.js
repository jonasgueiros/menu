// Product Management Functions

// Initialize product features
function initializeProductFeatures() {
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', openProductModal);
    }
    
    const productModal = document.getElementById('productModal');
    const modalClose = productModal?.querySelector('.modal-close');
    const btnCancel = productModal?.querySelector('.btn-cancel');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeProductModal);
    }
    if (btnCancel) {
        btnCancel.addEventListener('click', closeProductModal);
    }
    
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', saveProduct);
    }
    
    const imageInput = document.getElementById('productImage');
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            const preview = document.getElementById('productImagePreview');
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
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('productModal');
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });

    // Add search and filter event listeners
    const productSearch = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (productSearch) {
        productSearch.addEventListener('input', filterAndDisplayProducts);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterAndDisplayProducts);
    }
    
    displayProductsManagement();
}

function openProductModal(editId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const modalTitle = document.getElementById('modalTitle');
    
    if (editId) {
        const product = menuData.find(p => p.id === editId);
        if (product) {
            modalTitle.textContent = 'Editar Produto';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productCategory').value = product.category;
            const preview = document.getElementById('productImagePreview');
            if (preview) {
                if (product.imageDataUrl) {
                    preview.src = product.imageDataUrl;
                    preview.style.display = 'block';
                } else {
                    preview.src = '';
                    preview.style.display = 'none';
                }
            }
            
            const price = parseFloat(product.priceBRL.replace('R$ ', '').replace(',', '.'));
            document.getElementById('productPrice').value = price;
            
            document.getElementById('productMostOrdered').checked = product.mostOrdered;
            document.getElementById('productPromotion').checked = product.isPromotion;
            document.getElementById('productCombo').checked = product.isCombo;
            const outEl = document.getElementById('productOutOfStock');
            if (outEl) outEl.checked = !!product.outOfStock;
            
            if (product.originalPriceBRL) {
                const originalPrice = parseFloat(product.originalPriceBRL.replace('R$ ', '').replace(',', '.'));
                document.getElementById('productOriginalPrice').value = originalPrice;
            }
        }
    } else {
        modalTitle.textContent = 'Adicionar Novo Produto';
        form.reset();
        document.getElementById('productId').value = '';
        const preview = document.getElementById('productImagePreview');
        if (preview) {
            preview.src = '';
            preview.style.display = 'none';
        }
        const outEl = document.getElementById('productOutOfStock');
        if (outEl) outEl.checked = false;
    }
    
    modal.classList.add('show');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
}

function saveProduct(e) {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    
    const imagePreview = document.getElementById('productImagePreview');
    const imageDataUrl = imagePreview && imagePreview.src ? imagePreview.src : undefined;

    const product = {
        id: id ? parseInt(id) : Math.max(...menuData.map(p => p.id || 0), 0) + 1,
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        description: document.getElementById('productDescription').value,
        imageDataUrl: imageDataUrl,
        priceBRL: 'R$ ' + price.toFixed(2).replace('.', ','),
        originalPriceBRL: document.getElementById('productOriginalPrice').value
            ? 'R$ ' + parseFloat(document.getElementById('productOriginalPrice').value).toFixed(2).replace('.', ',')
            : undefined,
        mostOrdered: document.getElementById('productMostOrdered').checked,
        isPromotion: document.getElementById('productPromotion').checked,
        isCombo: document.getElementById('productCombo').checked,
        outOfStock: document.getElementById('productOutOfStock').checked
    };
    
    if (id) {
        // Edit existing
        const index = menuData.findIndex(p => p.id === parseInt(id));
        if (index > -1) {
            menuData[index] = product;
        }
    } else {
        // Add new
        menuData.push(product);
    }
    
    // Save to localStorage
    localStorage.setItem('menuData', JSON.stringify(menuData));
    
    closeProductModal();
    filterAndDisplayProducts();
    alert('Produto salvo com sucesso!');
}

function deleteProduct(id) {
    if (confirm('Tem certeza que deseja deletar este produto?')) {
        const index = menuData.findIndex(p => p.id === id);
        if (index > -1) {
            menuData.splice(index, 1);
            localStorage.setItem('menuData', JSON.stringify(menuData));
        }
        filterAndDisplayProducts();
        alert('Produto deletado com sucesso!');
    }
}

function displayProductsManagement() {
    const container = document.getElementById('productsManagement');
    if (!container) return;
    
    if (menuData.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum produto cadastrado</p>';
        return;
    }
    
    container.innerHTML = '';
    menuData.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        let priceDisplay = product.priceBRL;
        if (product.isPromotion && product.originalPriceBRL) {
            priceDisplay += ` <span style="text-decoration: line-through; color: #999;">(era ${product.originalPriceBRL})</span>`;
        }
        
        let badges = '';
        if (product.mostOrdered) badges += '<span style="background: #4CAF50; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75em; margin-right: 5px;">📈 Mais Pedido</span>';
        if (product.isPromotion) badges += '<span style="background: #FF9800; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75em; margin-right: 5px;">🏷️ Promoção</span>';
        if (product.isCombo) badges += '<span style="background: #2196F3; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75em;">🎁 Combo</span>';
        if (product.outOfStock) badges += '<span style="background: #f44336; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75em; margin-left: 5px;">🔴 Em falta</span>';
        
        const mediaHTML = product.imageDataUrl 
            ? `<img src="${product.imageDataUrl}" alt="${product.name}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;margin-right:8px;vertical-align:middle;">`
            : `<span style="font-size:1.5em;margin-right:8px;vertical-align:middle;">${product.emoji || '🍽️'}</span>`;

        card.innerHTML = `
            <div class="product-info">
                <div class="product-name">${mediaHTML} ${product.name}</div>
                <div style="font-size: 0.85em; color: #999; margin: 5px 0;">${product.category}</div>
                <div class="product-price">${priceDisplay}</div>
                <div style="margin-top: 8px;">${badges}</div>
            </div>
            <div class="product-actions">
                <button class="btn-edit" onclick="openProductModal(${product.id})">Editar</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">Deletar</button>
                <button class="btn-toggle" onclick="toggleProductAvailability(${product.id})">${product.outOfStock ? 'Marcar como disponível' : 'Marcar "Em falta"'}</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function filterAndDisplayProducts() {
    const container = document.getElementById('productsManagement');
    const searchInput = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (!container || !searchInput || !categoryFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    // Filter products
    const filteredProducts = menuData.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.description.toLowerCase().includes(searchTerm);
        
        let matchesCategory = true;
        if (selectedCategory === 'promoção') {
            matchesCategory = product.isPromotion === true;
        } else if (selectedCategory) {
            matchesCategory = product.category === selectedCategory;
        }
        
        return matchesSearch && matchesCategory;
    });
    
    if (filteredProducts.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum produto encontrado</p>';
        return;
    }
    
    container.innerHTML = '';
    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        let priceDisplay = product.priceBRL;
        if (product.isPromotion && product.originalPriceBRL) {
            priceDisplay += ` <span style="text-decoration: line-through; color: #999;">(era ${product.originalPriceBRL})</span>`;
        }
        
        let badges = '';
        if (product.mostOrdered) badges += '<span style="background: #4CAF50; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75em; margin-right: 5px;">📈 Mais Pedido</span>';
        if (product.isPromotion) badges += '<span style="background: #FF9800; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75em; margin-right: 5px;">🏷️ Promoção</span>';
        if (product.isCombo) badges += '<span style="background: #2196F3; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75em;">🎁 Combo</span>';
        if (product.outOfStock) badges += '<span style="background: #f44336; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75em; margin-left: 5px;">🔴 Em falta</span>';
        
        const mediaHTML = product.imageDataUrl 
            ? `<img src="${product.imageDataUrl}" alt="${product.name}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;margin-right:8px;vertical-align:middle;">`
            : `<span style="font-size:1.5em;margin-right:8px;vertical-align:middle;">${product.emoji || '🍽️'}</span>`;

        card.innerHTML = `
            <div class="product-info">
                <div class="product-name">${mediaHTML} ${product.name}</div>
                <div style="font-size: 0.85em; color: #999; margin: 5px 0;">${product.category}</div>
                <div class="product-price">${priceDisplay}</div>
                <div style="margin-top: 8px;">${badges}</div>
            </div>
            <div class="product-actions">
                <button class="btn-edit" onclick="openProductModal(${product.id})">Editar</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">Deletar</button>
                <button class="btn-toggle" onclick="toggleProductAvailability(${product.id})">${product.outOfStock ? 'Marcar como disponível' : 'Marcar "Em falta"'}</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function toggleProductAvailability(id) {
    const index = menuData.findIndex(p => p.id === id);
    if (index > -1) {
        menuData[index].outOfStock = !menuData[index].outOfStock;
        localStorage.setItem('menuData', JSON.stringify(menuData));
        filterAndDisplayProducts();
        alert(menuData[index].outOfStock ? 'Produto marcado como EM FALTA' : 'Produto marcado como DISPONÍVEL');
    }
}
