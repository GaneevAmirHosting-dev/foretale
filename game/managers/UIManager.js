import { LevelUpUI } from '../ui/LevelUpUI.js';

export class UIManager {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.levelUpUI = new LevelUpUI();
        
        this.init();
    }

    init() {
        this.setupLevelUpHandlers();
    }

    setupLevelUpHandlers() {
        // Обработчик прокачки характеристик
        this.levelUpUI.setUpgradeCallback((statType) => {
            const character = this.gameManager.getCurrentCharacter();
            if (!character) return;

            let result;
            switch (statType) {
                case 'health':
                    result = character.upgradeHealth();
                    break;
                case 'mana':
                    result = character.upgradeMana();
                    break;
                case 'damage':
                    result = character.upgradeDamage();
                    break;
            }

            if (result) {
                this.levelUpUI.showNotification(
                    `Улучшено ${this.getStatName(result.type)} +${result.value}`,
                    'success'
                );
                this.levelUpUI.updateDisplay(character);
                this.gameManager.updateCharacterDisplay();
            }
        });
    }

    getStatName(statType) {
        const names = {
            health: 'Здоровье',
            mana: 'Мана',
            damage: 'Урон'
        };
        return names[statType] || statType;
    }

    // Показать экран прокачки при повышении уровня
    showLevelUp(character, levelsGained, gains) {
        this.levelUpUI.show(character, levelsGained);
        
        // Показываем уведомление о полученных бонусах
        if (gains) {
            this.levelUpUI.showNotification(
                `Получено за ${levelsGained} уровней: +${gains.hp} HP, +${gains.mp} MP, +${gains.dmg} DMG, +${gains.statPoints} очков`,
                'level-up'
            );
        }
    }

    // Скрыть экран прокачки
    hideLevelUp() {
        this.levelUpUI.hide();
    }
}