// Doces tab script

function initDoces() {
    const doces = menuData.filter(item => item.category === 'doces');
    renderMenuItems(doces, 'docesGrid');
}

