// shop.js - Shop functionality

// Generate shop items for this floor
function generateShopItems() {
    gameState.shopItems = [];
    
    // Select 4 random unique items from the shop items list
    const availableItems = [...SHOP_ITEMS];
    const itemCount = Math.min(4, availableItems.length);
    
    for (let i = 0; i < itemCount; i++) {
        // Pick random item
        const index = Math.floor(Math.random() * availableItems.length);
        const item = availableItems[index];
        
        // Remove from available items to ensure uniqueness
        availableItems.splice(index, 1);
        
        // Add to shop with slightly randomized cost
        const costVariation = 0.8 + Math.random() * 0.4; // 80% to 120% of base cost
        const adjustedCost = Math.floor(item.cost * costVariation) * Math.ceil(gameState.currentFloor / 3);
        
        gameState.shopItems.push({
            ...item,
            cost: adjustedCost,
            id: `shop-item-${i}`
        });
    }
}

// Enter shop
function enterShop() {
    gameState.inShop = true;
    addMessage("Welcome to the shop! Press 1-4 to purchase items, ESC to exit.");
    drawShop();
}

// Exit shop
function exitShop() {
    gameState.inShop = false;
    addMessage("You left the shop.");
    drawGame();
}

// Buy item from shop
function buyItem(index) {
    if (index < 0 || index >= gameState.shopItems.length) return;
    
    const item = gameState.shopItems[index];
    
    if (gameState.player.gold >= item.cost) {
        gameState.player.gold -= item.cost;
        item.effect(gameState.player);
        
        addMessage(`Purchased ${item.name}! ${item.description}`);
        
        // Remove the item so it can't be purchased again
        gameState.shopItems.splice(index, 1);
        
        // Update UI
        updateStats();
        drawShop();
    } else {
        addMessage("Not enough gold!");
    }
}