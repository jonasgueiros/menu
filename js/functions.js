// Cart and payment functions extracted for main page usage

function addToCart(item) {
    if (item.outOfStock) {
        alert('Este item está em falta no momento.');
        return;
    }
    const note = prompt(`Deseja adicionar uma nota para ${item.name}?`, '');
    
    const cartItem = {
        ...item,
        cartId: Date.now() + Math.random(),
        note: note || '',
        quantity: 1
    };
    
    // Check if item already exists in cart
    const existingItem = cart.find(c => c.id === item.id && c.note === cartItem.note);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(cartItem);
    }
    
    updateCartDisplay();
}

function removeFromCart(cartId) {
    const index = cart.findIndex(item => item.cartId === cartId);
    if (index > -1) {
        cart.splice(index, 1);
    }
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartPreviewBtn = document.getElementById('cartPreviewBtn');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    let total = cart.reduce((sum, item) => {
        const price = parseBRL(item.priceBRL);
        return sum + (price * item.quantity);
    }, 0);
    
    cartTotal.textContent = formatBRL(total);
    
    checkoutBtn.disabled = cart.length === 0;
    if (cartPreviewBtn) {
        cartPreviewBtn.disabled = cart.length === 0;
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    // Show payment method modal
    const paymentModal = document.getElementById('paymentModal');
    paymentModal.classList.add('show');
    
    // Handle payment button clicks
    const paymentButtons = paymentModal.querySelectorAll('.payment-btn');
    paymentButtons.forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const paymentMethod = btn.getAttribute('data-method');
            completeCheckout(paymentMethod);
            paymentModal.classList.remove('show');
        };
    });
}

function closePaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    paymentModal.classList.remove('show');
}

function completeCheckout(paymentMethod) {
    let orderSummary = '=== RESUMO DO PEDIDO ===\n\n';
    const paymentLabels = {
        'dinheiro': '💵 Dinheiro',
        'credito': '💳 Crédito',
        'debito': '🏧 Débito',
        'pix': '📱 PIX'
    };
    
    cart.forEach((item, index) => {
        const price = parseBRL(item.priceBRL);
        const itemTotal = price * item.quantity;
        orderSummary += `${index + 1}. ${item.name} (x${item.quantity}) - R$ ${itemTotal.toFixed(2).replace('.', ',')}`;
        if (item.note) {
            orderSummary += `\n   Nota: ${item.note}`;
        }
        orderSummary += '\n';
    });
    
    let total = cart.reduce((sum, item) => {
        const price = parseBRL(item.priceBRL);
        return sum + (price * item.quantity);
    }, 0);
    
    const totalDisplay = formatBRL(total);
    
    orderSummary += `\n━━━━━━━━━━━━━━━━━━━━\nTOTAL: ${totalDisplay}\nPagamento: ${paymentLabels[paymentMethod]}\n\nPedido enviado para a cozinha! ✓`;
    
    // Store order for staff
    const order = {
        id: Date.now(),
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            note: item.note,
            price: item.priceBRL
        })),
        total: total,
        paymentMethod: paymentMethod,
        timestamp: new Date().toLocaleString('pt-BR'),
        status: 'pending',
        paid: false
    };
    
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    alert(orderSummary);
    
    // Ask for feedback
    const feedback = prompt('Obrigado pela sua compra! 😊\n\nGostaríamos de ouvir sua opinião:\n(Deixe em branco se não quiser comentar)');
    if (feedback && feedback.trim()) {
        order.feedback = feedback.trim();
        // Update the order with feedback
        orders[orders.length - 1].feedback = feedback.trim();
        localStorage.setItem('orders', JSON.stringify(orders));
    }
    
    cart.length = 0;
    updateCartDisplay();
}

// Cart Modal Functions
function showCartModal() {
    const cartModal = document.getElementById('cartModal');
    displayCartItems();
    cartModal.classList.add('show');
}

function closeCartModal() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.remove('show');
}

function displayCartItems() {
    const cartItemsList = document.getElementById('cartItemsList');
    const cartModalTotal = document.getElementById('cartModalTotal');
    
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Nenhum item no carrinho</p>';
        cartModalTotal.textContent = 'R$ 0,00';
        return;
    }
    
    cartItemsList.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const price = parseBRL(item.priceBRL);
        const itemTotal = price * item.quantity;
        total += itemTotal;
        
        const itemRow = document.createElement('div');
        itemRow.className = 'cart-item-row';
        itemRow.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-quantity">Quantidade: ${item.quantity}</div>
                ${item.note ? `<div style="font-size: 0.85em; color: #ff9800; margin-top: 4px;">📝 ${item.note}</div>` : ''}
            </div>
            <div class="cart-item-price">R$ ${itemTotal.toFixed(2).replace('.', ',')}</div>
            <button class="cart-item-remove" onclick="removeItemFromCart(${item.cartId})">Remover</button>
        `;
        cartItemsList.appendChild(itemRow);
    });
    
    cartModalTotal.textContent = formatBRL(total);
}

function removeItemFromCart(cartId) {
    const index = cart.findIndex(item => item.cartId === cartId);
    if (index > -1) {
        cart.splice(index, 1);
    }
    updateCartDisplay();
    displayCartItems();
}

