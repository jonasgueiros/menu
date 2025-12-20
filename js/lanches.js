// Lanches tab script

function initLanches() {
    const lanches = menuData.filter(item => item.category === 'lanches');
    renderMenuItems(lanches, 'lanchesGrid');
}

