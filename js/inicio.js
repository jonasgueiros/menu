// Inicio tab script: renders Mais Pedidos, Promoção, Combos

function initInicio() {
    const maisPedidos = menuData.filter(item => item.mostOrdered);
    renderMenuItems(maisPedidos, 'maispedidosGrid');
    
    const promocoes = menuData.filter(item => item.isPromotion);
    renderMenuItems(promocoes, 'promocaoGrid');
    
    const combos = menuData.filter(item => item.isCombo);
    renderMenuItems(combos, 'combosGrid');
}

