// Cart and payment functions extracted for main page usage

// Variables to store order details
let currentOrderType = null; // 'local' or 'delivery'
let currentTableNumber = null;
let currentDeliveryAddress = null;
let currentItemForAddToCart = null; // Store item being added

function addToCart(item) {
    // Check if restaurant is closed
    const isOpen = localStorage.getItem('restaurantOpen') !== 'false';
    if (!isOpen) {
        const shouldContinue = confirm('⚠️ O restaurante está fechado no momento!\n\nVocê pode adicionar o item ao carrinho, mas o pedido só será aceito quando o restaurante abrir.\n\nDeseja continuar?');
        if (!shouldContinue) {
            return;
        }
    }
    
    if (item.outOfStock) {
        alert('Este item está em falta no momento.');
        return;
    }

    // Store item and show modal
    currentItemForAddToCart = item;
    showAddToCartModal(item);
}

function showAddToCartModal(item) {
    const modal = document.getElementById('addToCartModal');
    const nameEl = document.getElementById('addToCartItemName');
    const quantityEl = document.getElementById('addToCartQuantity');
    const noteEl = document.getElementById('addToCartNote');
    
    if (!modal || !nameEl || !quantityEl || !noteEl) {
        console.error('Add to cart modal elements not found');
        return;
    }
    
    nameEl.textContent = item.name;
    quantityEl.value = 1;
    noteEl.value = '';
    
    modal.classList.add('show');
}

function closeAddToCartModal() {
    const modal = document.getElementById('addToCartModal');
    if (modal) {
        modal.classList.remove('show');
    }
    currentItemForAddToCart = null;
}

function confirmAddToCartFromModal() {
    if (!currentItemForAddToCart) {
        alert('❌ Erro ao adicionar item. Por favor, tente novamente.');
        return;
    }
    
    const quantityEl = document.getElementById('addToCartQuantity');
    const noteEl = document.getElementById('addToCartNote');
    
    const quantity = parseInt(quantityEl.value);
    const note = noteEl.value.trim();
    
    if (isNaN(quantity) || quantity < 1) {
        alert('❌ Quantidade inválida! Por favor, insira um número maior que zero.');
        return;
    }

    if (quantity > 99) {
        alert('❌ Quantidade máxima é 99 unidades.');
        return;
    }
    
    const cartItem = {
        ...currentItemForAddToCart,
        cartId: Date.now() + Math.random(),
        note: note,
        quantity: quantity
    };
    
    // Check if item already exists in cart with same note
    const existingItem = cart.find(c => c.id === currentItemForAddToCart.id && c.note === cartItem.note);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push(cartItem);
    }
    
    updateCartDisplay();
    closeAddToCartModal();
    
    // Show success message
    alert(`✅ ${quantity}x ${currentItemForAddToCart.name} adicionado(s) ao carrinho!`);
}

// Order Type Selection in Cart Bar
function openOrderTypeSelection() {
    const about = JSON.parse(localStorage.getItem('aboutInfo') || '{}');
    const deliveryType = about.deliveryType || 'with-delivery';
    
    // Only show modal if both options are available
    if (deliveryType === 'with-delivery') {
        showOrderTypeModal();
    } else {
        alert('ℹ️ O tipo de entrega já está definido pelo restaurante.');
    }
}

function removeFromCart(cartId) {
    const index = cart.findIndex(item => item.cartId === cartId);
    if (index > -1) {
        cart.splice(index, 1);
    }
    updateCartDisplay();
}

