// Admin/Staff Functions
document.addEventListener('DOMContentLoaded', () => {
    // Load menu data from localStorage if exists
    const savedMenuData = localStorage.getItem('menuData');
    if (savedMenuData) {
        menuData.length = 0;
        menuData.push(...JSON.parse(savedMenuData));
    }
    
    initializeAdminPage();
    initializeProductFeatures();
    initializeAboutFeatures();
    updateDashboardStats();
    displayMostRequestedItems(10);
    displayAllOrders();
    displayPaymentHistory();
    displayFeedbackComments();
    updateRestaurantStatusDisplay();
});

function initializeAdminPage() {
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('productModal');
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
    
    displayProductsManagement();
    updateAdminOrders();
    updateDashboardStats();
    
    // Refresh orders and stats every 2 seconds
    setInterval(() => {
        updateAdminOrders();
        updateDashboardStats();
    }, 2000);
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
                itemsHTML += `<br><em style="color: #ff9800;">🔖 Nota: ${item.note}</em>`;
            }
            itemsHTML += '</li>';
        });
        itemsHTML += '</ul>';
        
        const paymentLabels = {
            'dinheiro': '💵 Dinheiro',
            'credito': '💳 Crédito',
            'debito': '🧾 Débito',
            'pix': '📱 PIX'
        };
        
        const totalFormatted = `R$ ${order.total.toFixed(2).replace('.', ',')}`;
        
        orderCard.innerHTML = `
            <div class="order-header">📦 Pedido #${order.id}</div>
            <div style="font-size: 0.9em; color: #666; margin-bottom: 10px;">🕐 ${order.timestamp}</div>
            ${itemsHTML}
            <div class="order-payment">💰 Total: <strong>${totalFormatted}</strong> | ${paymentLabels[order.paymentMethod]}</div>
            <div class="order-actions" style="display: flex; gap: 10px;">
                <button class="btn-mark-paid" onclick="markOrderAsPaid(${order.id})">✅ Marcar como Pago</button>
                <button class="btn-cancel-order" onclick="cancelOrder(${order.id})">❌ Cancelar Pedido</button>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

// Payment and History Management
function markOrderAsPaid(orderId) {
    if (!confirm('Tem certeza que deseja marcar este pedido como pago?')) {
        return;
    }
    
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

// Cancel order function
function cancelOrder(orderId) {
    if (!confirm('Tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.')) {
        return;
    }
    
    const savedOrders = localStorage.getItem('orders');
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    
    // Find and remove the order
    const orderIndex = orders.findIndex(o => o.id == orderId);
    if (orderIndex > -1) {
        const canceledOrder = orders[orderIndex];
        canceledOrder.canceled = true;
        canceledOrder.canceledDate = new Date().toLocaleString('pt-BR');
        
        // Move to history as canceled
        const savedHistory = localStorage.getItem('ordersHistory');
        const history = savedHistory ? JSON.parse(savedHistory) : [];
        history.push(canceledOrder);
        localStorage.setItem('ordersHistory', JSON.stringify(history));
        
        // Remove from active orders
        orders.splice(orderIndex, 1);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        updateAdminOrders();
        updateDashboardStats();
        alert('❌ Pedido cancelado com sucesso!');
    } else {
        alert('❌ Erro ao cancelar pedido. Tente novamente.');
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
    
    // Filter only paid orders (not canceled)
    const paidOrders = history.filter(order => order.paid && !order.canceled);
    
    if (paidOrders.length === 0) {
        historyList.innerHTML = '<p class="empty-state">Nenhum pedido pago registrado</p>';
        return;
    }
    
    // Calculate total revenue
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
    
    historyList.innerHTML = '';
    
    // Add header with toggle buttons and total
    const headerDiv = document.createElement('div');
    headerDiv.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid var(--border);';
    headerDiv.innerHTML = `
        <div style="display: flex; gap: 10px;">
            <button class="history-view-btn active" data-view="orders" onclick="switchHistoryView('orders')" 
                style="padding: 10px 20px; border: 2px solid var(--primary); background: var(--primary); color: white; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                📋 Pedidos
            </button>
            <button class="history-view-btn" data-view="items" onclick="switchHistoryView('items')" 
                style="padding: 10px 20px; border: 2px solid var(--primary); background: white; color: var(--primary); border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                🍽️ Itens Vendidos
            </button>
        </div>
        <div style="font-size: 1.2em; font-weight: 700; color: var(--primary);">
            💰 Total: R$ ${totalRevenue.toFixed(2).replace('.', ',')}
        </div>
    `;
    historyList.appendChild(headerDiv);
    
    // Create container for orders view
    const ordersContainer = document.createElement('div');
    ordersContainer.id = 'historyOrdersView';
    ordersContainer.style.display = 'block';
    
    // Sort history by date (newest first)
    const sortedHistory = [...paidOrders].sort((a, b) => {
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
                itemsHTML += `<br><em style="color: #ff9800;">🔖 Nota: ${item.note}</em>`;
            }
            itemsHTML += '</li>';
        });
        itemsHTML += '</ul>';
        
        const paymentLabels = {
            'dinheiro': '💵 Dinheiro',
            'credito': '💳 Crédito',
            'debito': '🧾 Débito',
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
        ordersContainer.appendChild(orderCard);
    });
    
    historyList.appendChild(ordersContainer);
    
    // Create container for items view
    const itemsContainer = document.createElement('div');
    itemsContainer.id = 'historyItemsView';
    itemsContainer.style.display = 'none';
    
    displayHistoryItemsList(paidOrders, itemsContainer);
    
    historyList.appendChild(itemsContainer);
}

function displayHistoryItemsList(orders, container) {
    // Calculate items sold with totals
    const itemsData = {};
    
    orders.forEach(order => {
        order.items.forEach(item => {
            const itemName = item.name;
            if (!itemsData[itemName]) {
                itemsData[itemName] = {
                    quantity: 0,
                    totalRevenue: 0,
                    prices: []
                };
            }
            
            itemsData[itemName].quantity += item.quantity;
            
            // Parse price from string like "R$ 15,00"
            const priceValue = parseFloat(item.price.replace('R$ ', '').replace(',', '.'));
            itemsData[itemName].totalRevenue += priceValue * item.quantity;
            itemsData[itemName].prices.push(priceValue);
        });
    });
    
    // Sort by quantity (most sold first)
    const sortedItems = Object.entries(itemsData)
        .sort((a, b) => b[1].quantity - a[1].quantity);
    
    container.innerHTML = '';
    
    sortedItems.forEach(([itemName, data], index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'order-card';
        itemCard.style.borderLeft = '4px solid #4CAF50';
        
        let medal = '';
        if (index === 0) medal = '🥇';
        else if (index === 1) medal = '🥈';
        else if (index === 2) medal = '🥉';
        else medal = `#${index + 1}`;
        
        const avgPrice = data.totalRevenue / data.quantity;
        
        itemCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="flex: 1;">
                    <div class="order-header" style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.5em;">${medal}</span>
                        <span>${itemName}</span>
                    </div>
                    <div style="margin-top: 10px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                        <div style="background: #f0f4ff; padding: 10px; border-radius: 8px;">
                            <div style="font-size: 0.85em; color: #666;">Quantidade Vendida</div>
                            <div style="font-size: 1.3em; font-weight: 700; color: var(--primary);">${data.quantity} unidades</div>
                        </div>
                        <div style="background: #f0f4ff; padding: 10px; border-radius: 8px;">
                            <div style="font-size: 0.85em; color: #666;">Receita Total</div>
                            <div style="font-size: 1.3em; font-weight: 700; color: #4CAF50;">R$ ${data.totalRevenue.toFixed(2).replace('.', ',')}</div>
                        </div>
                        <div style="background: #f0f4ff; padding: 10px; border-radius: 8px;">
                            <div style="font-size: 0.85em; color: #666;">Preço Médio</div>
                            <div style="font-size: 1.3em; font-weight: 700; color: #667eea;">R$ ${avgPrice.toFixed(2).replace('.', ',')}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(itemCard);
    });
}

