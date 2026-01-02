// Shared state: currency, cart, menu data, orders
let currentCurrency = 'BRL';
let orders = [];
const cart = [];

// Initial menu data (can be overridden by localStorage)
const menuData = [
    // Petiscos (Appetizers)
    {
        id: 1,
        name: "Bruschetta",
        category: "petiscos",
        description: "Toasted bread with fresh tomatoes, basil, and garlic",
        priceBRL: "R$ 44,95",
        emoji: "🍅",
        mostOrdered: true,
        isPromotion: false,
        isCombo: false
    },
    {
        id: 2,
        name: "Calamari Rings",
        category: "petiscos",
        description: "Crispy fried squid rings with marinara sauce",
        priceBRL: "R$ 54,95",
        emoji: "🦑",
        mostOrdered: true,
        isPromotion: false,
        isCombo: false
    },
    {
        id: 3,
        name: "Chicken Wings",
        category: "petiscos",
        description: "Spicy buffalo wings with blue cheese dip",
        priceBRL: "R$ 39,95",
        originalPriceBRL: "R$ 49,95",
        emoji: "🍗",
        mostOrdered: false,
        isPromotion: true,
        isCombo: false
    },
    // Lanches (Meals)
    {
        id: 4,
        name: "Grilled Salmon",
        category: "lanches",
        description: "Fresh Atlantic salmon with lemon butter sauce",
        priceBRL: "R$ 124,95",
        emoji: "🍣",
        mostOrdered: true,
        isPromotion: false,
        isCombo: false
    },
    {
        id: 5,
        name: "Ribeye Steak",
        category: "lanches",
        description: "Premium grade beef steak with garlic herb seasoning",
        priceBRL: "R$ 164,95",
        emoji: "🥩",
        mostOrdered: true,
        isPromotion: false,
        isCombo: false
    },
    {
        id: 6,
        name: "Pasta Carbonara",
        category: "lanches",
        description: "Creamy Italian pasta with bacon and parmesan",
        priceBRL: "R$ 74,95",
        originalPriceBRL: "R$ 94,95",
        emoji: "🍝",
        mostOrdered: false,
        isPromotion: true,
        isCombo: false
    },
    {
        id: 7,
        name: "Grilled Chicken Breast",
        category: "lanches",
        description: "Tender chicken breast with herbs and lemon",
        priceBRL: "R$ 79,95",
        emoji: "🍗",
        mostOrdered: false,
        isPromotion: false,
        isCombo: false
    },
    // Combos
    {
        id: 8,
        name: "Classic Combo",
        category: "combos",
        description: "Burger + Fries + Soda",
        priceBRL: "R$ 64,95",
        emoji: "🍔",
        mostOrdered: true,
        isPromotion: false,
        isCombo: true,
        items: ["Hamburger", "French Fries", "Soda"]
    },
    {
        id: 9,
        name: "Gourmet Combo",
        category: "combos",
        description: "Grilled Salmon + Salad + Wine",
        priceBRL: "R$ 144,95",
        emoji: "🍽️",
        mostOrdered: false,
        isPromotion: true,
        isCombo: true,
        items: ["Grilled Salmon", "Caesar Salad", "Red Wine"]
    },
    {
        id: 10,
        name: "Petisco Combo",
        category: "combos",
        description: "Bruschetta + Wings + Juice",
        priceBRL: "R$ 84,95",
        emoji: "🎁",
        mostOrdered: true,
        isPromotion: false,
        isCombo: true,
        items: ["Bruschetta", "Chicken Wings", "Orange Juice"]
    },
    // Additional items for variety
    {
        id: 11,
        name: "Chocolate Lava Cake",
        category: "doces",
        description: "Warm chocolate cake with molten center",
        priceBRL: "R$ 29,95",
        originalPriceBRL: "R$ 39,95",
        emoji: "🍰",
        mostOrdered: false,
        isPromotion: true,
        isCombo: false
    },
    {
        id: 12,
        name: "Tiramisu",
        category: "doces",
        description: "Classic Italian dessert with mascarpone and cocoa",
        priceBRL: "R$ 34,95",
        emoji: "🎂",
        mostOrdered: false,
        isPromotion: false,
        isCombo: false
    },
    {
        id: 13,
        name: "Cheesecake",
        category: "doces",
        description: "Creamy New York style cheesecake with berry topping",
        priceBRL: "R$ 44,95",
        emoji: "🍪",
        mostOrdered: true,
        isPromotion: false,
        isCombo: false
    },
    {
        id: 14,
        name: "Brownies",
        category: "doces",
        description: "Fudgy chocolate brownies with walnuts",
        priceBRL: "R$ 19,95",
        originalPriceBRL: "R$ 29,95",
        emoji: "🍫",
        mostOrdered: false,
        isPromotion: true,
        isCombo: false
    },
    // Drinks (Bebidas)
    {
        id: 15,
        name: "Espresso",
        category: "drinks",
        description: "Strong Italian espresso, perfectly brewed",
        priceBRL: "R$ 19,95",
        emoji: "☕",
        mostOrdered: false,
        isPromotion: false,
        isCombo: false
    },
    {
        id: 16,
        name: "Fresh Orange Juice",
        category: "drinks",
        description: "Freshly squeezed orange juice",
        priceBRL: "R$ 24,95",
        emoji: "🧃",
        mostOrdered: true,
        isPromotion: false,
        isCombo: false
    },
    {
        id: 17,
        name: "Red Wine",
        category: "drinks",
        description: "Premium Italian Chianti Classico",
        priceBRL: "R$ 64,95",
        emoji: "🍷",
        mostOrdered: false,
        isPromotion: false,
        isCombo: false
    },
    {
        id: 18,
        name: "Coca Cola",
        category: "drinks",
        description: "Classic Coca Cola, ice cold",
        priceBRL: "R$ 14,95",
        emoji: "🥤",
        mostOrdered: true,
        isPromotion: false,
        isCombo: false
    },
    {
        id: 19,
        name: "Iced Coffee",
        category: "drinks",
        description: "Cold brew coffee with ice and cream",
        priceBRL: "R$ 19,95",
        originalPriceBRL: "R$ 24,95",
        emoji: "🧊",
        mostOrdered: false,
        isPromotion: true,
        isCombo: false
    },
    {
        id: 20,
        name: "Fish Tacos",
        category: "lanches",
        description: "Crispy fish tacos with cabbage and lime",
        priceBRL: "R$ 74,95",
        emoji: "🌮",
        mostOrdered: true,
        isPromotion: false,
        isCombo: false
    }
];

// Persistence helpers
function loadSharedState() {
    const savedMenuData = localStorage.getItem('menuData');
    if (savedMenuData) {
        menuData.length = 0;
        menuData.push(...JSON.parse(savedMenuData));
    }
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
}

function saveMenuData() {
    localStorage.setItem('menuData', JSON.stringify(menuData));
}

function saveOrders() {
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Initialize shared state immediately
loadSharedState();