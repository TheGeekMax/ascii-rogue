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

// Move the player
function movePlayer(dx, dy) {
    const newX = gameState.player.x + dx;
    const newY = gameState.player.y + dy;
    
    // Check if new position is within map bounds
    if (newX < 0 || newX >= MAP_WIDTH || newY < 0 || newY >= MAP_HEIGHT) {
        return;
    }
    
    // Check for interaction with monsters
    const monster = gameState.monsters.find(m => m.x === newX && m.y === newY);
    if (monster) {
        // Attack the monster
        attackMonster(monster);
        
        // Process potion effects after turn
        processPotionEffects();
        
        // Move other monsters
        moveMonsters();
        
        // Update the display
        drawGame();
        return;
    }
    
    // Check for chest interaction
    if (gameState.map[newY][newX] === TILES.CHEST) {
        openChest(newX, newY);
        
        // Process potion effects after turn
        processPotionEffects();
        
        // Move other monsters
        moveMonsters();
        return;
    }
    
    // Check for shop interaction
    if (gameState.map[newY][newX] === TILES.SHOP) {
        enterShop();
        return;
    }
    
    // Check for exit interaction
    if (gameState.map[newY][newX] === TILES.EXIT) {
        // Move to the next floor
        gameState.currentFloor++;
        addMessage(`Descending to floor ${gameState.currentFloor}...`);
        generateLevel();
        updateStats();
        updateMonsterList();
        drawGame();
        return;
    }
    
    // Check if the new position is a wall
    if (gameState.map[newY][newX] === TILES.WALL) {
        return;
    }
    
    // Move player if the path is clear
    gameState.player.x = newX;
    gameState.player.y = newY;
    
    // Process health regeneration if player has that upgrade
    if (gameState.player.healthRegen > 0) {
        const regenAmount = Math.ceil(gameState.player.maxHealth * gameState.player.healthRegen / 100);
        gameState.player.health = Math.min(gameState.player.health + regenAmount, gameState.player.maxHealth);
    }
    
    // Process potion effects after turn
    processPotionEffects();
    
    // Move monsters after player's move
    moveMonsters();
    
    // Update the display
    drawGame();
    updateStats();
}

// Level up the player
function levelUp() {
    gameState.player.level += 1;
    gameState.player.maxHealth += 20;
    gameState.player.health = gameState.player.maxHealth; // Full heal on level up
    gameState.player.attackPower += 2;
    
    // Calculate experience needed for next level - increases with each level
    gameState.player.experienceToLevel = Math.floor(gameState.player.experienceToLevel * 1.5);
    
    addMessage(`Level Up! You are now level ${gameState.player.level}. Health and attack increased!`);
    updateStats();
}

// Check if player should level up
function checkLevelUp() {
    while (gameState.player.experience >= gameState.player.experienceToLevel) {
        gameState.player.experience -= gameState.player.experienceToLevel;
        levelUp();
    }
    updateStats();
}

// Attack a monster
function attackMonster(monster) {
    // Calculate attack damage (with random variation)
    let damage = Math.floor(gameState.player.attackPower * (0.8 + Math.random() * 0.4));
    
    // Check for critical hit
    const isCritical = Math.random() < gameState.player.critChance;
    if (isCritical) {
        damage *= 2;
        addMessage(`Critical hit! You deal ${damage} damage to the ${monster.type}!`);
    } else {
        addMessage(`You attack the ${monster.type} for ${damage} damage.`);
    }
    
    // Apply damage to monster
    monster.health -= damage;
    
    // Check if monster is defeated
    if (monster.health <= 0) {
        // Calculate experience and gold rewards (with bonuses)
        const expReward = Math.ceil(monster.expValue * (1 + gameState.player.expBonus));
        const goldReward = Math.ceil(monster.goldValue * (1 + gameState.player.goldBonus));
        
        gameState.player.experience += expReward;
        gameState.player.gold += goldReward;
        
        addMessage(`You defeated the ${monster.type}! Gained ${expReward} exp and ${goldReward} gold.`);
        
        // Remove monster from the game
        gameState.monsters = gameState.monsters.filter(m => m.id !== monster.id);
        
        // Check for level up
        checkLevelUp();
        
        // Check if all monsters are defeated
        if (gameState.monsters.length === 0) {
            gameState.allMonstersDefeated = true;
            revealExit();
        }
        
        // Update monster list
        updateMonsterList();
        
        return;
    }
    
    // Double attack chance check
    if (Math.random() < gameState.player.doubleAttackChance) {
        const secondDamage = Math.floor(gameState.player.attackPower * (0.6 + Math.random() * 0.3));
        addMessage(`Extra attack! You deal ${secondDamage} additional damage.`);
        monster.health -= secondDamage;
        
        // Check again if monster defeated
        if (monster.health <= 0) {
            // Calculate experience and gold rewards (with bonuses)
            const expReward = Math.ceil(monster.expValue * (1 + gameState.player.expBonus));
            const goldReward = Math.ceil(monster.goldValue * (1 + gameState.player.goldBonus));
            
            gameState.player.experience += expReward;
            gameState.player.gold += goldReward;
            
            addMessage(`You defeated the ${monster.type}! Gained ${expReward} exp and ${goldReward} gold.`);
            
            // Remove monster from the game
            gameState.monsters = gameState.monsters.filter(m => m.id !== monster.id);
            
            // Check for level up
            checkLevelUp();
            
            // Check if all monsters are defeated
            if (gameState.monsters.length === 0) {
                gameState.allMonstersDefeated = true;
                revealExit();
            }
            
            // Update monster list
            updateMonsterList();
            
            return;
        }
    }
    
    // Monster counterattack
    monsterAttack(monster);
    
    // Update monster list
    updateMonsterList();
}

// Open a chest
function openChest(x, y) {
    // Calculate gold based on floor level and luck
    const baseGold = 5 + Math.floor(Math.random() * 10) * gameState.currentFloor;
    const goldGain = Math.ceil(baseGold * (1 + gameState.player.goldBonus));
    
    // Give gold
    gameState.player.gold += goldGain;
    addMessage(`You found a treasure chest! +${goldGain} gold`);
    
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