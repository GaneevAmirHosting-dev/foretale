import { CharacterUI } from '../ui/CharacterUI.js';
import { BattleUI } from '../ui/BattleUI.js';
import { ShopUI } from '../ui/ShopUI.js';
import { SettingsUI } from '../ui/SettingsUI.js';
import { Monster } from '../core/Monster.js';

export class GameManager {
    constructor(characterManager) {
        this.characterManager = characterManager;
        this.gameData = {
            races: { races: [] },
            locations: { locations: [] },
            monsters: { monsters: [] },
            shop: { characters: [] },
            keynames: { keyNames: {} },
            keybinds: { defaultKeybinds: {}, keybindDescriptions: {} }
        };
        
        this.currentMonster = null;
        this.currentLocation = null;
        this.player = null;
        this.characterUI = null;
        this.battleUI = null;
        this.shopUI = null;
        this.settingsUI = null;
        this.regenInterval = null;
        
        // Текущие настройки управления (стандартные + пользовательские)
        this.keybinds = {};
        
        console.log('GameManager initialized');
    }

    async loadGameData() {
        try {
            const [racesResponse, locationsResponse, monstersResponse, shopResponse, keynamesResponse, keybindsResponse] = await Promise.all([
                fetch('data/races.json'),
                fetch('data/locations.json'),
                fetch('data/monsters.json'),
                fetch('data/shop.json'),
                fetch('data/keynames.json'),
                fetch('data/keybinds.json')
            ]);

            if (!racesResponse.ok) throw new Error('Failed to load races');
            if (!locationsResponse.ok) throw new Error('Failed to load locations');
            if (!monstersResponse.ok) throw new Error('Failed to load monsters');
            if (!shopResponse.ok) throw new Error('Failed to load shop');
            if (!keynamesResponse.ok) throw new Error('Failed to load keynames');
            if (!keybindsResponse.ok) throw new Error('Failed to load keybinds');

            this.gameData.races = await racesResponse.json();
            this.gameData.locations = await locationsResponse.json();
            this.gameData.monsters = await monstersResponse.json();
            this.gameData.shop = await shopResponse.json();
            this.gameData.keynames = await keynamesResponse.json();
            this.gameData.keybinds = await keybindsResponse.json();

            // Загружаем настройки управления
            this.loadKeybinds();
            
            console.log('Game data loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading game data:', error);
            // Создаем базовые структуры если файлы не загрузились
            this.createFallbackData();
            return false;
        }
    }



    // Загрузка настроек клавиш (стандартные + пользовательские)
    loadKeybinds() {
        try {
            // Стандартные настройки
            const defaultKeybinds = this.gameData.keybinds.defaultKeybinds;
            
            // Пользовательские настройки из localStorage
            const saved = localStorage.getItem('rpgKeybinds');
            const userKeybinds = saved ? JSON.parse(saved) : {};
            
            // Объединяем: пользовательские переопределяют стандартные
            this.keybinds = { ...defaultKeybinds, ...userKeybinds };
            
            console.log('Keybinds loaded:', this.keybinds);
        } catch (e) {
            console.error('Error loading keybinds:', e);
            // Если ошибка, используем только стандартные
            this.keybinds = { ...this.gameData.keybinds.defaultKeybinds };
        }
    }

    // Сохранение пользовательских настроек клавиш
    saveKeybinds() {
        try {
            localStorage.setItem('rpgKeybinds', JSON.stringify(this.keybinds));
            console.log('Keybinds saved:', this.keybinds);
        } catch (e) {
            console.error('Error saving keybinds:', e);
        }
    }

    // Сброс к стандартным настройкам
    resetKeybinds() {
        this.keybinds = { ...this.gameData.keybinds.defaultKeybinds };
        this.saveKeybinds();
        console.log('Keybinds reset to default');
    }

    // Получение названия клавиши
    getKeyName(keyCode) {
        return this.gameData.keynames.keyNames[keyCode] || keyCode.replace('Key', '').replace('Digit', '');
    }

    // Получение описания действия
    getKeybindDescription(action) {
        return this.gameData.keybinds.keybindDescriptions[action] || action;
    }

    // Обработчики клавиш
    initKeyHandlers() {
        document.addEventListener('keydown', (e) => {
            // Настройки (Escape)
            if (e.code === this.keybinds.settings) {
                e.preventDefault();
                this.showSettings();
            }
            
            // Статистика (E)
            if (e.code === this.keybinds.stats && this.player) {
                e.preventDefault();
                this.battleUI.showDetailedStats();
            }
            
            // Прокачка (U)
            if (e.code === this.keybinds.levelup && this.player && this.player.availableStatPoints > 0) {
                e.preventDefault();
                this.battleUI.showLevelUpScreen();
            }
        });
    }


