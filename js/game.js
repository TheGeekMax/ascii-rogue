// ASCII Roguelike Game JavaScript

// Game constants
const MAP_WIDTH = 60;
const MAP_HEIGHT = 25;

// ASCII characters
const TILES = {
    EMPTY: ' ',
    WALL: '#',
    FLOOR: '.',
    PLAYER: '@',
    GOBLIN: 'g',
    ORC: 'o',
    TROLL: 'T',
    SKELETON: 's',
    DEMON: 'D',
    DRAGON: 'Δ',
    WRAITH: 'W',
    RAT: 'r',
    CHEST: 'C',
    EXIT: '>',
    SHOP: '$'
};

// Monster types - expanded selection with more difficult monsters
const MONSTER_TYPES = [
    { type: 'rat', char: TILES.RAT, health: 10, maxHealth: 10, attack: 2, expValue: 5, goldValue: 1, color: '#bb9', minFloor: 1 },
    { type: 'goblin', char: TILES.GOBLIN, health: 15, maxHealth: 15, attack: 3, expValue: 10, goldValue: 3, color: '#8f8', minFloor: 1 },
    { type: 'skeleton', char: TILES.SKELETON, health: 20, maxHealth: 20, attack: 4, expValue: 15, goldValue: 5, color: '#fff', minFloor: 2 },
    { type: 'orc', char: TILES.ORC, health: 25, maxHealth: 25, attack: 5, expValue: 20, goldValue: 8, color: '#f88', minFloor: 3 },
    { type: 'troll', char: TILES.TROLL, health: 40, maxHealth: 40, attack: 8, expValue: 30, goldValue: 15, color: '#88f', minFloor: 5 },
    { type: 'wraith', char: TILES.WRAITH, health: 35, maxHealth: 35, attack: 12, expValue: 40, goldValue: 20, color: '#c8f', minFloor: 7 },
    { type: 'demon', char: TILES.DEMON, health: 60, maxHealth: 60, attack: 15, expValue: 50, goldValue: 30, color: '#f55', minFloor: 9 },
    { type: 'dragon', char: TILES.DRAGON, health: 100, maxHealth: 100, attack: 20, expValue: 100, goldValue: 50, color: '#fa0', minFloor: 12 }
];

// Shop items
const SHOP_ITEMS = [
    { name: 'Health Boost', cost: 25, description: 'Increase max health by 15', effect: (player) => { player.maxHealth += 15; player.health += 15; } },
    { name: 'Strength Boost', cost: 30, description: 'Increase attack power by 5', effect: (player) => { player.attackPower += 5; } },
    { name: 'Lucky Charm', cost: 40, description: 'Increase critical hit chance by 10%', effect: (player) => { player.critChance = (player.critChance || 0) + 0.1; } },
    { name: 'Vitality Stone', cost: 50, description: 'Gain 10% health regeneration per turn', effect: (player) => { player.healthRegen = (player.healthRegen || 0) + 0.1; } },
    { name: 'Gold Magnet', cost: 35, description: 'Increase gold from chests by 20%', effect: (player) => { player.goldBonus = (player.goldBonus || 0) + 0.2; } },
    { name: 'Experience Tome', cost: 45, description: 'Gain 15% more experience', effect: (player) => { player.expBonus = (player.expBonus || 0) + 0.15; } },
    { name: 'Defensive Amulet', cost: 40, description: 'Reduce damage taken by 10%', effect: (player) => { player.damageReduction = (player.damageReduction || 0) + 0.1; } },
    { name: 'Fury Potion', cost: 60, description: 'Gain 15% chance for double attacks', effect: (player) => { player.doubleAttackChance = (player.doubleAttackChance || 0) + 0.15; } }
];

