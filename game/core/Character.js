import { LevelSystem } from './LevelSystem.js';

export class Character {
    constructor(baseHp, baseMp, baseDmg, levelUpConfig, raceData) {
        this.maxHp = baseHp;
        this.hp = baseHp;
        this.maxMp = baseMp;
        this.mp = baseMp;
        this.dmg = baseDmg;
        this.exp = 0;
        this.level = 1;
        this.expForLevel = 20;
        
        this.race = raceData.name;
        this.raceId = raceData.id;
        this.bonuses = raceData.bonuses || {};
        
        this.availableStatPoints = 0;
        this.spentStatPoints = 0;
        
        // Новая система прокачки
        this.levelSystem = new LevelSystem(levelUpConfig);
        this.updateExpForLevel();
    }

    // Обновление необходимого опыта для уровня
    updateExpForLevel() {
        this.expForLevel = this.levelSystem.calculateExpForLevel(this.level);
    }

    attack(target) {
        target.hp -= this.dmg;
        return this.dmg;
    }

    // Новая система получения опыта
    gainExp(amount) {
        const result = this.levelSystem.addExp(this.exp, this.level, amount);
        
        this.exp = result.newExp;
        this.level = result.newLevel;
        this.updateExpForLevel();
        
        // Применяем бонусы за уровни
        if (result.levelsGained > 0) {
            const gains = this.levelSystem.applyLevelUpGains(this, result.levelsGained);
            return {
                leveledUp: true,
                levelsGained: result.levelsGained,
                gains: gains,
                remainingExp: this.exp
            };
        }
        
        return {
            leveledUp: false,
            levelsGained: 0,
            gains: null,
            remainingExp: this.exp
        };
    }

    // Прокачка характеристик за очки
    upgradeHealth() {
        return this.levelSystem.upgradeStat(this, 'health');
    }

    upgradeMana() {
        return this.levelSystem.upgradeStat(this, 'mana');
    }

    upgradeDamage() {
        return this.levelSystem.upgradeStat(this, 'damage');
    }

    // Восстановление здоровья и маны
    restore() {
        this.hp = this.maxHp;
        this.mp = this.maxMp;
    }
}