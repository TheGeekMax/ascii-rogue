// map.js - Map generation and room functions

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