// Game state
const gameState = {
    running: false,
    currentFloor: 1,
    allMonstersDefeated: false,
    exitRevealed: false,
    inShop: false,
    shopItems: [],
    player: {
        x: 0,
        y: 0,
        health: 100,
        maxHealth: 100,
        level: 1,
        experience: 0,
        experienceToLevel: 50,
        attackPower: 10,
        gold: 0,
        critChance: 0,       // Chance to do critical damage (x2)
        healthRegen: 0,      // Health regenerated per turn as % of max health
        goldBonus: 0,        // Extra gold from chests
        expBonus: 0,         // Extra experience from kills
        damageReduction: 0,  // Reduce damage taken
        doubleAttackChance: 0 // Chance to attack twice
    },
    monsters: [],
    map: [],
    messages: [],
    visibleMap: [] // For fog of war (if implemented)
};

// DOM Elements
const gameDisplay = document.getElementById('game-display');
const startButton = document.getElementById('start-button');
const healthValue = document.getElementById('health-value');
const levelValue = document.getElementById('level-value');
const expValue = document.getElementById('exp-value');
const floorValue = document.getElementById('floor-value');
const messageText = document.getElementById('message-text');
const monsterList = document.getElementById('monster-list');

// Initialize the game
function initGame() {
    gameState.running = true;
    gameState.currentFloor = 1;
    gameState.allMonstersDefeated = false;
    gameState.exitRevealed = false;
    gameState.inShop = false;
    
    // Reset player stats
    gameState.player.health = 100;
    gameState.player.maxHealth = 100;
    gameState.player.level = 1;
    gameState.player.experience = 0;
    gameState.player.experienceToLevel = 50;
    gameState.player.attackPower = 10;
    gameState.player.gold = 0;
    gameState.player.critChance = 0;
    gameState.player.healthRegen = 0;
    gameState.player.goldBonus = 0;
    gameState.player.expBonus = 0;
    gameState.player.damageReduction = 0;
    gameState.player.doubleAttackChance = 0;
    
    // Generate first level
    generateLevel();
    
    // Update UI
    updateStats();
    updateMonsterList();
    addMessage('Game started! Explore the dungeon and defeat all monsters to find the exit.');
    
    // Start game loop
    drawGame();
}

// Generate a dungeon level
function generateLevel() {
    // Reset monsters
    gameState.monsters = [];
    gameState.allMonstersDefeated = false;
    gameState.exitRevealed = false;
    gameState.inShop = false;
    
    // Initialize map with walls
    gameState.map = Array(MAP_HEIGHT).fill().map(() => Array(MAP_WIDTH).fill(TILES.WALL));
    
    // Generate rooms
    const numberOfRooms = 5 + Math.floor(Math.random() * 5) + Math.floor(gameState.currentFloor / 2);
    const rooms = [];
    
    for (let i = 0; i < numberOfRooms; i++) {
        const room = generateRoom();
        if (room) {
            rooms.push(room);
            carveRoom(room);
        }
    }
    
    // Connect rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
        connectRooms(rooms[i], rooms[i + 1]);
    }
    
    // Place player in first room
    if (rooms.length > 0) {
        const startRoom = rooms[0];
        gameState.player.x = Math.floor(startRoom.x + startRoom.width / 2);
        gameState.player.y = Math.floor(startRoom.y + startRoom.height / 2);
        
        // Make sure player position is a floor
        gameState.map[gameState.player.y][gameState.player.x] = TILES.FLOOR;
    }
    
    // Add shop on every floor starting from floor 3
    if (gameState.currentFloor >= 3 && rooms.length > 1) {
        // Add a shop in the second room
        const shopRoom = rooms[1];
        const shopX = Math.floor(shopRoom.x + shopRoom.width / 2);
        const shopY = Math.floor(shopRoom.y + shopRoom.height / 2);
        gameState.map[shopY][shopX] = TILES.SHOP;
        
        // Generate shop inventory
        generateShopItems();
        
        addMessage("This floor has a shop ($). Visit it to purchase upgrades!");
    }
    
    // Add monsters based on current floor and player level
    const monsterCount = 5 + Math.floor(gameState.currentFloor * 1.5) + Math.floor(gameState.player.level * 0.5);
    addMonsters(monsterCount, rooms.slice(1)); // Skip first room
    
    // Add chests based on floor level and luck
    const chestCount = 2 + Math.floor(gameState.currentFloor / 2) + Math.floor(Math.random() * 3);
    addChests(chestCount, rooms);
}

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

