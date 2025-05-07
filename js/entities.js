// entities.js - Monster types and shop items

// Monster types with their properties
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

// Shop items and their effects
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

// Potion types with their effects
const POTION_TYPES = [
    { 
        id: 'health',
        name: 'Health Potion', 
        description: 'Restores 30% of your max health',
        color: '#ff5555',
        rarity: 1, // Common
        effect: (player) => {
            const healAmount = Math.floor(player.maxHealth * 0.3);
            player.health = Math.min(player.health + healAmount, player.maxHealth);
            return `Restored ${healAmount} health!`;
        }
    },
    { 
        id: 'greater_health',
        name: 'Greater Health Potion', 
        description: 'Restores 60% of your max health',
        color: '#ff0000',
        rarity: 2, // Uncommon
        minFloor: 3,
        effect: (player) => {
            const healAmount = Math.floor(player.maxHealth * 0.6);
            player.health = Math.min(player.health + healAmount, player.maxHealth);
            return `Restored ${healAmount} health!`;
        }
    },
    { 
        id: 'experience',
        name: 'Experience Potion', 
        description: 'Grants 20% of required XP to next level',
        color: '#55aaff',
        rarity: 2, // Uncommon
        minFloor: 2,
        effect: (player) => {
            const xpAmount = Math.floor(player.experienceToLevel * 0.2);
            player.experience += xpAmount;
            return `Gained ${xpAmount} experience!`;
        }
    },
    { 
        id: 'strength',
        name: 'Strength Potion', 
        description: 'Temporarily increases attack power by 30% for this floor',
        color: '#ffaa00',
        rarity: 3, // Rare
        minFloor: 4,
        effect: (player) => {
            const bonusAmount = Math.floor(player.attackPower * 0.3);
            player.temporaryBonuses = player.temporaryBonuses || {};
            player.temporaryBonuses.attackPower = (player.temporaryBonuses.attackPower || 0) + bonusAmount;
            return `Attack power increased by ${bonusAmount}!`;
        }
    },
    { 
        id: 'regeneration',
        name: 'Regeneration Potion', 
        description: 'Regenerate 5% health after each action for this floor',
        color: '#55ff55',
        rarity: 3, // Rare
        minFloor: 5,
        effect: (player) => {
            player.temporaryBonuses = player.temporaryBonuses || {};
            player.temporaryBonuses.regeneration = (player.temporaryBonuses.regeneration || 0) + 5;
            return `Regeneration activated!`;
        }
    },
    { 
        id: 'fortune',
        name: 'Fortune Potion', 
        description: 'Increases gold and item find chance for this floor',
        color: '#ffff00',
        rarity: 3, // Rare
        minFloor: 4,
        effect: (player) => {
            player.temporaryBonuses = player.temporaryBonuses || {};
            player.temporaryBonuses.luckBonus = (player.temporaryBonuses.luckBonus || 0) + 50;
            return `Fortune favors you!`;
        }
    }
];