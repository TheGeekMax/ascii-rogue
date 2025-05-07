// combat.js - Combat mechanics

// Player attacks monster
function attackMonster(monsterIndex) {
    const monster = gameState.monsters[monsterIndex];
    
    // Calculate damage with some randomness
    const baseDamage = Math.floor(gameState.player.attackPower * (0.8 + Math.random() * 0.4));
    
    // Check for critical hit
    const isCritical = Math.random() < gameState.player.critChance;
    const damage = isCritical ? baseDamage * 2 : baseDamage;
    
    // Apply damage
    monster.health -= damage;
    
    // Show message
    addMessage(`You hit the ${monster.type} for ${damage} damage!${isCritical ? ' CRITICAL HIT!' : ''}`);
    
    // Check for double attack
    if (Math.random() < gameState.player.doubleAttackChance && monster.health > 0) {
        const secondDamage = Math.floor(gameState.player.attackPower * (0.7 + Math.random() * 0.3));
        monster.health -= secondDamage;
        addMessage(`You strike again for ${secondDamage} damage!`);
    }
    
    // Check if monster is defeated
    if (monster.health <= 0) {
        // Calculate experience with bonus if applicable
        const expGain = Math.ceil(monster.expValue * (1 + gameState.player.expBonus));
        gameState.player.experience += expGain;
        
        // Calculate gold drop
        const goldGain = monster.goldValue;
        gameState.player.gold += goldGain;
        
        addMessage(`You defeated the ${monster.type}! +${expGain} XP, +${goldGain} gold`);
        
        // Remove monster
        gameState.monsters.splice(monsterIndex, 1);
        
        // Check for level up
        checkLevelUp();
        
        // Check if all monsters are defeated
        if (gameState.monsters.length === 0) {
            gameState.allMonstersDefeated = true;
            revealExit();
        }
    } else {
        // Monster counterattack
        monsterAttack(monster);
    }
    
    // Update UI
    updateStats();
    updateMonsterList();
    drawGame();
}

// Monster attacks player
function monsterAttack(monster) {
    // Calculate damage (with variation)
    let damage = Math.floor(monster.attack * (0.8 + Math.random() * 0.4));
    
    // Apply player's damage reduction from items
    damage = Math.max(1, Math.floor(damage * (1 - gameState.player.damageReduction)));
    
    // Apply potion-based damage reduction if active
    if (gameState.player.temporaryEffects && gameState.player.temporaryEffects.damageReduction) {
        const reductionPercent = gameState.player.temporaryEffects.damageReduction.amount;
        damage = Math.max(1, Math.floor(damage * (1 - reductionPercent)));
    }
    
    // Apply damage to player
    gameState.player.health -= damage;
    addMessage(`${monster.type} attacks you for ${damage} damage!`);
    
    // Update UI
    updateStats();
    
    // Check if player died
    if (gameState.player.health <= 0) {
        gameOver();
    }
}

// Move monsters randomly
function moveMonsters() {
    gameState.monsters.forEach(monster => {
        // Simple pathfinding: move toward player if in line of sight,
        // otherwise move randomly
        
        const dx = gameState.player.x - monster.x;
        const dy = gameState.player.y - monster.y;
        const distance = Math.abs(dx) + Math.abs(dy);
        
        // Only move if in proximity
        if (distance <= 10) {
            // Check if there's a clear line to the player
            const canSeePlayer = hasLineOfSight(monster.x, monster.y, gameState.player.x, gameState.player.y);
            
            if (canSeePlayer) {
                // Move toward player
                let moveX = 0, moveY = 0;
                
                // Decide movement direction (prefer the axis with the greater distance)
                if (Math.abs(dx) > Math.abs(dy)) {
                    moveX = dx > 0 ? 1 : -1;
                } else {
                    moveY = dy > 0 ? 1 : -1;
                }
                
                const newX = monster.x + moveX;
                const newY = monster.y + moveY;
                
                // Check if movement doesn't hit a wall, another monster, or the player
                if (gameState.map[newY][newX] !== TILES.WALL && 
                    !gameState.monsters.some(m => m !== monster && m.x === newX && m.y === newY) &&
                    !(newX === gameState.player.x && newY === gameState.player.y) &&
                    gameState.map[newY][newX] !== TILES.CHEST &&
                    gameState.map[newY][newX] !== TILES.EXIT) {
                    // Move monster
                    monster.x = newX;
                    monster.y = newY;
                }
            } else {
                // Random movement occasionally
                if (Math.random() < 0.3) {
                    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    const randomDir = directions[Math.floor(Math.random() * directions.length)];
                    
                    const newX = monster.x + randomDir[0];
                    const newY = monster.y + randomDir[1];
                    
                    // Check if movement is valid
                    if (newX >= 0 && newX < MAP_WIDTH && newY >= 0 && newY < MAP_HEIGHT &&
                        gameState.map[newY][newX] !== TILES.WALL && 
                        !gameState.monsters.some(m => m !== monster && m.x === newX && m.y === newY) &&
                        !(newX === gameState.player.x && newY === gameState.player.y) &&
                        gameState.map[newY][newX] !== TILES.CHEST &&
                        gameState.map[newY][newX] !== TILES.EXIT) {
                        // Move monster
                        monster.x = newX;
                        monster.y = newY;
                    }
                }
            }
        }
        
        // Attack player if adjacent
        if (Math.abs(gameState.player.x - monster.x) <= 1 && Math.abs(gameState.player.y - monster.y) <= 1) {
            monsterAttack(monster);
        }
    });
}

// Checks if there's a clear line of sight between two points
function hasLineOfSight(x1, y1, x2, y2) {
    // Bresenham's line algorithm to check line of sight
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    
    let x = x1;
    let y = y1;
    
    while (true) {
        // If we reached the destination, there's a clear line
        if (x === x2 && y === y2) return true;
        
        // If we hit a wall, line of sight is blocked
        if (gameState.map[y][x] === TILES.WALL) return false;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x += sx;
        }
        if (e2 < dx) {
            err += dx;
            y += sy;
        }
    }
}