// Generate a single room
function generateRoom() {
    const minRoomSize = 4;
    const maxRoomSize = 10;
    
    // Try multiple times to place a non-overlapping room
    for (let attempts = 0; attempts < 10; attempts++) {
        const width = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize));
        const height = minRoomSize + Math.floor(Math.random() * (maxRoomSize - minRoomSize));
        
        const x = 1 + Math.floor(Math.random() * (MAP_WIDTH - width - 2));
        const y = 1 + Math.floor(Math.random() * (MAP_HEIGHT - height - 2));
        
        // Check if room overlaps with existing rooms
        let overlaps = false;
        
        for (let yy = y - 1; yy < y + height + 1; yy++) {
            for (let xx = x - 1; xx < x + width + 1; xx++) {
                if (yy < 0 || yy >= MAP_HEIGHT || xx < 0 || xx >= MAP_WIDTH) continue;
                
                if (gameState.map[yy][xx] === TILES.FLOOR) {
                    overlaps = true;
                    break;
                }
            }
            if (overlaps) break;
        }
        
        if (!overlaps) {
            return { x, y, width, height };
        }
    }
    
    return null; // Failed to place room
}

// Carve a room into the map
function carveRoom(room) {
    for (let y = room.y; y < room.y + room.height; y++) {
        for (let x = room.x; x < room.x + room.width; x++) {
            gameState.map[y][x] = TILES.FLOOR;
        }
    }
}

// Connect two rooms with a corridor
function connectRooms(roomA, roomB) {
    // Get centers of rooms
    const centerAX = Math.floor(roomA.x + roomA.width / 2);
    const centerAY = Math.floor(roomA.y + roomA.height / 2);
    const centerBX = Math.floor(roomB.x + roomB.width / 2);
    const centerBY = Math.floor(roomB.y + roomB.height / 2);
    
    // Randomly choose horizontal-first or vertical-first
    if (Math.random() < 0.5) {
        // Horizontal first, then vertical
        createHorizontalCorridor(centerAX, centerBX, centerAY);
        createVerticalCorridor(centerAY, centerBY, centerBX);
    } else {
        // Vertical first, then horizontal
        createVerticalCorridor(centerAY, centerBY, centerAX);
        createHorizontalCorridor(centerAX, centerBX, centerBY);
    }
}

// Create a horizontal corridor
function createHorizontalCorridor(x1, x2, y) {
    const start = Math.min(x1, x2);
    const end = Math.max(x1, x2);
    
    for (let x = start; x <= end; x++) {
        gameState.map[y][x] = TILES.FLOOR;
    }
}

// Create a vertical corridor
function createVerticalCorridor(y1, y2, x) {
    const start = Math.min(y1, y2);
    const end = Math.max(y1, y2);
    
    for (let y = start; y <= end; y++) {
        gameState.map[y][x] = TILES.FLOOR;
    }
}

