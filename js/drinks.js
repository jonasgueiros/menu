// Drinks tab script

function initDrinks() {
    const drinks = menuData.filter(item => item.category === 'drinks');
    renderMenuItems(drinks, 'drinksGrid');
}

