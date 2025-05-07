// game.js - Core game init and global functions

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
        experienceToLevel: 100,
        attackPower: 10,
        gold: 0,
        critChance: 0.05,       // Base 5% chance
        healthRegen: 0,         // Health regenerated per turn as % of max health
        goldBonus: 0,           // Extra gold from chests
        expBonus: 0,            // Extra experience from kills
        damageReduction: 0,     // Reduce damage taken
        doubleAttackChance: 0,  // Chance to attack twice
        potions: [],            // Potions inventory
        maxPotions: 5,          // Maximum potions that can be carried
        temporaryEffects: {}    // Temporary effects from potions
    },
    monsters: [],
    map: [],
    messages: [],
    selectedPotion: -1 // Index of the selected potion in the inventory
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
    gameState.selectedPotion = -1;
    
    // Reset player stats
    gameState.player.x = 40;
    gameState.player.y = 12;
    gameState.player.health = 100;
    gameState.player.maxHealth = 100;
    gameState.player.level = 1;
    gameState.player.experience = 0;
    gameState.player.experienceToLevel = 100;
    gameState.player.attackPower = 10;
    gameState.player.gold = 0;
    gameState.player.critChance = 0.05;
    gameState.player.healthRegen = 0;
    gameState.player.goldBonus = 0;
    gameState.player.expBonus = 0;
    gameState.player.damageReduction = 0;
    gameState.player.doubleAttackChance = 0;
    gameState.player.potions = []; // Empty potions inventory
    gameState.player.temporaryEffects = {}; // Reset temporary effects
    
    // Reset game state
    gameState.messages = [];
    gameState.currentFloor = 1;
    gameState.allMonstersDefeated = false;

    // Generate first level
    generateLevel();
    
    // Update UI
    updateStats();
    updateMonsterList();
    setupPotionInventory();
    addMessage('Game started! Explore the dungeon and defeat all monsters to find the exit.');
    
    // Start game loop
    drawGame();
}

// Function to add a potion to the player's inventory
function addPotion(potionData) {
    // Check if inventory is full
    if (gameState.player.potions.length >= gameState.player.maxPotions) {
        addMessage("Your potion pocket is full!");
        return false;
    }
    
    // Add potion to inventory
    gameState.player.potions.push({
        id: potionData.id,
        name: potionData.name,
        description: potionData.description,
        effect: potionData.effect,
        amount: potionData.amount,
        color: potionData.color,
        duration: potionData.duration || 0
    });
    
    // Update the potion display
    updatePotionDisplay();
    return true;
}

// Use a potion from the inventory
function usePotion(index) {
    if (index < 0 || index >= gameState.player.potions.length) return;
    
    // Get the potion
    const potion = gameState.player.potions[index];
    let used = false;
    
    // Apply potion effect
    switch (potion.effect) {
        case 'restore_health':
            const healAmount = Math.floor(gameState.player.maxHealth * potion.amount);
            gameState.player.health = Math.min(gameState.player.health + healAmount, gameState.player.maxHealth);
            addMessage(`You drink ${potion.name} and heal for ${healAmount} health!`);
            used = true;
            break;
            
        case 'restore_exp':
            const expAmount = Math.floor(gameState.player.experienceToLevel * potion.amount);
            gameState.player.experience += expAmount;
            addMessage(`You drink ${potion.name} and gain ${expAmount} experience!`);
            checkLevelUp();
            used = true;
            break;
            
        case 'temp_attack':
            // Apply temporary attack boost
            gameState.player.temporaryEffects.attackBoost = {
                amount: potion.amount,
                turnsLeft: potion.duration
            };
            addMessage(`You drink ${potion.name} and feel stronger for ${potion.duration} turns!`);
            used = true;
            break;
            
        case 'temp_protection':
            // Apply temporary protection
            gameState.player.temporaryEffects.damageReduction = {
                amount: potion.amount,
                turnsLeft: potion.duration
            };
            addMessage(`You drink ${potion.name} and feel protected for ${potion.duration} turns!`);
            used = true;
            break;
    }
    
    // If potion was used successfully, remove it from inventory
    if (used) {
        gameState.player.potions.splice(index, 1);
        updatePotionDisplay();
        updateStats();
    }
}