// Add monsters to the level
function addMonsters(count, rooms) {
    if (rooms.length === 0) return;
    
    for (let i = 0; i < count; i++) {
        // Pick a random room
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        
        // Find a valid position in the room
        let x, y;
        let foundPosition = false;
        let attempts = 0;
        
        while (!foundPosition && attempts < 20) {
            x = room.x + Math.floor(Math.random() * room.width);
            y = room.y + Math.floor(Math.random() * room.height);
            
            // Check if position is on floor and not occupied
            if (gameState.map[y][x] === TILES.FLOOR && 
                !isPositionOccupied(x, y) &&
                !(x === gameState.player.x && y === gameState.player.y)) {
                foundPosition = true;
            }
            attempts++;
        }
        
        if (foundPosition) {
            // Choose monster type based on floor level
            const availableTypes = MONSTER_TYPES.filter(m => m.minFloor <= gameState.currentFloor);
            
            if (availableTypes.length === 0) continue;
            
            const monsterTemplate = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            
            // Scale monster health and attack by floor level AND player level
            const floorScaling = 1 + (gameState.currentFloor - 1) * 0.2;
            const playerLevelScaling = 1 + (gameState.player.level - 1) * 0.15;
            const totalScaling = floorScaling * playerLevelScaling;
            
            const maxHealth = Math.ceil(monsterTemplate.maxHealth * totalScaling);
            const attack = Math.ceil(monsterTemplate.attack * totalScaling);
            
            // Add the monster
            gameState.monsters.push({
                x,
                y,
                type: monsterTemplate.type,
                char: monsterTemplate.char,
                health: maxHealth,
                maxHealth: maxHealth,
                attack: attack,
                expValue: Math.ceil(monsterTemplate.expValue * floorScaling),
                goldValue: Math.ceil(monsterTemplate.goldValue * floorScaling),
                color: monsterTemplate.color,
                id: `monster-${Date.now()}-${i}` // Unique ID for UI updates
            });
        }
    }
}

// Add chests to the level
function addChests(count, rooms) {
    if (rooms.length === 0) return;
    
    for (let i = 0; i < count; i++) {
        // Pick a random room
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        
        // Find a valid position for the chest
        let x, y;
        let foundPosition = false;
        let attempts = 0;
        
        while (!foundPosition && attempts < 20) {
            x = room.x + Math.floor(Math.random() * room.width);
            y = room.y + Math.floor(Math.random() * room.height);
            
            // Check if position is on floor and not occupied
            if (gameState.map[y][x] === TILES.FLOOR && 
                !isPositionOccupied(x, y) &&
                !(x === gameState.player.x && y === gameState.player.y)) {
                foundPosition = true;
            }
            attempts++;
        }
        
        if (foundPosition) {
            // Place chest on the map
            gameState.map[y][x] = TILES.CHEST;
        }
    }
}

// Check if a position is occupied by a monster
function isPositionOccupied(x, y) {
    return gameState.monsters.some(m => m.x === x && m.y === y) || 
           gameState.map[y][x] === TILES.CHEST || 
           gameState.map[y][x] === TILES.EXIT ||
           gameState.map[y][x] === TILES.SHOP;
}

// Reveal the exit after all monsters are defeated
function revealExit() {
    if (gameState.exitRevealed) return;
    
    // Find a location for the exit that's far from the player
    let bestX = -1, bestY = -1;
    let maxDistance = -1;
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (gameState.map[y][x] === TILES.FLOOR) {
                const distance = Math.abs(x - gameState.player.x) + Math.abs(y - gameState.player.y);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    bestX = x;
                    bestY = y;
                }
            }
        }
    }
    
    if (bestX !== -1 && bestY !== -1) {
        gameState.map[bestY][bestX] = TILES.EXIT;
        gameState.exitRevealed = true;
        addMessage('An exit (>) has appeared! Find it to proceed to the next floor.');
    }
}

