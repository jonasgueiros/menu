// Admin/Staff Functions
document.addEventListener('DOMContentLoaded', () => {
    // Load menu data from localStorage if exists
    const savedMenuData = localStorage.getItem('menuData');
    if (savedMenuData) {
        menuData.length = 0;
        menuData.push(...JSON.parse(savedMenuData));
    }
    
    initializeAdminPage();
    updateDashboardStats();
    displayMostRequestedItems(10);
    displayAllOrders();
    displayPaymentHistory();
    displayFeedbackComments();
});

function initializeAdminPage() {
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
    updateAdminOrders();
    updateDashboardStats();
    
    // Refresh orders and stats every 2 seconds
    setInterval(() => {
        updateAdminOrders();
        updateDashboardStats();
    }, 2000);
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

function updateAdminOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    
    // Load orders from localStorage
    const savedOrders = localStorage.getItem('orders');
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    
    // Filter only unpaid orders
    const unpaidOrders = orders.filter(order => !order.paid);
    
    if (unpaidOrders.length === 0) {
        ordersList.innerHTML = '<p class="empty-state">Nenhum pedido em andamento</p>';
        return;
    }
    
    ordersList.innerHTML = '';
    unpaidOrders.reverse().forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        let itemsHTML = '<ul class="order-items">';
        order.items.forEach(item => {
            itemsHTML += `<li><strong>${item.name}</strong> (x${item.quantity}) - ${item.price}`;
            if (item.note) {
                itemsHTML += `<br><em style="color: #ff9800;">📝 Nota: ${item.note}</em>`;
            }
            itemsHTML += '</li>';
        });
        itemsHTML += '</ul>';
        
        const paymentLabels = {
            'dinheiro': '💵 Dinheiro',
            'credito': '💳 Crédito',
            'debito': '🏧 Débito',
            'pix': '📱 PIX'
        };
        
        const totalFormatted = `R$ ${order.total.toFixed(2).replace('.', ',')}`;
        
        orderCard.innerHTML = `
            <div class="order-header">📦 Pedido #${order.id}</div>
            <div style="font-size: 0.9em; color: #666; margin-bottom: 10px;">🕐 ${order.timestamp}</div>
            ${itemsHTML}
            <div class="order-payment">💰 Total: <strong>${totalFormatted}</strong> | ${paymentLabels[order.paymentMethod]}</div>
            <div class="order-actions">
                <label class="payment-checkbox">
                    <input type="checkbox" onchange="markOrderAsPaid(${order.id})">
                    <span>✅ Pedido Pago</span>
                </label>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Payment and History Management
function markOrderAsPaid(orderId) {
    const savedOrders = localStorage.getItem('orders');
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    
    // Find the order - orderId comes as parameter from onclick
    let orderIndex = -1;
    for (let i = 0; i < orders.length; i++) {
        if (orders[i].id == orderId) {
            orderIndex = i;
            break;
        }
    }
    
    if (orderIndex > -1) {
        orders[orderIndex].paid = true;
        orders[orderIndex].paidDate = new Date().toLocaleString('pt-BR');
        
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Load history
        const savedHistory = localStorage.getItem('ordersHistory');
        const history = savedHistory ? JSON.parse(savedHistory) : [];
        
        // Move paid order to history
        history.push(orders[orderIndex]);
        localStorage.setItem('ordersHistory', JSON.stringify(history));
        
        // Remove from unpaid orders
        orders.splice(orderIndex, 1);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        updateAdminOrders();
        updateDashboardStats();
        alert('✅ Pedido marcado como pago!');
    } else {
        alert('❌ Erro ao marcar pedido como pago. Tente novamente.');
    }
}

function updateDashboardStats() {
    // Load all data
    const savedOrders = localStorage.getItem('orders');
    const allOrders = savedOrders ? JSON.parse(savedOrders) : [];
    
    const savedHistory = localStorage.getItem('ordersHistory');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Calculate stats
    const totalRevenue = history.reduce((sum, order) => sum + order.total, 0);
    const paidOrdersCount = history.length;
    const pendingOrdersCount = allOrders.filter(o => !o.paid).length;
    
    // Update dashboard
    document.getElementById('totalRevenue').textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
    document.getElementById('paidOrdersCount').textContent = paidOrdersCount;
    document.getElementById('pendingOrdersCount').textContent = pendingOrdersCount;
    
    // Calculate most requested items
    const itemsCount = {};
    history.forEach(order => {
        order.items.forEach(item => {
            itemsCount[item.name] = (itemsCount[item.name] || 0) + item.quantity;
        });
    });
    
    allOrders.forEach(order => {
        if (!order.paid) {
            order.items.forEach(item => {
                itemsCount[item.name] = (itemsCount[item.name] || 0) + item.quantity;
            });
        }
    });
    
    // Display most requested items
    displayMostRequestedItems(itemsCount);
}

function displayMostRequestedItems(itemsCount) {
    const mostRequestedList = document.getElementById('mostRequestedList');
    
    if (Object.keys(itemsCount).length === 0) {
        mostRequestedList.innerHTML = '<p class="empty-state">Nenhuma venda registrada</p>';
        return;
    }
    
    // Sort items by quantity
    const sortedItems = Object.entries(itemsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    
    mostRequestedList.innerHTML = '';
    sortedItems.forEach((item, index) => {
        const itemRow = document.createElement('div');
        itemRow.className = 'most-requested-item';
        
        let medal = '';
        if (index === 0) medal = '🥇';
        else if (index === 1) medal = '🥈';
        else if (index === 2) medal = '🥉';
        else medal = `#${index + 1}`;
        
        itemRow.innerHTML = `
            <div class="item-rank">${medal}</div>
            <div class="item-name">${item[0]}</div>
            <div class="item-count">${item[1]} unidades</div>
        `;
        mostRequestedList.appendChild(itemRow);
    });
}