function updateCartItemQuantity(cartId, newQuantity) {
    const item = cart.find(c => c.cartId === cartId);
    if (item) {
        if (newQuantity < 1) {
            removeFromCart(cartId);
        } else if (newQuantity > 99) {
            alert('❌ Quantidade máxima é 99 unidades.');
        } else {
            item.quantity = newQuantity;
        }
        updateCartDisplay();
        displayCartItems();
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartBar = document.querySelector('.cart-bar');
    const cartFab = document.getElementById('cartFab');
    const cartFabBadge = document.getElementById('cartFabBadge');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    if (cartFabBadge) cartFabBadge.textContent = totalItems;
    
    let total = cart.reduce((sum, item) => {
        const price = parseBRL(item.priceBRL);
        return sum + (price * item.quantity);
    }, 0);
    
    if (cartTotal) cartTotal.textContent = formatBRL(total);
    
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
    
    // Show/hide cart bar and fab based on cart contents
    if (cartBar) {
        if (cart.length === 0) {
            cartBar.classList.add('hidden');
        } else {
            cartBar.classList.remove('hidden');
        }
    }
    
    if (cartFab) {
        if (cart.length === 0) {
            cartFab.classList.add('hidden');
        } else {
            cartFab.classList.remove('hidden');
        }
    }
    
    // Update order type buttons visibility and selection
    updateOrderTypeButtons();
    
    // Debug log for mobile
    console.log('Cart updated:', {
        items: cart.length,
        totalItems: totalItems,
        cartFabVisible: cartFab && !cartFab.classList.contains('hidden')
    });
}

function checkout() {
    // Check if restaurant is open
    const isOpen = localStorage.getItem('restaurantOpen') !== 'false';
    if (!isOpen) {
        alert('❌ Restaurante está fechado! Não é possível fazer pedidos no momento.\n\nPor favor, tente novamente quando abrirmos.');
        return;
    }
    
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    // Show cart modal for review
    showCartModal();
}

// Order Type Selection Functions
function openOrderTypeSelection() {
    const about = JSON.parse(localStorage.getItem('aboutInfo') || '{}');
    const deliveryType = about.deliveryType || 'with-delivery';
    
    // Determine what to show based on delivery type
    if (deliveryType === 'with-delivery') {
        showOrderTypeModal();
    } else if (deliveryType === 'delivery-only') {
        currentOrderType = 'delivery';
        showDeliveryAddressModal();
    } else if (deliveryType === 'no-delivery') {
        currentOrderType = 'local';
        showTableSelectionModal();
    }
}

function showOrderTypeModal() {
    const orderTypeModal = document.getElementById('orderTypeModal');
    orderTypeModal.classList.add('show');
}

function closeOrderTypeModal() {
    const orderTypeModal = document.getElementById('orderTypeModal');
    orderTypeModal.classList.remove('show');
}

function selectOrderType(type) {
    currentOrderType = type;
    closeOrderTypeModal();
    
    // Proceed to next step instead of just updating button
    if (type === 'local') {
        showTableSelectionModal();
    } else if (type === 'delivery') {
        showDeliveryAddressModal();
    }
}

function updateOrderTypeButtonText() {
    const buttonText = document.getElementById('orderTypeButtonText');
    if (!buttonText) return;
    
    if (currentOrderType === 'local' && currentTableNumber) {
        buttonText.innerHTML = `🍽️ Mesa ${currentTableNumber}`;
    } else if (currentOrderType === 'delivery' && currentDeliveryAddress) {
        buttonText.innerHTML = '🚗 Delivery';
    } else {
        buttonText.innerHTML = '📍 Selecionar Entrega';
    }
}

function updateOrderTypeFabIcon() {
    const fabIcon = document.getElementById('orderTypeFabIcon');
    if (!fabIcon) return;
    
    if (currentOrderType === 'local' && currentTableNumber) {
        fabIcon.textContent = '🍽️';
    } else if (currentOrderType === 'delivery' && currentDeliveryAddress) {
        fabIcon.textContent = '🚗';
    } else {
        fabIcon.textContent = '📍';
    }
}

function updateOrderTypeButtons() {
    const about = JSON.parse(localStorage.getItem('aboutInfo') || '{}');
    const deliveryType = about.deliveryType || 'with-delivery';
    const selectOrderTypeBtn = document.getElementById('selectOrderTypeBtn');
    const orderTypeFab = document.getElementById('orderTypeFab');
    
    // Update desktop button
    if (selectOrderTypeBtn) {
        selectOrderTypeBtn.style.display = 'flex';
        updateOrderTypeButtonText();
    }
    
    // Update mobile FAB icon (visibility controlled by CSS media queries)
    if (orderTypeFab) {
        updateOrderTypeFabIcon();
    }
}

// Table Selection Functions
function showTableSelectionModal() {
    const tableModal = document.getElementById('tableSelectionModal');
    const tableInput = document.getElementById('tableNumberInput');
    if (tableInput) tableInput.value = '';
    tableModal.classList.add('show');
}

function closeTableSelectionModal() {
    const tableModal = document.getElementById('tableSelectionModal');
    tableModal.classList.remove('show');
}

function confirmTableSelection() {
    const tableInput = document.getElementById('tableNumberInput');
    const tableNumber = parseInt(tableInput?.value);
    
    if (!tableNumber || tableNumber < 1) {
        alert('❌ Por favor, insira um número de mesa válido.');
        return;
    }
    
    // Get table count from aboutInfo
    const about = JSON.parse(localStorage.getItem('aboutInfo') || '{}');
    const maxTables = parseInt(about.tableCount) || 999;
    
    if (tableNumber > maxTables) {
        alert(`❌ Mesa inválida! O restaurante tem apenas ${maxTables} mesas.`);
        return;
    }
    
    currentTableNumber = tableNumber;
    closeTableSelectionModal();
    
    // Update button text and FAB icon
    updateOrderTypeButtonText();
    updateOrderTypeFabIcon();
    
    alert(`✅ Mesa ${tableNumber} selecionada!\n🍽️ Pedido no Local`);
}

// Delivery Address Functions
function showDeliveryAddressModal() {
    const addressModal = document.getElementById('deliveryAddressModal');
    // Clear previous values
    if (document.getElementById('deliveryStreet')) document.getElementById('deliveryStreet').value = '';
    if (document.getElementById('deliveryNumber')) document.getElementById('deliveryNumber').value = '';
    if (document.getElementById('deliveryComplement')) document.getElementById('deliveryComplement').value = '';
    if (document.getElementById('deliveryNeighborhood')) document.getElementById('deliveryNeighborhood').value = '';
    if (document.getElementById('deliveryReference')) document.getElementById('deliveryReference').value = '';
    addressModal.classList.add('show');
}

function closeDeliveryAddressModal() {
    const addressModal = document.getElementById('deliveryAddressModal');
    addressModal.classList.remove('show');
}

function confirmDeliveryAddress() {
    const street = document.getElementById('deliveryStreet')?.value.trim();
    const number = document.getElementById('deliveryNumber')?.value.trim();
    const complement = document.getElementById('deliveryComplement')?.value.trim();
    const neighborhood = document.getElementById('deliveryNeighborhood')?.value.trim();
    const reference = document.getElementById('deliveryReference')?.value.trim();
    
    if (!street || !number || !neighborhood) {
        alert('❌ Por favor, preencha todos os campos obrigatórios (Rua, Número, Bairro).');
        return;
    }
    
    currentDeliveryAddress = {
        street,
        number,
        complement,
        neighborhood,
        reference
    };
    
    closeDeliveryAddressModal();
    
    // Update button text and FAB icon
    updateOrderTypeButtonText();
    updateOrderTypeFabIcon();
    
    alert(`✅ Endereço de entrega configurado!\n🚗 Delivery para:\n${street}, ${number}\n${neighborhood}`);
}

function closePaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    paymentModal.classList.remove('show');
}

