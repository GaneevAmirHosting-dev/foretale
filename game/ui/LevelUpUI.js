export class LevelUpUI {
    constructor() {
        this.levelUpScreen = document.getElementById('levelUpScreen');
        this.availablePointsDisplay = document.getElementById('availablePointsDisplay');
        this.newLevelDisplay = document.getElementById('newLevelDisplay');
        this.healthGain = document.getElementById('healthGain');
        this.manaGain = document.getElementById('manaGain');
        this.damageGain = document.getElementById('damageGain');
        
        this.initEventListeners();
    }

    initEventListeners() {
        // Кнопки прокачки
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stat = e.target.closest('.upgrade-option').dataset.stat;
                this.onUpgradeStat(stat);
            });
        });

        // Кнопка закрытия
        document.getElementById('closeLevelUpBtn').addEventListener('click', () => {
            this.hide();
        });
    }

    // Показать экран прокачки
    show(character, levelsGained = 0) {
        this.updateDisplay(character, levelsGained);
        this.levelUpScreen.style.display = 'flex';
    }

    // Скрыть экран прокачки
    hide() {
        this.levelUpScreen.style.display = 'none';
    }

    // Обновить отображение
    updateDisplay(character, levelsGained = 0) {
        this.availablePointsDisplay.textContent = character.availableStatPoints;
        this.newLevelDisplay.textContent = character.level;
        
        // Показываем gains за уровни
        if (levelsGained > 0) {
            const gains = character.levelSystem.calculateTotalGains(levelsGained);
            this.healthGain.textContent = gains.hp;
            this.manaGain.textContent = gains.mp;
            this.damageGain.textContent = gains.dmg;
        } else {
            // Для прокачки за очки показываем стандартные gains
            this.healthGain.textContent = character.levelSystem.levelUpConfig.hpGain;
            this.manaGain.textContent = character.levelSystem.levelUpConfig.mpGain;
            this.damageGain.textContent = character.levelSystem.levelUpConfig.dmgGain;
        }

        // Обновляем состояние кнопок
        this.updateButtonsState(character);
    }

    // Обновить состояние кнопок
    updateButtonsState(character) {
        const hasPoints = character.availableStatPoints > 0;
        
        document.querySelectorAll('.upgrade-btn').forEach(btn => {
            btn.disabled = !hasPoints;
            btn.textContent = hasPoints ? 'Улучшить' : 'Нет очков';
        });
    }

    // Обработчик прокачки характеристики
    onUpgradeStat(statType) {
        if (this.onUpgradeCallback) {
            this.onUpgradeCallback(statType);
        }
    }

    // Установка callback для прокачки
    setUpgradeCallback(callback) {
        this.onUpgradeCallback = callback;
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `upgrade-notification ${type}`;
        notification.textContent = message;
        
        this.levelUpScreen.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}