// Tab Navigation
function switchAdminTab(tabName) {
    // Hide all tabs
    document.getElementById('orders-tab').style.display = 'none';
    document.getElementById('products-tab').style.display = 'none';
    document.getElementById('history-tab').style.display = 'none';
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').style.display = 'block';
    
    // Add active class to clicked button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Load history when switching to history tab
    if (tabName === 'history') {
        displayPaymentHistory();
    }
}

function displayPaymentHistory() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;
    
    // Load paid orders history from localStorage
    const savedHistory = localStorage.getItem('ordersHistory');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-state">Nenhum pedido pago registrado</p>';
        return;
    }
    
    historyList.innerHTML = '';
    
    // Sort history by date (newest first)
    const sortedHistory = [...history].sort((a, b) => {
        return new Date(b.paidDate || b.timestamp) - new Date(a.paidDate || a.timestamp);
    });
    
    // Display each paid order
    sortedHistory.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        let itemsHTML = '<ul class="order-items">';
        order.items.forEach(item => {
            itemsHTML += `<li><strong>${item.name}</strong> (x${item.quantity}) - ${item.price}`;
            if (item.note) {
                itemsHTML += `<br><em style="color: #ff9800;">📝 Nota: ${item.note}</em>`;
            }
            itemsHTML += '</li>';
        });
        itemsHTML += '</ul>';
        
        const paymentLabels = {
            'dinheiro': '💵 Dinheiro',
            'credito': '💳 Crédito',
            'debito': '🏧 Débito',
            'pix': '📱 PIX'
        };
        
        const totalFormatted = `R$ ${order.total.toFixed(2).replace('.', ',')}`;
        const paidDate = order.paidDate || order.timestamp;
        
        orderCard.innerHTML = `
            <div class="order-header">✅ Pedido #${order.id}</div>
            <div style="font-size: 0.9em; color: #666; margin-bottom: 10px;">
                <span>🕐 Realizado: ${order.timestamp}</span><br>
                <span style="color: #4CAF50; font-weight: 600;">✓ Pago em: ${paidDate}</span>
            </div>
            ${itemsHTML}
            <div class="order-payment">💰 Total: <strong>${totalFormatted}</strong> | ${paymentLabels[order.paymentMethod]}</div>
        `;
        historyList.appendChild(orderCard);
    });
}

