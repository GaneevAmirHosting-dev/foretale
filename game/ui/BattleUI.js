import { Monster } from '../core/Monster.js';

export class BattleUI {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.battleScreen = document.getElementById('battleScreen');
        this.locationScreen = document.getElementById('locationScreen');
        this.locationsGrid = document.getElementById('locationsGrid');
        this.battleLog = document.getElementById('battleLog');
        
        this.findEnemyBtn = document.getElementById('findEnemyBtn');
        this.attackBtn = document.getElementById('attackBtn');
        
        this.initEventListeners();
    }

    initEventListeners() {
        console.log('Initializing BattleUI event listeners...');
        
        const locationSelectBtn = document.getElementById('locationSelectBtn');
        if (locationSelectBtn) {
            locationSelectBtn.addEventListener('click', () => {
                console.log('Location select button clicked');
                this.showLocationScreen();
            });
        }

        const backFromLocationBtn = document.getElementById('backFromLocationBtn');
        if (backFromLocationBtn) {
            backFromLocationBtn.addEventListener('click', () => {
                console.log('Back from location button clicked');
                this.showBattleScreen();
            });
        }

        const shopBtnHeader = document.getElementById('shopBtnHeader');
        if (shopBtnHeader) {
            shopBtnHeader.addEventListener('click', () => {
                console.log('Shop button clicked');
                this.gameManager.shopUI.showShopScreen();
            });
        }

        // Кнопка настроек в хедере
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.gameManager.showSettings();
            });
        }

        if (this.findEnemyBtn) {
            this.findEnemyBtn.addEventListener('click', () => {
                console.log('Find enemy button clicked');
                this.findEnemy();
            });
        }

        if (this.attackBtn) {
            this.attackBtn.addEventListener('click', () => {
                console.log('Attack button clicked');
                this.attack();
            });
        }

        const upgradeButtons = document.querySelectorAll('.upgrade-btn');
        upgradeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stat = e.target.closest('.upgrade-option').dataset.stat;
                this.upgradeStat(stat);
            });
        });

        const closeLevelUpBtn = document.getElementById('closeLevelUpBtn');
        if (closeLevelUpBtn) {
            closeLevelUpBtn.addEventListener('click', () => {
                this.hideLevelUpScreen();
            });
        }

        const detailedStatsBtn = document.getElementById('detailedStatsBtn');
        if (detailedStatsBtn) {
            detailedStatsBtn.addEventListener('click', () => {
                this.showDetailedStats();
            });
        }

        const closeDetailedStatsBtn = document.getElementById('closeDetailedStatsBtn');
        if (closeDetailedStatsBtn) {
            closeDetailedStatsBtn.addEventListener('click', () => {
                this.hideDetailedStats();
            });
        }

        const upgradeStatsBtn = document.getElementById('upgradeStatsBtn');
        if (upgradeStatsBtn) {
            upgradeStatsBtn.addEventListener('click', () => {
                this.showLevelUpScreen();
            });
        }

        this.initLocationSelection();

        console.log('BattleUI event listeners initialized');
    }

    showBattleScreen() {
        document.getElementById('battleScreen').style.display = 'block';
        document.getElementById('locationScreen').style.display = 'none';
        document.getElementById('shopScreen').style.display = 'none';
        document.getElementById('detailedStatsScreen').style.display = 'none';
        document.getElementById('settingsScreen').style.display = 'none';
    }

    showLocationScreen() {
        document.getElementById('battleScreen').style.display = 'none';
        document.getElementById('locationScreen').style.display = 'block';
        document.getElementById('shopScreen').style.display = 'none';
        document.getElementById('detailedStatsScreen').style.display = 'none';
        document.getElementById('settingsScreen').style.display = 'none';
    }

    initLocationSelection() {
        this.locationsGrid.innerHTML = '';
        const locations = this.gameManager.getLocationsData();
        
        locations.forEach(locationData => {
            const locationCard = this.createLocationCard(locationData);
            this.locationsGrid.appendChild(locationCard);
        });
    }

    createLocationCard(locationData) {
        const locationCard = document.createElement('div');
        locationCard.className = 'location-card';
        locationCard.style.background = locationData.background;
        
        locationCard.innerHTML = `
            <div class="location-name">${locationData.name}</div>
            <div class="location-description">${locationData.description}</div>
            <div class="location-level">Требуется уровень: ${locationData.requiredLevel}</div>
        `;
        
        const canAccess = this.gameManager.canAccessLocation(locationData);
        
        if (!canAccess) {
            locationCard.classList.add('disabled');
        } else {
            locationCard.addEventListener('click', () => this.selectLocation(locationData));
        }
        
        return locationCard;
    }

    selectLocation(locationData) {
        this.gameManager.setCurrentLocation(locationData);
        this.showBattleScreen();
        this.addToLog(`Вы переместились в локацию: ${locationData.name}`, 'system-log');
        this.addToLog(locationData.description, 'system-log');
    }

    findEnemy() {
        const enemy = this.gameManager.findEnemy();
        if (enemy) {
            this.attackBtn.disabled = false;
            this.updateMonsterStats(enemy);
            this.addToLog(`Вы встретили ${enemy.name}!`, 'system-log');
        }
    }

    attack() {
        const battleResult = this.gameManager.performAttack();
        
        if (battleResult.playerAttack) {
            this.addToLog(battleResult.playerAttack, 'player-log');
            this.updateMonsterStats(this.gameManager.currentMonster);
        }
        
        if (battleResult.enemyAttack) {
            setTimeout(() => {
                this.addToLog(battleResult.enemyAttack, 'enemy-log');
                this.updatePlayerStats(this.gameManager.player);
                
                if (battleResult.playerDead) {
                    this.addToLog('Вы потерпели поражение!', 'system-log');
                    this.attackBtn.disabled = true;
                    this.findEnemyBtn.disabled = true;
                }
            }, 500);
        }
        
        if (battleResult.victory) {
            this.addToLog(battleResult.victory, 'system-log');
            if (battleResult.levelUp) {
                this.addToLog(`Повышен уровень! Получено +${battleResult.levelUp.levelsGained} уровней!`, 'system-log');
            }
            this.attackBtn.disabled = true;
            this.updatePlayerStats(this.gameManager.player);
        }
    }

    upgradeStat(statType) {
        const player = this.gameManager.getCurrentCharacter();
        if (!player || player.availableStatPoints <= 0) return;

        let success = false;
        let message = '';

        switch (statType) {
            case 'health':
                const hpGain = player.levelUpConfig.hpGain;
                player.maxHp += hpGain;
                player.hp += hpGain;
                player.availableStatPoints--;
                success = true;
                message = `Здоровье увеличено на ${hpGain}!`;
                break;
                
            case 'mana':
                const mpGain = player.levelUpConfig.mpGain;
                player.maxMp += mpGain;
                player.mp += mpGain;
                player.availableStatPoints--;
                success = true;
                message = `Мана увеличена на ${mpGain}!`;
                break;
                
            case 'damage':
                const dmgGain = player.levelUpConfig.dmgGain;
                player.dmg += dmgGain;
                player.availableStatPoints--;
                success = true;
                message = `Урон увеличен на ${dmgGain}!`;
                break;
        }

        if (success) {
            this.addToLog(message, 'system-log');
            this.updatePlayerStats(player);
            this.updateLevelUpDisplay();
            this.gameManager.characterManager.updateCharacterProgress(player);
            
            // Скрываем экран прокачки если очки закончились
            if (player.availableStatPoints <= 0) {
                setTimeout(() => {
                    this.hideLevelUpScreen();
                }, 1000);
            }
        }
    }

    showLevelUpScreen(levelUpData = null) {
        const levelUpScreen = document.getElementById('levelUpScreen');
        const availablePointsDisplay = document.getElementById('availablePointsDisplay');
        
        if (levelUpScreen && availablePointsDisplay) {
            const player = this.gameManager.getCurrentCharacter();
            
            // ПРОВЕРЯЕМ ЕСТЬ ЛИ ОЧКИ ДЛЯ ПРОКАЧКИ
            if (player.availableStatPoints <= 0) {
                this.addToLog('Нет доступных очков характеристик для прокачки!', 'system-log');
                return;
            }
            
            availablePointsDisplay.textContent = player.availableStatPoints;
            
            if (levelUpData) {
                const newLevelDisplay = document.getElementById('newLevelDisplay');
                if (newLevelDisplay) {
                    newLevelDisplay.textContent = player.level;
                }
            }
            
            const healthGain = document.getElementById('healthGain');
            const manaGain = document.getElementById('manaGain');
            const damageGain = document.getElementById('damageGain');
            
            if (healthGain) healthGain.textContent = player.levelUpConfig.hpGain;
            if (manaGain) manaGain.textContent = player.levelUpConfig.mpGain;
            if (damageGain) damageGain.textContent = player.levelUpConfig.dmgGain;
            
            levelUpScreen.style.display = 'flex';
        }
    }

    hideLevelUpScreen() {
        const levelUpScreen = document.getElementById('levelUpScreen');
        if (levelUpScreen) {
            levelUpScreen.style.display = 'none';
        }
    }

    updateLevelUpDisplay() {
        const player = this.gameManager.getCurrentCharacter();
        const availablePointsDisplay = document.getElementById('availablePointsDisplay');
        if (availablePointsDisplay) {
            availablePointsDisplay.textContent = player.availableStatPoints;
        }
        
        const upgradeButtons = document.querySelectorAll('.upgrade-btn');
        upgradeButtons.forEach(btn => {
            btn.disabled = player.availableStatPoints <= 0;
            btn.textContent = player.availableStatPoints > 0 ? 'Улучшить' : 'Нет очков';
        });
    }

    showDetailedStats() {
        const player = this.gameManager.getCurrentCharacter();
        if (!player) return;

        const detailedStatsScreen = document.getElementById('detailedStatsScreen');
        const detailedStatsContent = document.getElementById('detailedStatsContent');
        
        if (detailedStatsScreen && detailedStatsContent) {
            detailedStatsContent.innerHTML = `
                <div class="detailed-stat"><span>Урон:</span> <span>${player.dmg}</span></div>
                <div class="detailed-stat"><span>Регенерация HP:</span> <span>${player.hpRegen}/сек</span></div>
                <div class="detailed-stat"><span>Регенерация MP:</span> <span>${player.mpRegen}/сек</span></div>
                <div class="detailed-stat"><span>Потрачено очков:</span> <span>${player.spentStatPoints}</span></div>
                <div class="detailed-stat"><span>Доступно очков:</span> <span>${player.availableStatPoints}</span></div>
                <div class="detailed-stat"><span>Личные саны:</span> <span>${player.personalSans}</span></div>
                ${player.bonuses ? `
                    <div class="bonuses-section">
                        <h3>Бонусы расы:</h3>
                        ${Object.entries(player.bonuses).map(([key, value]) => 
                            `<div class="detailed-stat"><span>${this.getBonusName(key)}:</span> <span>${value}</span></div>`
                        ).join('')}
                    </div>
                ` : ''}
            `;
            
            detailedStatsScreen.style.display = 'flex';
        }
    }

    hideDetailedStats() {
        const detailedStatsScreen = document.getElementById('detailedStatsScreen');
        if (detailedStatsScreen) {
            detailedStatsScreen.style.display = 'none';
        }
    }

    getBonusName(bonusKey) {
        const names = {
            'hpRegen': 'Регенерация HP',
            'mpRegen': 'Регенерация MP',
            'criticalChance': 'Шанс крита',
            'dodgeChance': 'Уклонение',
            'spellPower': 'Сила заклинаний',
            'armor': 'Броня',
            'lifesteal': 'Вампиризм',
            'nightPower': 'Ночная сила',
            'stunResistance': 'Сопр. оглушению',
            'manaShield': 'Магический щит'
        };
        return names[bonusKey] || bonusKey;
    }

    addToLog(message, className = 'system-log') {
        const logEntry = document.createElement('div');
        logEntry.classList.add('log-entry', className);
        logEntry.textContent = message;
        this.battleLog.appendChild(logEntry);
        this.battleLog.scrollTop = this.battleLog.scrollHeight;
    }

    updatePlayerStats(character) {
        if (!character) return;
        
        const elements = {
            'charLevel': character.level,
            'charExp': character.exp,
            'charExpNeeded': character.expForLevel,
            'charHp': character.hp,
            'charMaxHp': character.maxHp,
            'charMp': character.mp,
            'charMaxMp': character.maxMp,
            'charDmg': character.dmg,
            'currentCharLevel': character.level,
            'currentCharSans': character.personalSans
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        }
        
        const hpBar = document.getElementById('charHpBar');
        const mpBar = document.getElementById('charMpBar');
        const expBar = document.getElementById('charExpBar');
        
        if (hpBar) hpBar.style.width = `${(character.hp / character.maxHp) * 100}%`;
        if (mpBar) mpBar.style.width = `${(character.mp / character.maxMp) * 100}%`;
        if (expBar) expBar.style.width = `${(character.exp / character.expForLevel) * 100}%`;
    }

    updateMonsterStats(monster) {
        if (!monster) {
            document.getElementById('enemyInfo').style.display = 'none';
            document.getElementById('noEnemyMessage').style.display = 'block';
            return;
        }
        
        document.getElementById('enemyInfo').style.display = 'block';
        document.getElementById('noEnemyMessage').style.display = 'none';
        
        const elements = {
            'enemyName': monster.name,
            'enemyType': monster.type,
            'enemyHp': monster.hp,
            'enemyMaxHp': monster.maxHp,
            'enemyMp': monster.mp,
            'enemyMaxMp': monster.maxMp,
            'enemyDmg': monster.dmg
        };

        for (const [id, value] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        }
        
        const hpBar = document.getElementById('enemyHpBar');
        const mpBar = document.getElementById('enemyMpBar');
        
        if (hpBar) hpBar.style.width = `${(monster.hp / monster.maxHp) * 100}%`;
        if (mpBar) mpBar.style.width = `${(monster.mp / monster.maxMp) * 100}%`;
    }

    clearLog() {
        this.battleLog.innerHTML = '';
    }
}