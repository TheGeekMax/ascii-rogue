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
        experienceToLevel: 50,
        attackPower: 10,
        gold: 0,
        critChance: 0,       // Chance to do critical damage (x2)
        healthRegen: 0,      // Health regenerated per turn as % of max health
        goldBonus: 0,        // Extra gold from chests
        expBonus: 0,         // Extra experience from kills
        damageReduction: 0,  // Reduce damage taken
        doubleAttackChance: 0, // Chance to attack twice
        potions: []          // Potion inventory
    },
    monsters: [],
    map: [],
    messages: []
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
const potionList = document.getElementById('potion-list');

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
    gameState.player.potions = [];
    
    // Generate first level
    generateLevel();
    
    // Update UI
    updateStats();
    updateMonsterList();
    updatePotionList();
    addMessage('Game started! Explore the dungeon and defeat all monsters to find the exit.');
    
    // Start game loop
    drawGame();
}

// Game over
function gameOver() {
    gameState.running = false;
    addMessage('Game Over! You have been defeated.');
    startButton.textContent = 'Play Again';
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
        
        // Potion use (keys 1-5)
        if (e.key >= "1" && e.key <= "5") {
            const potionIndex = parseInt(e.key) - 1;
            usePotion(potionIndex);
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
    
    // Add click event listeners for potions
    document.addEventListener('click', (e) => {
        if (!gameState.running) return;
        
        // Check if a potion was clicked
        if (e.target.closest('.potion-item')) {
            const potionElement = e.target.closest('.potion-item');
            const potionIndex = parseInt(potionElement.dataset.index);
            usePotion(potionIndex);
        }
    });
});

// Use potion at given index
function usePotion(index) {
    if (index < 0 || index >= gameState.player.potions.length) return;
    
    const potion = gameState.player.potions[index];
    const result = potion.effect(gameState.player);
    
    addMessage(`Used ${potion.name}! ${result}`);
    
    // Remove used potion
    gameState.player.potions.splice(index, 1);
    
    // Update UI
    updatePotionList();
    updateStats();
    checkLevelUp();
}

// Initial message
addMessage('Welcome to ASCII Roguelike Adventure! Press Start to begin.');