// Process temporary potion effects each turn
function processPotionEffects() {
    const effects = gameState.player.temporaryEffects;
    
    // Process each active effect
    for (const effectType in effects) {
        if (effects.hasOwnProperty(effectType)) {
            const effect = effects[effectType];
            
            // Decrease turns left
            effect.turnsLeft--;
            
            // Remove effect if turns left is zero
            if (effect.turnsLeft <= 0) {
                addMessage(`Your ${effectType} potion effect has worn off.`);
                delete effects[effectType];
            }
        }
    }
}

// Initialize the potion inventory display
function setupPotionInventory() {
    const gameContainer = document.getElementById('gameContainer');
    
    // Create potion pocket container if it doesn't exist
    let potionContainer = document.getElementById('potionPocket');
    if (!potionContainer) {
        potionContainer = document.createElement('div');
        potionContainer.id = 'potionPocket';
        potionContainer.className = 'potion-pocket';
        potionContainer.innerHTML = `<h3>Potion Pocket</h3><div id="potionSlots"></div>`;
        gameContainer.appendChild(potionContainer);
    }
    
    updatePotionDisplay();
}

// Update the potion display
function updatePotionDisplay() {
    const potionSlots = document.getElementById('potionSlots');
    potionSlots.innerHTML = '';
    
    // Add potion slots
    for (let i = 0; i < gameState.player.maxPotions; i++) {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'potion-slot';
        
        // If there's a potion in this slot
        if (i < gameState.player.potions.length) {
            const potion = gameState.player.potions[i];
            slotDiv.innerHTML = `
                <div class="potion" style="background-color: ${potion.color}"></div>
                <div class="potion-label">${i+1}: ${potion.name}</div>
                <div class="potion-tooltip">${potion.description}</div>
            `;
            slotDiv.addEventListener('click', () => usePotion(i));
        } else {
            slotDiv.innerHTML = `<div class="empty-slot">${i+1}</div>`;
        }
        
        potionSlots.appendChild(slotDiv);
    }
}

// Game over
function gameOver() {
    gameState.running = false;
    addMessage('Game Over! You have been defeated.');
    addMessage(`You reached floor ${gameState.currentFloor} and were level ${gameState.player.level}.`);
    startButton.textContent = 'Play Again';
    
    // Show game over screen
    const gameContainer = document.getElementById('gameContainer');
    const gameOverDiv = document.createElement('div');
    gameOverDiv.className = 'game-over';
    gameOverDiv.innerHTML = `
        <h2>Game Over!</h2>
        <p>You reached floor ${gameState.currentFloor}</p>
        <p>You were level ${gameState.player.level}</p>
        <button id="restartButton">Play Again</button>
    `;
    gameContainer.appendChild(gameOverDiv);
    
    // Set up restart button
    document.getElementById('restartButton').addEventListener('click', function() {
        gameContainer.removeChild(gameOverDiv);
        initGame();
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
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
        
        // Potion selection (number keys 1-5)
        if (e.key >= '1' && e.key <= '5') {
            const potionIndex = parseInt(e.key) - 1;
            if (potionIndex < gameState.player.potions.length) {
                usePotion(potionIndex);
            }
            return;
        }
        
        // Use selected potion with 'U' key
        if (e.key === 'u' || e.key === 'U') {
            if (gameState.selectedPotion >= 0) {
                usePotion(gameState.selectedPotion);
            } else {
                addMessage("No potion selected. Press a number key (1-5) to use a potion.");
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
});

// Initial message
addMessage('Welcome to ASCII Roguelike Adventure! Press Start to begin.');