function switchHistoryView(view) {
    const ordersView = document.getElementById('historyOrdersView');
    const itemsView = document.getElementById('historyItemsView');
    
    // Update button styles
    document.querySelectorAll('.history-view-btn').forEach(btn => {
        if (btn.dataset.view === view) {
            btn.style.background = 'var(--primary)';
            btn.style.color = 'white';
            btn.classList.add('active');
        } else {
            btn.style.background = 'white';
            btn.style.color = 'var(--primary)';
            btn.classList.remove('active');
        }
    });
    
    // Toggle views
    if (view === 'orders') {
        ordersView.style.display = 'block';
        itemsView.style.display = 'none';
    } else {
        ordersView.style.display = 'none';
        itemsView.style.display = 'block';
    }
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
                itemsHTML += `<br><em style="color: #ff9800;">🔖 Nota: ${item.note}</em>`;
            }
            itemsHTML += '</li>';
        });
        itemsHTML += '</ul>';
        
        const paymentLabels = {
            'dinheiro': '💵 Dinheiro',
            'credito': '💳 Crédito',
            'debito': '🧾 Débito',
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
                <button class="btn-cancel-order" onclick="cancelOrder(${order.id})">❌ Cancelar Pedido</button>
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

// Restaurant Status Management
function updateRestaurantStatusDisplay() {
    const isOpen = localStorage.getItem('restaurantOpen') !== 'false';
    const statusText = document.getElementById('restaurantStatusText');
    const toggleBtn = document.getElementById('toggleRestaurantBtn');
    
    if (statusText) {
        if (isOpen) {
            statusText.textContent = '🟢 Aberto';
            statusText.style.color = '#4CAF50';
        } else {
            statusText.textContent = '🔴 Fechado';
            statusText.style.color = '#f44336';
        }
    }
    
    if (toggleBtn) {
        toggleBtn.textContent = isOpen ? '🔒 Fechar' : '🔓 Abrir';
        toggleBtn.style.background = isOpen ? 'white' : '#4CAF50';
        toggleBtn.style.color = isOpen ? 'var(--primary)' : 'white';
    }
}

function toggleRestaurantStatus() {
    const isOpen = localStorage.getItem('restaurantOpen') !== 'false';
    
    if (isOpen) {
        // Check for pending orders before closing
        const savedOrders = localStorage.getItem('orders');
        const orders = savedOrders ? JSON.parse(savedOrders) : [];
        
        if (orders.length > 0) {
            alert('⚠️ Ainda há ' + orders.length + ' pedido(s) pendente(s)!\n\nPor favor, resolva todos os pedidos antes de fechar o restaurante.');
            return;
        }
        
        // Closing the restaurant - ask to save stats
        if (confirm('Tem certeza que deseja fechar o restaurante e encerrar o resumo do dia? Você poderá salvar o relatório como arquivo.')) {
            closeRestaurantAndSaveStats();
        }
    } else {
        // Opening the restaurant - reset stats display
        localStorage.setItem('restaurantOpen', 'true');
        localStorage.setItem('dayStartTime', new Date().toLocaleString('pt-BR'));
        
        // Reset stats display
        const totalRevenueEl = document.getElementById('totalRevenue');
        const paidOrdersEl = document.getElementById('paidOrdersCount');
        const pendingOrdersEl = document.getElementById('pendingOrdersCount');
        
        if (totalRevenueEl) totalRevenueEl.textContent = 'R$ 0,00';
        if (paidOrdersEl) paidOrdersEl.textContent = '0';
        if (pendingOrdersEl) pendingOrdersEl.textContent = '0';
        
        updateRestaurantStatusDisplay();
        alert('✅ Restaurante aberto para novos pedidos!');
    }
}

function closeRestaurantAndSaveStats() {
    // Close restaurant
    localStorage.setItem('restaurantOpen', 'false');
    
    // Clear dashboard stats display
    const totalRevenueEl = document.getElementById('totalRevenue');
    const paidOrdersEl = document.getElementById('paidOrdersCount');
    const pendingOrdersEl = document.getElementById('pendingOrdersCount');
    
    if (totalRevenueEl) totalRevenueEl.textContent = 'R$ 0,00';
    if (paidOrdersEl) paidOrdersEl.textContent = '0';
    if (pendingOrdersEl) pendingOrdersEl.textContent = '0';
    
    updateRestaurantStatusDisplay();
    
    // Get today's stats
    const savedHistory = localStorage.getItem('ordersHistory');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Calculate stats
    let totalRevenue = 0;
    let totalOrders = 0;
    let totalCanceled = 0;
    const itemsSold = {};
    
    history.forEach(order => {
        if (order.paid && !order.canceled) {
            totalRevenue += order.total;
            totalOrders++;
            
            order.items.forEach(item => {
                itemsSold[item.name] = (itemsSold[item.name] || 0) + item.quantity;
            });
        }
        if (order.canceled) {
            totalCanceled++;
        }
    });
    
    const dayStartTime = localStorage.getItem('dayStartTime') || new Date().toLocaleString('pt-BR');
    const dayEndTime = new Date().toLocaleString('pt-BR');
    
    // Create stats object
    const stats = {
        date: new Date().toLocaleDateString('pt-BR'),
        startTime: dayStartTime,
        endTime: dayEndTime,
        totalOrders: totalOrders,
        canceledOrders: totalCanceled,
        totalRevenue: totalRevenue.toFixed(2),
        topItems: Object.entries(itemsSold)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, quantity]) => ({ name, quantity }))
    };
    
    // Ask if user wants to save as file
    if (confirm('Deseja salvar o relatório do dia como arquivo Excel?')) {
        downloadStatsAsExcel(stats);
        alert('✅ Relatório salvo com sucesso!');
    } else {
        alert('❌ Restaurante fechado. Resumo do dia não foi salvo.');
    }
}

function downloadStatsAsExcel(stats) {
    // Create CSV data
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Header section
    csvContent += 'RELATÓRIO DO DIA\n';
    csvContent += '\n';
    csvContent += 'Data,' + stats.date + '\n';
    csvContent += 'Horário de Abertura,' + stats.startTime + '\n';
    csvContent += 'Horário de Fechamento,' + stats.endTime + '\n';
    csvContent += '\n';
    
    // Summary section
    csvContent += 'RESUMO\n';
    csvContent += 'Total de Pedidos,' + stats.totalOrders + '\n';
    csvContent += 'Pedidos Cancelados,' + stats.canceledOrders + '\n';
    csvContent += 'Receita Total,R$ ' + stats.totalRevenue.toString().replace('.', ',') + '\n';
    csvContent += '\n';
    
    // Top items section
    csvContent += 'ITENS MAIS VENDIDOS\n';
    csvContent += 'Produto,Quantidade\n';
    stats.topItems.forEach(item => {
        csvContent += '"' + item.name + '",' + item.quantity + '\n';
    });
    
    // Create and download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `resumo_dia_${today}.csv`);
    document.body.appendChild(link);
    
    link.click();
    document.body.removeChild(link);
}