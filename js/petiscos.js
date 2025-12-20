// Petiscos tab script

function initPetiscos() {
    const petiscos = menuData.filter(item => item.category === 'petiscos');
    renderMenuItems(petiscos, 'petiscosGrid');
}

