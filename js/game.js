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
    CHEST: 'C',
    EXIT: '>'
};

// Monster types
const MONSTER_TYPES = [
    { type: 'goblin', char: TILES.GOBLIN, health: 15, maxHealth: 15, attack: 3, expValue: 10, color: '#8f8' },
    { type: 'orc', char: TILES.ORC, health: 25, maxHealth: 25, attack: 5, expValue: 20, color: '#f88' },
    { type: 'skeleton', char: TILES.SKELETON, health: 20, maxHealth: 20, attack: 4, expValue: 15, color: '#fff' },
    { type: 'troll', char: TILES.TROLL, health: 40, maxHealth: 40, attack: 8, expValue: 30, color: '#88f' }
];

// Game state
const gameState = {
    running: false,
    currentFloor: 1,
    allMonstersDefeated: false,
    exitRevealed: false,
    player: {
        x: 0,
        y: 0,
        health: 100,
        maxHealth: 100,
        level: 1,
        experience: 0,
        experienceToLevel: 50,
        attackPower: 10
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
    
    // Reset player stats
    gameState.player.health = 100;
    gameState.player.maxHealth = 100;
    gameState.player.level = 1;
    gameState.player.experience = 0;
    gameState.player.experienceToLevel = 50;
    gameState.player.attackPower = 10;
    
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
    
    // Initialize map with walls
    gameState.map = Array(MAP_HEIGHT).fill().map(() => Array(MAP_WIDTH).fill(TILES.WALL));
    
    // Generate rooms
    const numberOfRooms = 5 + Math.floor(Math.random() * 5) + Math.floor(gameState.currentFloor / 3);
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
    
    // Add monsters based on current floor
    const monsterCount = 3 + Math.floor(gameState.currentFloor * 1.5);
    addMonsters(monsterCount, rooms.slice(1)); // Skip first room
    
    // Add chests based on floor level
    const chestCount = 1 + Math.floor(gameState.currentFloor / 2);
    addChests(chestCount, rooms);
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
            const availableTypes = MONSTER_TYPES.filter(m => 
                (m.type === 'goblin') || 
                (m.type === 'skeleton' && gameState.currentFloor >= 2) ||
                (m.type === 'orc' && gameState.currentFloor >= 3) ||
                (m.type === 'troll' && gameState.currentFloor >= 5)
            );
            
            const monsterTemplate = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            
            // Scale monster health and attack by floor level
            const scalingFactor = 1 + (gameState.currentFloor - 1) * 0.2;
            const maxHealth = Math.ceil(monsterTemplate.maxHealth * scalingFactor);
            
            // Add the monster
            gameState.monsters.push({
                x,
                y,
                type: monsterTemplate.type,
                char: monsterTemplate.char,
                health: maxHealth,
                maxHealth: maxHealth,
                attack: Math.ceil(monsterTemplate.attack * scalingFactor),
                expValue: Math.ceil(monsterTemplate.expValue * scalingFactor),
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
           gameState.map[y][x] === TILES.EXIT;
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
                // We'll apply monster colors through CSS, but could use inline style too
            }
            
            // Check for player
            if (x === gameState.player.x && y === gameState.player.y) {
                char = TILES.PLAYER;
            }
            
            // Add animations for chests and exit
            if (char === TILES.CHEST) {
                extraClasses = ' chest-animated';
            } else if (char === TILES.EXIT) {
                extraClasses = ' exit-animated';
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
            }
            
            // Add span with styling
            display += `<span${colorClass}${extraClasses ? ' class="' + extraClasses.trim() + '"' : ''}>${char}</span>`;
        }
        display += '\n';
    }
    
    // Update the game display
    gameDisplay.innerHTML = display;
}

// Update stat displays
function updateStats() {
    healthValue.textContent = gameState.player.health;
    levelValue.textContent = gameState.player.level;
    expValue.textContent = `${gameState.player.experience}/${gameState.player.experienceToLevel}`;
    floorValue.textContent = gameState.currentFloor;
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
    
    // Move player
    gameState.player.x = newX;
    gameState.player.y = newY;
    
    // Move monsters after player moves
    moveMonsters();
    
    // Update display
    drawGame();
}

// Player attacks monster
function attackMonster(monsterIndex) {
    const monster = gameState.monsters[monsterIndex];
    
    // Calculate damage with some randomness
    const damage = Math.max(1, Math.floor(gameState.player.attackPower * (0.8 + Math.random() * 0.4)));
    
    // Apply damage
    monster.health -= damage;
    
    // Show message
    addMessage(`You hit the ${monster.type} for ${damage} damage!`);
    
    // Check if monster is defeated
    if (monster.health <= 0) {
        // Give experience
        gameState.player.experience += monster.expValue;
        addMessage(`You defeated the ${monster.type}! +${monster.expValue} XP`);
        
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
    const damage = Math.max(1, Math.floor(monster.attack * (0.8 + Math.random() * 0.4)));
    
    // Apply damage
    gameState.player.health -= damage;
    
    // Show message
    addMessage(`${monster.type} hits you for ${damage} damage!`);
    
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
    // Calculate XP based on floor level
    const xpGain = 10 + Math.floor(Math.random() * 10) * gameState.currentFloor;
    
    // Give experience
    gameState.player.experience += xpGain;
    addMessage(`You found a treasure chest! +${xpGain} XP`);
    
    // Check for level up
    checkLevelUp();
    
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
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
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