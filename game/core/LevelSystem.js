export class LevelSystem {
    constructor(levelUpConfig) {
        this.levelUpConfig = levelUpConfig;
    }

    // Расчет опыта для следующего уровня
    calculateExpForLevel(level) {
        return Math.floor(20 * Math.pow(1.2, level - 1));
    }

    // Добавление опыта с учетом нескольких уровней
    addExp(currentExp, currentLevel, expGained) {
        let newExp = currentExp + expGained;
        let newLevel = currentLevel;
        let levelsGained = 0;
        let remainingExp = newExp;

        // Проверяем, достаточно ли опыта для повышения уровня
        while (remainingExp >= this.calculateExpForLevel(newLevel)) {
            remainingExp -= this.calculateExpForLevel(newLevel);
            newLevel++;
            levelsGained++;
        }

        return {
            newLevel,
            newExp: remainingExp,
            levelsGained,
            expForNextLevel: this.calculateExpForLevel(newLevel)
        };
    }

    // Автоматическое повышение характеристик при уровне
    applyLevelUpGains(character, levelsGained) {
        if (levelsGained > 0) {
            const gains = this.calculateTotalGains(levelsGained);
            
            character.maxHp += gains.hp;
            character.hp += gains.hp;
            character.maxMp += gains.mp;
            character.mp += gains.mp;
            character.dmg += gains.dmg;
            character.availableStatPoints += gains.statPoints;

            return gains;
        }
        return null;
    }

    // Расчет суммарных бонусов за несколько уровней
    calculateTotalGains(levels) {
        return {
            hp: this.levelUpConfig.hpGain * levels,
            mp: this.levelUpConfig.mpGain * levels,
            dmg: this.levelUpConfig.dmgGain * levels,
            statPoints: this.levelUpConfig.statPoints * levels
        };
    }

    // Прокачка за очки характеристик
    upgradeStat(character, statType) {
        if (character.availableStatPoints <= 0) {
            return false;
        }

        const gains = {
            health: () => {
                const gain = this.levelUpConfig.hpGain;
                character.maxHp += gain;
                character.hp += gain;
                return { type: 'health', value: gain };
            },
            mana: () => {
                const gain = this.levelUpConfig.mpGain;
                character.maxMp += gain;
                character.mp += gain;
                return { type: 'mana', value: gain };
            },
            damage: () => {
                const gain = this.levelUpConfig.dmgGain;
                character.dmg += gain;
                return { type: 'damage', value: gain };
            }
        };

        if (gains[statType]) {
            const result = gains[statType]();
            character.availableStatPoints--;
            character.spentStatPoints++;
            return result;
        }

        return false;
    }
}