function showConfirmationModal(paymentMethod) {
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationPreview = document.getElementById('confirmationPreview');
    
    const paymentLabels = {
        'dinheiro': '💵 Dinheiro',
        'credito': '💳 Crédito',
        'debito': '💳 Débito',
        'pix': '📱 PIX'
    };
    
    // Create confirmation preview
    let total = cart.reduce((sum, item) => {
        const price = parseBRL(item.priceBRL);
        return sum + (price * item.quantity);
    }, 0);
    
    const totalDisplay = formatBRL(total);
    
    // Build order type info
    let orderTypeHTML = '';
    if (currentOrderType === 'local' && currentTableNumber) {
        orderTypeHTML = `<p style="margin: 6px 0 0 0; color: #666; font-weight: 600;">🍽️ Pedido no Local - Mesa ${currentTableNumber}</p>`;
    } else if (currentOrderType === 'delivery' && currentDeliveryAddress) {
        const addr = currentDeliveryAddress;
        orderTypeHTML = `
            <p style="margin: 6px 0 0 0; color: #666; font-weight: 600;">🚗 Delivery</p>
            <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">
                ${addr.street}, ${addr.number}${addr.complement ? ' - ' + addr.complement : ''}<br>
                ${addr.neighborhood}
                ${addr.reference ? '<br>Ref: ' + addr.reference : ''}
            </p>
        `;
    }
    
    const previewHTML = `
        <div style="padding: 15px; background: var(--surface); border-radius: 8px; font-size: 13px;">
            <p style="margin: 0 0 10px 0; font-weight: bold;">📋 Resumo do Pedido:</p>
            ${cart.map((item, idx) => {
                const price = parseBRL(item.priceBRL);
                const itemTotal = (price * item.quantity).toFixed(2);
                return `
                    <div style="margin: 8px 0; padding: 8px; background: var(--bg); border-radius: 4px;">
                        <p style="margin: 0;">${idx + 1}. ${item.name} (x${item.quantity})</p>
                        <p style="margin: 4px 0 0 0; color: #666; font-size: 12px;">R$ ${itemTotal.replace('.', ',')}</p>
                        ${item.note ? `<p style="margin: 4px 0 0 0; color: #ff9800; font-size: 12px;">🔖 ${item.note}</p>` : ''}
                    </div>
                `;
            }).join('')}
            <div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid var(--border);">
                <p style="margin: 0; font-weight: bold; font-size: 14px;">Total: ${totalDisplay}</p>
                <p style="margin: 6px 0 0 0; color: #666;">Pagamento: ${paymentLabels[paymentMethod]}</p>
                ${orderTypeHTML}
            </div>
        </div>
    `;
    
    confirmationPreview.innerHTML = previewHTML;
    confirmationModal.classList.add('show');
    
    // Handle confirmation
    document.getElementById('confirmOrderBtn').onclick = () => {
        closeConfirmationModal();
        completeCheckout(paymentMethod);
    };
}