    initUI() {
        console.log('Initializing UI...');
        
        // Сначала создаем SettingsUI, так как он нужен для других UI
        this.settingsUI = new SettingsUI(this);
        
        // Затем остальные UI
        this.characterUI = new CharacterUI(this);
        this.battleUI = new BattleUI(this);
        this.shopUI = new ShopUI(this);
        
        // Запускаем регенерацию
        this.startRegeneration();
        
        // Инициализируем обработчики клавиш
        this.initKeyHandlers();
        
        console.log('UI initialized, showing characters screen');
        this.showCharactersScreen();
    }

    // Запуск регенерации
    startRegeneration() {
        this.regenInterval = setInterval(() => {
            if (this.player) {
                this.characterManager.regenerateCharacter(this.player.id);
                this.updateCharacterDisplay();
            }
        }, 1000);
    }

    // Остановка регенерации
    stopRegeneration() {
        if (this.regenInterval) {
            clearInterval(this.regenInterval);
            this.regenInterval = null;
        }
    }

    showCharactersScreen() {
        if (this.characterUI) {
            this.characterUI.showCharactersScreen();
        }
    }

    showBattleScreen() {
        if (this.battleUI) {
            this.battleUI.showBattleScreen();
        }
    }

    // Персонажи
    createCharacter(name, raceData) {
        return this.characterManager.createCharacter(name, raceData);
    }

    setCurrentCharacter(characterId) {
        this.characterManager.setCurrentCharacter(characterId);
        this.player = this.characterManager.getCurrentCharacter();
    }

    getCurrentCharacter() {
        return this.player;
    }

    getAllCharacters() {
        return this.characterManager.getAllCharacters();
    }

    // Локации
    getLocationsData() {
        return this.gameData.locations.locations || [];
    }

    setCurrentLocation(locationData) {
        this.currentLocation = locationData;
        const locationDisplay = document.getElementById('currentLocationDisplay');
        if (locationDisplay) {
            locationDisplay.textContent = locationData.name;
        }
    }

    canAccessLocation(locationData) {
        return !this.player || this.player.level >= locationData.requiredLevel;
    }

    // Магазин
    getShopData() {
        return this.gameData.shop;
    }

    getRaceData(raceId) {
        return this.gameData.races.races.find(race => race.id === raceId);
    }

    purchaseCharacter(shopItem, raceData) {
        if (this.characterManager.spendGlobalSans(shopItem.price)) {
            shopItem.isPurchased = true;
            return true;
        }
        return false;
    }

    // Боевая система
    findEnemy() {
        if (!this.currentLocation) {
            this.addToLog('Сначала выберите локацию!', 'system-log');
            return null;
        }

        const locationMonsters = this.gameData.monsters.monsters.filter(monster => 
            monster.locations.includes(this.currentLocation.id)
        );

        if (locationMonsters.length === 0) {
            this.addToLog('В этой локации нет монстров!', 'system-log');
            return null;
        }

        const randomMonsterData = locationMonsters[Math.floor(Math.random() * locationMonsters.length)];
        this.currentMonster = new Monster(randomMonsterData);
        
        return this.currentMonster;
    }

    // Обработчики клавиш
initKeyHandlers() {
    document.addEventListener('keydown', (e) => {
        // Если активен input, textarea или contenteditable - игнорируем горячие клавиши
        const activeElement = document.activeElement;
        const isInputActive = activeElement.tagName === 'INPUT' || 
                             activeElement.tagName === 'TEXTAREA' ||
                             activeElement.isContentEditable;
        
        if (isInputActive) {
            return; // Не обрабатываем горячие клавиши когда пользователь вводит текст
        }
        
        // Настройки (Escape)
        if (e.code === this.keybinds.settings) {
            e.preventDefault();
            this.showSettings();
        }
        
        // Статистика (E) - только когда есть персонаж
        if (e.code === this.keybinds.stats && this.player) {
            e.preventDefault();
            this.battleUI.showDetailedStats();
        }
        
        // Прокачка (U) - только когда есть персонаж и очки
        if (e.code === this.keybinds.levelup && this.player && this.player.availableStatPoints > 0) {
            e.preventDefault();
            this.battleUI.showLevelUpScreen();
        }
    });
}