// Page switching function for sidebar navigation
function switchAdminPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.admin-page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Remove active class from all sidebar buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected page
    const pageId = pageName + '-page';
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
    }
    
    // Mark button as active
    const activeBtn = document.querySelector(`.admin-nav-btn[data-page="${pageName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Load data for specific pages
    if (pageName === 'orders') {
        displayAllOrders();
    } else if (pageName === 'products') {
        displayProductsManagement();
    } else if (pageName === 'history') {
        displayPaymentHistory();
    } else if (pageName === 'feedback') {
        displayFeedbackComments();
    } else if (pageName === 'about') {
        loadAboutInfoForm();
    }
}

// Display all orders (pending and paid)
function displayAllOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const allOrdersList = document.getElementById('allOrdersList');
    
    if (!allOrdersList) return;
    
    if (orders.length === 0) {
        allOrdersList.innerHTML = '<p class="empty-state">Nenhum pedido registrado</p>';
        return;
    }
    
    // Sort orders by timestamp (newest first)
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    allOrdersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        let itemsHTML = '<ul class="order-items">';
        order.items.forEach(item => {
            itemsHTML += `<li><strong>${item.name}</strong> (x${item.quantity}) - ${item.price}`;
            if (item.note) {
                itemsHTML += `<br><em style="color: #ff9800;">📝 Nota: ${item.note}</em>`;
            }
            itemsHTML += '</li>';
        });
        itemsHTML += '</ul>';
        
        const paymentLabels = {
            'dinheiro': '💵 Dinheiro',
            'credito': '💳 Crédito',
            'debito': '🏧 Débito',
            'pix': '📱 PIX'
        };
        
        const totalFormatted = `R$ ${order.total.toFixed(2).replace('.', ',')}`;
        const statusIcon = order.paid ? '✅' : '⏳';
        const statusText = order.paid ? 'PAGO' : 'PENDENTE';
        const statusColor = order.paid ? '#4CAF50' : '#ff9800';
        
        orderCard.innerHTML = `
            <div class="order-header">${statusIcon} Pedido #${order.id} - <span style="color: ${statusColor}; font-weight: 600;">${statusText}</span></div>
            <div style="font-size: 0.9em; color: #666; margin-bottom: 10px;">
                <span>🕐 Realizado: ${order.timestamp}</span>
                ${order.paid && order.paidDate ? `<br><span style="color: #4CAF50; font-weight: 600;">✓ Pago em: ${order.paidDate}</span>` : ''}
            </div>
            ${itemsHTML}
            <div class="order-payment">💰 Total: <strong>${totalFormatted}</strong> | ${paymentLabels[order.paymentMethod]}</div>
            ${!order.paid ? `<div style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="btn-mark-paid" onclick="markOrderAsPaid(${order.id})">✓ Marcar como Pago</button>
                <label style="display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" onchange="markOrderAsPaid(${order.id})">
                    Pago
                </label>
            </div>` : ''}
        `;
        allOrdersList.appendChild(orderCard);
    });
}

// Display feedback and complaints
function displayFeedbackComments() {
    const feedbackList = document.getElementById('feedbackList');
    if (!feedbackList) return;
    
    // Get all orders (from both orders and ordersHistory)
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const ordersHistory = JSON.parse(localStorage.getItem('ordersHistory') || '[]');
    const allOrders = [...orders, ...ordersHistory];
    
    // Filter orders that have feedback
    const feedbackOrders = allOrders.filter(order => order.feedback);
    
    if (feedbackOrders.length === 0) {
        feedbackList.innerHTML = '<p class="empty-state">Nenhum feedback registrado</p>';
        return;
    }
    
    // Sort by timestamp (newest first)
    feedbackOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    feedbackList.innerHTML = '';
    
    feedbackOrders.forEach(order => {
        const feedbackCard = document.createElement('div');
        feedbackCard.className = 'feedback-card';
        
        // Determine sentiment from feedback (simple analysis)
        let sentiment = '😐';
        let sentimentText = 'Neutra';
        const feedbackLower = order.feedback.toLowerCase();
        
        if (feedbackLower.includes('ótim') || feedbackLower.includes('excelent') || feedbackLower.includes('adorei') || feedbackLower.includes('perfeito')) {
            sentiment = '😍';
            sentimentText = 'Positiva';
        } else if (feedbackLower.includes('problema') || feedbackLower.includes('ruim') || feedbackLower.includes('péssim') || feedbackLower.includes('horrível')) {
            sentiment = '😠';
            sentimentText = 'Negativa';
        } else if (feedbackLower.includes('bom') || feedbackLower.includes('gostei') || feedbackLower.includes('legal')) {
            sentiment = '😊';
            sentimentText = 'Positiva';
        }
        
        feedbackCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                <div>
                    <div class="feedback-header">📝 Pedido #${order.id} - ${sentiment} ${sentimentText}</div>
                    <div style="font-size: 0.85em; color: #666; margin-top: 5px;">🕐 ${order.timestamp}</div>
                </div>
            </div>
            <div class="feedback-content" style="background: #f5f5f5; padding: 12px; border-radius: 8px; margin: 10px 0;">
                "${order.feedback}"
            </div>
            <div style="font-size: 0.9em; color: #666;">
                💰 Total: R$ ${order.total.toFixed(2).replace('.', ',')} | Status: ${order.paid ? '✅ Pago' : '⏳ Pendente'}
            </div>
        `;
        feedbackList.appendChild(feedbackCard);
    });
}

// Toggle product availability
function toggleProductAvailability(id) {
    const index = menuData.findIndex(p => p.id === id);
    if (index > -1) {
        menuData[index].outOfStock = !menuData[index].outOfStock;
        localStorage.setItem('menuData', JSON.stringify(menuData));
        filterAndDisplayProducts();
        alert(menuData[index].outOfStock ? 'Produto marcado como EM FALTA' : 'Produto marcado como DISPONÍVEL');
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
    const imagePreview = document.getElementById('aboutImagePreview');
    if (!nameEl || !historyEl || !foodEl || !staffEl || !sloganEl) return;
    nameEl.value = about.name || '';
    historyEl.value = about.history || '';
    foodEl.value = about.food || '';
    staffEl.value = about.staff || '';
    sloganEl.value = about.slogan || '';
    if (imagePreview) {
        if (about.imageDataUrl) {
            imagePreview.src = about.imageDataUrl;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
        }
    }
}

// Save About info from admin form to localStorage
function saveAboutInfo(e) {
    e.preventDefault();
    const about = {
        name: document.getElementById('aboutName')?.value || '',
        history: document.getElementById('aboutHistory')?.value || '',
        food: document.getElementById('aboutFood')?.value || '',
        staff: document.getElementById('aboutStaff')?.value || '',
        slogan: document.getElementById('aboutSlogan')?.value || '',
        imageDataUrl: document.getElementById('aboutImagePreview')?.src || ''
    };
    localStorage.setItem('aboutInfo', JSON.stringify(about));
    alert('Informações "Sobre" salvas com sucesso!');
}