function closeConfirmationModal() {
    const confirmationModal = document.getElementById('confirmationModal');
    confirmationModal.classList.remove('show');
}

function completeCheckout(paymentMethod) {
    let orderSummary = '=== RESUMO DO PEDIDO ===\n\n';
    const paymentLabels = {
        'dinheiro': '💵 Dinheiro',
        'credito': '💳 Crédito',
        'debito': '💳 Débito',
        'pix': '📱 PIX'
    };
    
    // Add order type info
    if (currentOrderType === 'local' && currentTableNumber) {
        orderSummary += `🍽️ Pedido no Local - Mesa ${currentTableNumber}\n\n`;
    } else if (currentOrderType === 'delivery' && currentDeliveryAddress) {
        const addr = currentDeliveryAddress;
        orderSummary += `🚗 Delivery\n`;
        orderSummary += `Endereço: ${addr.street}, ${addr.number}${addr.complement ? ' - ' + addr.complement : ''}\n`;
        orderSummary += `Bairro: ${addr.neighborhood}\n`;
        if (addr.reference) orderSummary += `Referência: ${addr.reference}\n`;
        orderSummary += '\n';
    }
    
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
    const now = new Date();
    const timestamp = now.toLocaleString('pt-BR');
    
    orderSummary += `\n━━━━━━━━━━━━━━━━━━━━\nTOTAL: ${totalDisplay}\nPagamento: ${paymentLabels[paymentMethod]}\n\nPedido enviado para a cozinha! ✔`;
    
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
        totalDisplay: totalDisplay,
        paymentMethod: paymentMethod,
        paymentLabel: paymentLabels[paymentMethod],
        timestamp: timestamp,
        status: 'pending',
        paid: false,
        orderType: currentOrderType,
        tableNumber: currentOrderType === 'local' ? currentTableNumber : null,
        deliveryAddress: currentOrderType === 'delivery' ? currentDeliveryAddress : null
    };
    
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    alert(orderSummary);
    
    // Show receipt modal
    showReceiptModal(order);
    
    cart.length = 0;
    updateCartDisplay();
    
    // Reset order details and button text
    currentOrderType = null;
    currentTableNumber = null;
    currentDeliveryAddress = null;
    
    // Reset order type button text and FAB icon
    updateOrderTypeButtonText();
    updateOrderTypeFabIcon();
}