    performAttack() {
    if (!this.currentMonster) return {};
    
    const result = {};
    
    // Атака игрока
    const playerDamage = this.player.dmg;
    this.currentMonster.hp -= playerDamage;
    result.playerAttack = `Вы атакуете и наносите ${playerDamage} урона!`;
    
    // Проверка на победу
    if (this.currentMonster.hp <= 0) {
        const xpReward = this.currentMonster.xpDrop;
        
        // Используем старую систему получения опыта
        this.player.exp += xpReward;
        let levelsGained = 0;
        
        // Проверяем несколько уровней
        while (this.player.exp >= this.player.expForLevel) {
            this.player.exp -= this.player.expForLevel;
            this.player.level++;
            this.player.expForLevel = Math.floor(this.player.expForLevel * 1.2);
            this.player.availableStatPoints += 5;
            levelsGained++;
            
            // ПОЛНОЕ ВОССТАНОВЛЕНИЕ ПРИ УРОВНЕ
            this.characterManager.fullRestoreOnLevelUp(this.player.id);
        }
        
        if (levelsGained > 0) {
            result.levelUp = {
                levelsGained: levelsGained,
                gains: {
                    hp: this.player.levelUpConfig.hpGain * levelsGained,
                    mp: this.player.levelUpConfig.mpGain * levelsGained,
                    dmg: this.player.levelUpConfig.dmgGain * levelsGained,
                    statPoints: 5 * levelsGained
                }
            };
            
            // АВТОМАТИЧЕСКИ ПОКАЗЫВАЕМ ЭКРАН ПРОКАЧКИ ПРИ ПОЛУЧЕНИИ ОЧКОВ
            setTimeout(() => {
                if (this.player.availableStatPoints > 0) {
                    console.log('Auto-showing level up screen with points:', this.player.availableStatPoints);
                    this.battleUI.showLevelUpScreen();
                    
                    // ДВОЙНАЯ ПРОВЕРКА ЧЕРЕЗ НЕСКОЛЬКО МС
                    setTimeout(() => {
                        this.battleUI.updateLevelUpButtons();
                    }, 100);
                }
            }, 1000);
        }
        
        const sansReward = Math.floor(xpReward / 2);
        this.characterManager.addSansToCharacter(this.characterManager.currentCharacterId, sansReward);
        
        result.victory = `Вы победили ${this.currentMonster.name} и получили ${xpReward} опыта и ${sansReward} санов!`;
        
        this.currentMonster = null;
        this.characterManager.updateCharacterProgress(this.player);
        return result;
    }
    
    // Атака монстра
    const enemyDamage = this.currentMonster.dmg;
    this.player.hp -= enemyDamage;
    result.enemyAttack = `${this.currentMonster.name} атакует и наносит ${enemyDamage} урона!`;
    
    // Проверка на поражение
    if (this.player.hp <= 0) {
        result.playerDead = true;
    }
    
    this.characterManager.updateCharacterProgress(this.player);
    return result;
}

    // UI методы
    loadCharacterIntoGame(characterData) {
        this.player = characterData;
        this.updateCharacterDisplay();
        this.addToLog(`Вы выбрали персонажа: ${characterData.name} (${characterData.race})`, 'system-log');
        
        // ПОСЛЕ ВЫБОРА ПЕРСОНАЖА ПОКАЗЫВАЕМ ИГРОВОЙ ИНТЕРФЕЙС
        this.showBattleScreen();
    }

    updateCharacterDisplay() {
        if (!this.player) return;
        
        const currentCharName = document.getElementById('currentCharName');
        const currentCharRace = document.getElementById('currentCharRace');
        const currentCharLevel = document.getElementById('currentCharLevel');
        const currentCharSans = document.getElementById('currentCharSans');
        
        if (currentCharName) currentCharName.textContent = this.player.name;
        if (currentCharRace) currentCharRace.textContent = this.player.race;
        if (currentCharLevel) currentCharLevel.textContent = this.player.level;
        if (currentCharSans) currentCharSans.textContent = this.player.personalSans;
        
        // Обновляем статистику в бою
        if (this.battleUI) {
            this.battleUI.updatePlayerStats(this.player);
        }
    }

    updateSansDisplay() {
        const globalSans = this.characterManager.getGlobalSans();
        const sansCount = document.getElementById('sansCount');
        if (sansCount) {
            sansCount.textContent = globalSans;
        }
    }

    addToLog(message, className) {
        if (this.battleUI) {
            this.battleUI.addToLog(message, className);
        } else {
            console.log(`[${className}] ${message}`);
        }
    }

    getGlobalSans() {
        return this.characterManager.getGlobalSans();
    }

    showLevelUp(levelUpData) {
        if (this.battleUI) {
            this.battleUI.showLevelUpScreen(levelUpData);
        }
    }

    setLevelUpCallback(callback) {
        this.onLevelUpCallback = callback;
    }

    // Показать детальные характеристики
    showDetailedStats() {
        if (this.battleUI) {
            this.battleUI.showDetailedStats();
        }
    }

    // Показать настройки
    showSettings() {
        if (this.settingsUI) {
            this.settingsUI.showSettings();
        }
    }
}