// Draw the game
function drawGame() {
    if (!gameState.running) return;
    
    // If in shop mode, draw the shop instead
    if (gameState.inShop) {
        drawShop();
        return;
    }
    
    let display = '';
    
    // Draw each cell
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Default to map tile
            let char = gameState.map[y][x];
            let extraClasses = '';
            
            // Check for monsters
            const monster = gameState.monsters.find(m => m.x === x && m.y === y);
            if (monster) {
                char = monster.char;
            }
            
            // Check for player
            if (x === gameState.player.x && y === gameState.player.y) {
                char = TILES.PLAYER;
            }
            
            // Add animations for chests, shop, and exit
            if (char === TILES.CHEST) {
                extraClasses = ' chest-animated';
            } else if (char === TILES.EXIT) {
                extraClasses = ' exit-animated';
            } else if (char === TILES.SHOP) {
                extraClasses = ' shop-animated';
            }
            
            // Apply color based on tile type
            let colorClass = '';
            if (monster) {
                colorClass = ` style="color:${monster.color}"`;
            } else if (char === TILES.PLAYER) {
                colorClass = ' style="color:#ff9900"';
            } else if (char === TILES.WALL) {
                colorClass = ' style="color:#777"';
            } else if (char === TILES.FLOOR) {
                colorClass = ' style="color:#555"';
            } else if (char === TILES.CHEST) {
                colorClass = ' style="color:#ffcc00"';
            } else if (char === TILES.EXIT) {
                colorClass = ' style="color:#00ff00"';
            } else if (char === TILES.SHOP) {
                colorClass = ' style="color:#ff55ff"';
            }
            
            // Add span with styling
            display += `<span${colorClass}${extraClasses ? ' class="' + extraClasses.trim() + '"' : ''}>${char}</span>`;
        }
        display += '\n';
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
    // Calculate damage
    const baseDamage = Math.max(1, Math.floor(monster.attack * (0.8 + Math.random() * 0.4)));
    
    // Apply damage reduction if player has it
    const reducedDamage = Math.max(1, Math.floor(baseDamage * (1 - gameState.player.damageReduction)));
    
    // Apply damage
    gameState.player.health -= reducedDamage;
    
    // Show message
    addMessage(`${monster.type} hits you for ${reducedDamage} damage!`);
    
    // Check if player is defeated
    if (gameState.player.health <= 0) {
        gameOver();
    }
    
    // Update stats
    updateStats();
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

// Move monsters randomly
function moveMonsters() {
    gameState.monsters.forEach(monster => {
        // 75% chance to move
        if (Math.random() > 0.75) return;
        
        // Try to move toward player with some randomness
        let dx = Math.sign(gameState.player.x - monster.x);
        let dy = Math.sign(gameState.player.y - monster.y);
        
        // Add some randomness - sometimes monsters move erratically
        if (Math.random() < 0.3) {
            dx = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            dy = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        }
        
        // Try to move in that direction if possible
        const newX = monster.x + dx;
        const newY = monster.y + dy;
        
        // Check if move is valid
        if (newX >= 0 && newX < MAP_WIDTH && newY >= 0 && newY < MAP_HEIGHT && 
            gameState.map[newY][newX] === TILES.FLOOR && 
            !isPositionOccupied(newX, newY) && 
            !(newX === gameState.player.x && newY === gameState.player.y)) {
            
            monster.x = newX;
            monster.y = newY;
        }
    });
}

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

// Game over
function gameOver() {
    gameState.running = false;
    addMessage('Game Over! You have been defeated.');
    startButton.textContent = 'Play Again';
}

// Add a message to the message log
function addMessage(text) {
    messageText.textContent = text;
    gameState.messages.unshift(text);
    if (gameState.messages.length > 5) {
        gameState.messages.pop();
    }
}

// Event listeners
startButton.addEventListener('click', () => {
    initGame();
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (!gameState.running) return;
    
    // Shop controls
    if (gameState.inShop) {
        switch (e.key) {
            case 'Escape':
                exitShop();
                break;
            case '1':
                buyItem(0);
                break;
            case '2':
                buyItem(1);
                break;
            case '3':
                buyItem(2);
                break;
            case '4':
                buyItem(3);
                break;
        }
        return;
    }
    
    // Movement and regular controls
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'z':
        case 'Z':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'q':
        case 'Q':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            movePlayer(1, 0);
            break;
        case ' ':
            // Wait a turn (monsters still move)
            moveMonsters();
            drawGame();
            break;
    }
});

// Initial message
addMessage('Welcome to ASCII Roguelike Adventure! Press Start to begin.');