function showReceiptModal(order) {
    const receiptModal = document.getElementById('receiptModal');
    const receiptPreview = document.getElementById('receiptPreview');
    
    // Build order type info for receipt
    let orderTypeHTML = '';
    if (order.orderType === 'local' && order.tableNumber) {
        orderTypeHTML = `
            <div style="margin-bottom: 15px; border-top: 1px solid #ddd; padding-top: 10px;">
                <p style="margin: 0; font-weight: bold;">🍽️ PEDIDO NO LOCAL</p>
                <p style="margin: 4px 0 0 0; color: #666;">Mesa: ${order.tableNumber}</p>
            </div>
        `;
    } else if (order.orderType === 'delivery' && order.deliveryAddress) {
        const addr = order.deliveryAddress;
        orderTypeHTML = `
            <div style="margin-bottom: 15px; border-top: 1px solid #ddd; padding-top: 10px;">
                <p style="margin: 0; font-weight: bold;">🚗 DELIVERY</p>
                <p style="margin: 4px 0 0 0; color: #666;">
                    ${addr.street}, ${addr.number}${addr.complement ? ' - ' + addr.complement : ''}<br>
                    ${addr.neighborhood}
                    ${addr.reference ? '<br>Ref: ' + addr.reference : ''}
                </p>
            </div>
        `;
    }
    
    // Create receipt HTML
    const receiptHTML = `
        <div id="receiptContent" style="padding: 20px; background: white; border-radius: 8px; font-family: monospace; font-size: 13px; line-height: 1.6;">
            <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px;">
                <h3 style="margin: 0; font-size: 16px;">🍽️ COMPROVANTE DE PEDIDO</h3>
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #666;">Pedido #${order.id}</p>
            </div>
            
            <div style="margin-bottom: 15px;">
                <p style="margin: 0; font-size: 12px; color: #666;">📅 ${order.timestamp}</p>
            </div>
            
            ${orderTypeHTML}
            
            <div style="margin-bottom: 15px; border-top: 1px solid #ddd; padding-top: 10px;">
                <p style="margin: 0 0 10px 0; font-weight: bold;">ITENS DO PEDIDO:</p>
                ${order.items.map((item, idx) => {
                    const price = parseBRL(item.price);
                    const itemTotal = (price * item.quantity).toFixed(2);
                    return `
                        <div style="margin-bottom: 10px;">
                            <p style="margin: 0;">${idx + 1}. ${item.name}</p>
                            <p style="margin: 0; color: #666;">   Qtd: ${item.quantity} x R$ ${price.toFixed(2).replace('.', ',')} = R$ ${itemTotal.replace('.', ',')}</p>
                            ${item.note ? `<p style="margin: 5px 0 0 0; color: #ff9800;">   🔖 Nota: ${item.note}</p>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div style="border-top: 2px solid #333; padding-top: 10px; margin-bottom: 15px;">
                <p style="margin: 0; font-weight: bold; font-size: 16px;">TOTAL: ${order.totalDisplay}</p>
                <p style="margin: 8px 0 0 0;">Pagamento: ${order.paymentLabel}</p>
            </div>
            
            <div style="text-align: center; border-top: 1px dashed #999; padding-top: 10px; color: #666; font-size: 12px;">
                <p style="margin: 0;">Obrigado pela preferência!</p>
                <p style="margin: 5px 0 0 0;">✓ Pedido enviado para a cozinha</p>
            </div>
        </div>
    `;
    
    receiptPreview.innerHTML = receiptHTML;
    receiptModal.classList.add('show');
    
    // Handle save buttons
    document.getElementById('shareWhatsappBtn').onclick = () => {
        shareReceiptViaWhatsApp(order);
    };
    
    document.getElementById('saveImageBtn').onclick = () => {
        saveReceiptAsImage(order);
    };
}

function closeReceiptModal() {
    const receiptModal = document.getElementById('receiptModal');
    receiptModal.classList.remove('show');
}

function shareReceiptViaWhatsApp(order) {
    const element = document.getElementById('receiptContent');
    
    // Get restaurant WhatsApp from aboutInfo
    const about = JSON.parse(localStorage.getItem('aboutInfo') || '{}');
    const whatsappNumber = about.whatsapp || '5511999999999';
    
    html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        canvas.toBlob((blob) => {
            // Create file from blob
            const file = new File([blob], `comprovante_${order.id}.png`, { type: 'image/png' });
            
            // Create message text
            let orderTypeText = '';
            if (order.orderType === 'local' && order.tableNumber) {
                orderTypeText = `🍽️ Mesa ${order.tableNumber}`;
            } else if (order.orderType === 'delivery' && order.deliveryAddress) {
                const addr = order.deliveryAddress;
                orderTypeText = `🚗 Delivery para: ${addr.street}, ${addr.number}, ${addr.neighborhood}`;
            }
            
            const message = encodeURIComponent(
                `📋 *Comprovante de Pedido #${order.id}*\n\n` +
                `${orderTypeText}\n` +
                `💰 Total: ${order.totalDisplay}\n` +
                `💳 Pagamento: ${order.paymentLabel}\n\n` +
                `Segue comprovante em anexo.`
            );
            
            // Check if Web Share API is available (mobile)
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({
                    files: [file],
                    title: `Pedido #${order.id}`,
                    text: `Comprovante do pedido #${order.id}`
                }).then(() => {
                    alert('✅ Comprovante compartilhado com sucesso!');
                    closeReceiptModal();
                }).catch((error) => {
                    console.error('Error sharing:', error);
                    // Fallback to WhatsApp Web link
                    openWhatsAppWeb(whatsappNumber, message);
                });
            } else {
                // Fallback to WhatsApp Web link (will open without image)
                alert('⚠️ Compartilhamento direto não disponível. Abrindo WhatsApp Web...\n\nPor favor, envie o comprovante manualmente após salvá-lo.');
                // Save image first
                const link = document.createElement('a');
                link.href = canvas.toDataURL('image/png');
                link.download = `comprovante_${order.id}.png`;
                link.click();
                // Then open WhatsApp
                setTimeout(() => {
                    openWhatsAppWeb(whatsappNumber, message);
                }, 500);
            }
        }, 'image/png');
    });
}

