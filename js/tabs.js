// Tabs script: consolidates menu category pages (inicio, petiscos, lanches, doces, drinks)

function initInicio() {
    const maisPedidos = menuData.filter(item => item.mostOrdered);
    renderMenuItems(maisPedidos, 'maispedidosGrid');
    
    const promocoes = menuData.filter(item => item.isPromotion);
    renderMenuItems(promocoes, 'promocaoGrid');
    
    const combos = menuData.filter(item => item.isCombo);
    renderMenuItems(combos, 'combosGrid');
}

function initPetiscos() {
    const petiscos = menuData.filter(item => item.category === 'petiscos');
    renderMenuItems(petiscos, 'petiscosGrid');
}

function initLanches() {
    const lanches = menuData.filter(item => item.category === 'lanches');
    renderMenuItems(lanches, 'lanchesGrid');
}

function initDoces() {
    const doces = menuData.filter(item => item.category === 'doces');
    renderMenuItems(doces, 'docesGrid');
}

function initDrinks() {
    const drinks = menuData.filter(item => item.category === 'drinks');
    renderMenuItems(drinks, 'drinksGrid');
}
