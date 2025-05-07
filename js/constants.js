// constants.js - Game constants and configuration

// Map dimensions
const MAP_WIDTH = 60;
const MAP_HEIGHT = 25;

// ASCII characters for tiles
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

// Potion types
const POTIONS = [
    { id: 'health', name: 'Health Potion', color: '#ff5555', effect: (player) => {
        const healAmount = Math.floor(player.maxHealth * 0.3);
        player.health = Math.min(player.health + healAmount, player.maxHealth);
        return `Restored ${healAmount} health!`;
    }},
    { id: 'greater-health', name: 'Greater Health Potion', color: '#ff0000', effect: (player) => {
        const healAmount = Math.floor(player.maxHealth * 0.6);
        player.health = Math.min(player.health + healAmount, player.maxHealth);
        return `Restored ${healAmount} health!`;
    }},
    { id: 'experience', name: 'Experience Elixir', color: '#5555ff', effect: (player) => {
        const expGain = Math.floor(player.experienceToLevel * 0.2);
        player.experience += expGain;
        return `Gained ${expGain} experience!`;
    }},
    { id: 'strength', name: 'Strength Potion', color: '#ff9900', effect: (player) => {
        const temporaryBoost = Math.floor(player.attackPower * 0.5);
        player.temporaryAttackBoost = (player.temporaryAttackBoost || 0) + temporaryBoost;
        return `Attack power temporarily increased by ${temporaryBoost}!`;
    }},
    { id: 'fortitude', name: 'Potion of Fortitude', color: '#55ff55', effect: (player) => {
        const maxHealthBoost = Math.floor(player.maxHealth * 0.1);
        player.maxHealth += maxHealthBoost;
        player.health += maxHealthBoost;
        return `Maximum health increased by ${maxHealthBoost}!`;
    }}
];