function openWhatsAppWeb(number, message) {
    const url = `https://wa.me/${number}?text=${message}`;
    window.open(url, '_blank');
    closeReceiptModal();
}

function saveReceiptAsImage(order) {
    const element = document.getElementById('receiptContent');
    
    html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `comprovante_${order.id}.png`;
        link.click();
        alert('Comprovante salvo como imagem! ✔');
        closeReceiptModal();
    });
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

function proceedToPayment() {
    // Check if cart is still not empty
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    // Close cart modal
    closeCartModal();
    
    // Get delivery type from aboutInfo
    const about = JSON.parse(localStorage.getItem('aboutInfo') || '{}');
    const deliveryType = about.deliveryType || 'with-delivery';
    
    // Check if order type and details are already set
    if ((currentOrderType === 'local' && currentTableNumber) || 
        (currentOrderType === 'delivery' && currentDeliveryAddress)) {
        // Order details already configured, go to payment
        showPaymentModal();
    } else if (currentOrderType) {
        // Order type selected but details not set
        if (currentOrderType === 'local') {
            showTableSelectionModal();
        } else if (currentOrderType === 'delivery') {
            showDeliveryAddressModal();
        }
    } else {
        // No order type selected, determine based on delivery type
        if (deliveryType === 'with-delivery') {
            showOrderTypeModal();
        } else if (deliveryType === 'delivery-only') {
            currentOrderType = 'delivery';
            showDeliveryAddressModal();
        } else if (deliveryType === 'no-delivery') {
            currentOrderType = 'local';
            showTableSelectionModal();
        }
    }
}

function showPaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    paymentModal.classList.add('show');
    
    // Handle payment button clicks
    const paymentButtons = paymentModal.querySelectorAll('.payment-btn');
    paymentButtons.forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const paymentMethod = btn.getAttribute('data-method');
            closePaymentModal();
            showConfirmationModal(paymentMethod);
        };
    });
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
                ${item.note ? `<div style="font-size: 0.85em; color: #ff9800; margin-top: 4px;">🔖 ${item.note}</div>` : ''}
                <div class="cart-item-quantity-controls">
                    <button class="qty-btn" onclick="updateCartItemQuantity(${item.cartId}, ${item.quantity - 1})">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartItemQuantity(${item.cartId}, ${item.quantity + 1})">+</button>
                </div>
            </div>
            <div class="cart-item-price">R$ ${itemTotal.toFixed(2).replace('.', ',')}</div>
            <button class="cart-item-remove" onclick="removeItemFromCart(${item.cartId})">🗑️</button>
        `;
        cartItemsList.appendChild(itemRow);
    });
    
    cartModalTotal.textContent = formatBRL(total);
}

function removeItemFromCart(cartId) {
    const item = cart.find(c => c.cartId === cartId);
    if (!item) return;
    
    const shouldRemove = confirm(`Remover "${item.name}" do carrinho?`);
    if (shouldRemove) {
        const index = cart.findIndex(c => c.cartId === cartId);
        if (index > -1) {
            cart.splice(index, 1);
        }
        updateCartDisplay();
        displayCartItems();
    }
}

// Store current item for modal confirmation
let currentItemForModal = null;

// Show item details modal for mobile
function showItemDetailsModal(item) {
    currentItemForModal = item;
    const modal = document.getElementById('itemDetailsModal');
    const nameEl = document.getElementById('itemDetailsName');
    const descriptionEl = document.getElementById('itemDetailsDescription');
    const priceEl = document.getElementById('itemDetailsPrice');
    const imageEl = document.getElementById('itemDetailsImage');
    
    // Populate modal
    nameEl.textContent = item.name;
    descriptionEl.textContent = item.description || 'Sem descrição disponível';
    priceEl.textContent = item.priceBRL;
    
    // Set image
    if (item.imageDataUrl) {
        imageEl.innerHTML = `<img src="${item.imageDataUrl}" alt="${item.name}" style="width:100%; height:100%; object-fit: cover; border-radius: 8px;">`;
    } else {
        imageEl.innerHTML = item.emoji || '🍽️';
    }
    
    // Show modal
    modal.classList.add('show');
}

// Close item details modal
function closeItemDetailsModal() {
    const modal = document.getElementById('itemDetailsModal');
    modal.classList.remove('show');
    currentItemForModal = null;
}

// Confirm and add item to cart from mobile modal
function confirmAddToCart() {
    if (!currentItemForModal) return;
    
    // Store the item in a local variable to prevent it from being lost
    const itemToAdd = currentItemForModal;
    
    // Close mobile item details modal
    closeItemDetailsModal();
    
    // Small delay to ensure smooth modal transition
    setTimeout(() => {
        // Set the current item for add to cart modal
        currentItemForAddToCart = itemToAdd;
        
        // Show the add to cart modal with quantity and note
        showAddToCartModal(itemToAdd);
    }, 150);
}