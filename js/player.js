// player.js - Player-related functions

// Go to next floor
function goToNextFloor() {
    gameState.currentFloor++;
    addMessage(`You descend deeper into the dungeon. Floor ${gameState.currentFloor}.`);
    
    // Generate new level
    generateLevel();
    
    // Update UI
    updateStats();
    updateMonsterList();
    drawGame();
}

// Process player movement
function movePlayer(dx, dy) {
    if (!gameState.running) return;
    
    // If in shop, don't move
    if (gameState.inShop) return;
    
    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;
    
    // Check if position is within bounds
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
        return;
    }
    
    // Check what's at the new position
    if (gameState.map[newY][newX] === TILES.WALL) {
        // Can't move through walls
        return;
    }
    
    // Check for monster
    const monsterIndex = gameState.monsters.findIndex(m => m.x === newX && m.y === newY);
    if (monsterIndex >= 0) {
        // Combat with monster
        attackMonster(monsterIndex);
        return;
    }
    
    // Check for chest
    if (gameState.map[newY][newX] === TILES.CHEST) {
        openChest(newX, newY);
    }
    
    // Check for exit
    if (gameState.map[newY][newX] === TILES.EXIT) {
        goToNextFloor();
        return;
    }
    
    // Check for shop
    if (gameState.map[newY][newX] === TILES.SHOP) {
        enterShop();
        return;
    }
    
    // Move player
    gameState.player.x = newX;
    gameState.player.y = newY;
    
    // Apply health regeneration if player has it
    if (gameState.player.healthRegen > 0) {
        const regenAmount = Math.floor(gameState.player.maxHealth * gameState.player.healthRegen / 10);
        if (regenAmount > 0 && gameState.player.health < gameState.player.maxHealth) {
            gameState.player.health = Math.min(gameState.player.health + regenAmount, gameState.player.maxHealth);
            updateStats();
        }
    }
    
    // Move monsters after player moves
    moveMonsters();
    
    // Update display
    drawGame();
}

// Check for level up
function checkLevelUp() {
    if (gameState.player.experience >= gameState.player.experienceToLevel) {
        // Level up
        gameState.player.level++;
        gameState.player.experience -= gameState.player.experienceToLevel;
        gameState.player.experienceToLevel = Math.floor(gameState.player.experienceToLevel * 1.5);
        gameState.player.maxHealth += 10;
        gameState.player.health = gameState.player.maxHealth;
        gameState.player.attackPower += 2;
        
        addMessage(`Level Up! You are now level ${gameState.player.level}.`);
        addMessage(`Health and attack power increased!`);
        
        // Update stats display
        updateStats();
    }
}

// Open a chest
function openChest(x, y) {
    // Calculate gold based on floor level and luck
    const baseGold = 5 + Math.floor(Math.random() * 10) * gameState.currentFloor;
    const goldGain = Math.ceil(baseGold * (1 + gameState.player.goldBonus));
    
    // Give gold
    gameState.player.gold += goldGain;
    addMessage(`You found a treasure chest! +${goldGain} gold`);
    
    // Chance to find a potion (scales with floor level)
    const potionChance = 0.3 + (gameState.currentFloor * 0.02); // 30% base + 2% per floor
    if (Math.random() < potionChance && gameState.player.potions.length < 5) {
        // Choose a potion based on floor level
        let potionPool = POTIONS.slice(0, 2); // Basic potions for early floors
        
        // Add better potions on higher floors
        if (gameState.currentFloor >= 3) {
            potionPool.push(POTIONS[2]); // Experience elixir
        }
        if (gameState.currentFloor >= 5) {
            potionPool.push(POTIONS[3]); // Strength potion
        }
        if (gameState.currentFloor >= 7) {
            potionPool.push(POTIONS[4]); // Fortitude potion
        }
        
        // Select random potion from the available pool
        const potion = {...potionPool[Math.floor(Math.random() * potionPool.length)]};
        
        // Add unique ID for UI
        potion.uid = Date.now() + Math.random().toString(16).slice(2);
        
        // Add to inventory
        gameState.player.potions.push(potion);
        addMessage(`You found a ${potion.name}!`);
        
        // Update potion list
        updatePotionList();
    }
    
    // Small chance to also find experience
    if (Math.random() < 0.3) {
        const xpGain = 5 + Math.floor(Math.random() * 5) * gameState.currentFloor;
        gameState.player.experience += xpGain;
        addMessage(`The chest contained ancient knowledge! +${xpGain} XP`);
        
        // Check for level up
        checkLevelUp();
    }
    
    // Remove chest from map
    gameState.map[y][x] = TILES.FLOOR;
    
    // Update display
    updateStats();
    drawGame();
}