// constants.js - Game constants and configuration

// Game settings
const GAME_CONTAINER_WIDTH = 1200;
const GAME_CONTAINER_HEIGHT = 800;

// Map settings
const MAP_WIDTH = 80;
const MAP_HEIGHT = 25;
const TILE_SIZE = 16;

// Game tiles
const TILES = {
    WALL: '#',
    FLOOR: '.',
    EXIT: '>',
    CHEST: '$',
    SHOP: 'S'
};

// Tile types
const TILE_EMPTY = 0;
const TILE_WALL = 1;
const TILE_FLOOR = 2;
const TILE_EXIT = 3;
const TILE_CHEST = 4;
const TILE_SHOP = 5;

// Monster types by level
const MONSTER_TYPES = {
    1: [
        { id: 'goblin', name: 'Goblin', health: 30, attack: 5, exp: 20, gold: 10, color: 'green' },
        { id: 'rat', name: 'Giant Rat', health: 20, attack: 3, exp: 15, gold: 5, color: 'brown' },
        { id: 'spider', name: 'Giant Spider', health: 25, attack: 4, exp: 18, gold: 8, color: 'purple' }
    ],
    2: [
        { id: 'orc', name: 'Orc', health: 50, attack: 8, exp: 30, gold: 15, color: 'darkgreen' },
        { id: 'skeleton', name: 'Skeleton', health: 40, attack: 6, exp: 25, gold: 12, color: 'white' },
        { id: 'wolf', name: 'Dire Wolf', health: 45, attack: 7, exp: 28, gold: 14, color: 'gray' }
    ],
    3: [
        { id: 'troll', name: 'Troll', health: 80, attack: 12, exp: 50, gold: 25, color: 'brown' },
        { id: 'ghoul', name: 'Ghoul', health: 70, attack: 10, exp: 45, gold: 20, color: 'purple' },
        { id: 'ogre', name: 'Ogre', health: 90, attack: 14, exp: 55, gold: 30, color: 'red' }
    ],
    4: [
        { id: 'drake', name: 'Drake', health: 120, attack: 18, exp: 80, gold: 40, color: 'red' },
        { id: 'wraith', name: 'Wraith', health: 100, attack: 16, exp: 70, gold: 35, color: 'blue' },
        { id: 'golem', name: 'Stone Golem', health: 150, attack: 20, exp: 90, gold: 45, color: 'gray' }
    ],
    5: [
        { id: 'demon', name: 'Demon', health: 200, attack: 25, exp: 120, gold: 60, color: 'red' },
        { id: 'dragon', name: 'Young Dragon', health: 250, attack: 30, exp: 150, gold: 80, color: 'gold' },
        { id: 'lich', name: 'Lich', health: 180, attack: 28, exp: 130, gold: 70, color: 'purple' }
    ]
};

// Shop items
const SHOP_ITEMS = [
    { id: 'health_potion', name: 'Health Potion', cost: 20, description: 'Restore 30 HP', effect: 'restore_health', amount: 30 },
    { id: 'attack_boost', name: 'Attack Boost', cost: 50, description: '+5 Attack Power', effect: 'boost_attack', amount: 5 },
    { id: 'max_health', name: 'Health Up', cost: 75, description: '+20 Max Health', effect: 'increase_max_health', amount: 20 },
    { id: 'crit_chance', name: 'Critical Eye', cost: 100, description: '+5% Critical Hit Chance', effect: 'boost_crit', amount: 0.05 },
    { id: 'double_attack', name: 'Quick Strike', cost: 150, description: '+10% Double Attack Chance', effect: 'boost_double_attack', amount: 0.1 },
    { id: 'health_regen', name: 'Regeneration', cost: 200, description: '+2% Health Regen per Turn', effect: 'boost_regen', amount: 0.02 }
];

// Experience required for each level
const LEVEL_EXP = {
    1: 100,
    2: 250,
    3: 500,
    4: 1000,
    5: 2000,
    6: 3500,
    7: 5500,
    8: 8000,
    9: 12000,
    10: 18000
};

// Potion types
const POTION_TYPES = [
    // Basic potions (Level 1-2)
    { 
        id: 'minor_health_potion', 
        name: 'Minor Health Potion', 
        description: 'Restores 20% of max health', 
        effect: 'restore_health', 
        amount: 0.2, 
        color: '#ff6666',
        minLevel: 1,
        maxLevel: 5,
        dropChance: 0.4 // 40% chance
    },
    { 
        id: 'minor_exp_potion', 
        name: 'Minor Experience Potion', 
        description: 'Grants 15% of level-up exp', 
        effect: 'restore_exp', 
        amount: 0.15, 
        color: '#66ccff',
        minLevel: 1,
        maxLevel: 5,
        dropChance: 0.3 // 30% chance
    },
    
    // Medium potions (Level 3-4)
    { 
        id: 'health_potion', 
        name: 'Health Potion', 
        description: 'Restores 40% of max health', 
        effect: 'restore_health', 
        amount: 0.4, 
        color: '#ff3333',
        minLevel: 2,
        maxLevel: 10,
        dropChance: 0.3 // 30% chance
    },
    { 
        id: 'exp_potion', 
        name: 'Experience Potion', 
        description: 'Grants 25% of level-up exp', 
        effect: 'restore_exp', 
        amount: 0.25, 
        color: '#3399ff',
        minLevel: 2,
        maxLevel: 10,
        dropChance: 0.25 // 25% chance
    },
    { 
        id: 'strength_potion', 
        name: 'Strength Potion', 
        description: '+30% attack for 5 turns', 
        effect: 'temp_attack', 
        amount: 0.3,
        duration: 5, 
        color: '#ff9933',
        minLevel: 3,
        maxLevel: 10,
        dropChance: 0.2 // 20% chance
    },
    
    // Strong potions (Level 5+)
    { 
        id: 'greater_health_potion', 
        name: 'Greater Health Potion', 
        description: 'Restores 60% of max health', 
        effect: 'restore_health', 
        amount: 0.6, 
        color: '#ff0000',
        minLevel: 4,
        maxLevel: 10,
        dropChance: 0.2 // 20% chance
    },
    { 
        id: 'greater_exp_potion', 
        name: 'Greater Experience Potion', 
        description: 'Grants 40% of level-up exp', 
        effect: 'restore_exp', 
        amount: 0.4, 
        color: '#0066cc',
        minLevel: 4,
        maxLevel: 10,
        dropChance: 0.15 // 15% chance
    },
    { 
        id: 'protection_potion', 
        name: 'Protection Potion', 
        description: '-40% damage taken for 5 turns', 
        effect: 'temp_protection', 
        amount: 0.4,
        duration: 5, 
        color: '#9966ff',
        minLevel: 5,
        maxLevel: 10,
        dropChance: 0.15 // 15% chance
    }
];