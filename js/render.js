// render.js - Drawing and UI functions

// Draw the game
function drawGame() {
    if (!gameState.running) return;
    
    // If in shop mode, draw the shop instead
    if (gameState.inShop) {
        drawShop();
        return;
    }
    
    let display = '';
    
    // Draw each row with color spans only around special characters
    for (let y = 0; y < MAP_HEIGHT; y++) {
        let line = '';
        
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Default to map tile (wall or floor with no styling)
            let char = gameState.map[y][x];
            let charWithStyle = char;
            
            // Check for monsters
            const monster = gameState.monsters.find(m => m.x === x && m.y === y);
            if (monster) {
                char = monster.char;
                charWithStyle = `<span style="color:${monster.color}">${char}</span>`;
            }
            // Check for player
            else if (x === gameState.player.x && y === gameState.player.y) {
                char = TILES.PLAYER;
                charWithStyle = `<span style="color:#ff9900">${char}</span>`;
            }
            // Check for special tiles
            else if (char === TILES.CHEST) {
                charWithStyle = `<span class="chest-animated">${char}</span>`;
            }
            else if (char === TILES.EXIT) {
                charWithStyle = `<span class="exit-animated">${char}</span>`;
            }
            else if (char === TILES.SHOP) {
                charWithStyle = `<span class="shop-animated">${char}</span>`;
            }
            // No spans for walls and floors - they're rendered as plain characters
            
            line += charWithStyle;
        }
        
        // Each line is wrapped in a span
        display += `<span class="game-line">${line}</span>\n`;
    }
    
    // Update the game display
    gameDisplay.innerHTML = display;
}

// Draw the shop interface
function drawShop() {
    let display = '';
    
    // Shop header
    display += '<div class="shop-interface">';
    display += '<h2 class="shop-title">SHOP</h2>';
    display += `<p>Your Gold: ${gameState.player.gold} coins</p>`;
    display += '<div class="shop-items">';
    
    // Shop items
    gameState.shopItems.forEach((item, index) => {
        const canAfford = gameState.player.gold >= item.cost;
        display += `<div class="shop-item ${canAfford ? '' : 'cannot-afford'}" data-id="${item.id}">`;
        display += `<div class="shop-item-name">${index + 1}. ${item.name}</div>`;
        display += `<div class="shop-item-desc">${item.description}</div>`;
        display += `<div class="shop-item-cost">${item.cost} gold</div>`;
        display += '</div>';
    });
    
    display += '</div>';
    display += '<p class="shop-help">Press 1-4 to purchase an item, or ESC to exit shop</p>';
    display += '</div>';
    
    // Update the game display
    gameDisplay.innerHTML = display;
}

// Update stat displays
function updateStats() {
    healthValue.textContent = gameState.player.health;
    levelValue.textContent = gameState.player.level;
    expValue.textContent = `${gameState.player.experience}/${gameState.player.experienceToLevel}`;
    floorValue.textContent = `${gameState.currentFloor} | Gold: ${gameState.player.gold}`;
}

// Update monster list in UI
function updateMonsterList() {
    monsterList.innerHTML = '';
    
    if (gameState.monsters.length === 0) {
        monsterList.innerHTML = '<div class="no-monsters">No monsters remaining</div>';
        return;
    }
    
    gameState.monsters.forEach(monster => {
        const healthPercent = (monster.health / monster.maxHealth) * 100;
        
        const monsterItem = document.createElement('div');
        monsterItem.className = `monster-item ${monster.type}`;
        monsterItem.id = monster.id;
        
        monsterItem.innerHTML = `
            <div class="monster-name">${monster.char} ${monster.type}</div>
            <div class="monster-health">
                <div class="health-bar">
                    <div class="health-fill" style="width: ${healthPercent}%"></div>
                </div>
                <span>${monster.health}/${monster.maxHealth}</span>
            </div>
        `;
        
        monsterList.appendChild(monsterItem);
    });
}

// Update potions list in UI
function updatePotionList() {
    if (!potionList) return;
    
    potionList.innerHTML = '';
    
    // Add title
    const potionTitle = document.createElement('h3');
    potionTitle.textContent = 'Potions';
    potionList.appendChild(potionTitle);
    
    if (gameState.player.potions.length === 0) {
        potionList.innerHTML += '<div class="no-potions">No potions found yet</div>';
        return;
    }
    
    // Create potion list
    gameState.player.potions.forEach((potion, index) => {
        const potionElement = document.createElement('div');
        potionElement.className = 'potion-item';
        potionElement.dataset.index = index;
        
        potionElement.innerHTML = `
            <div class="potion-name">
                <span class="potion-icon" style="color: ${potion.color}">⚗</span>
                <span>${index + 1}: ${potion.name}</span>
            </div>
        `;
        
        potionList.appendChild(potionElement);
    });
    
    // Add usage hint
    const usageHint = document.createElement('div');
    usageHint.className = 'usage-hint';
    usageHint.textContent = 'Press 1-5 to use potions';
    potionList.appendChild(usageHint);
}

// Add a message to the message log
function addMessage(text) {
    messageText.textContent = text;
    gameState.messages.unshift(text);
    if (gameState.messages.length > 5) {
        gameState.messages.pop();
    }
}