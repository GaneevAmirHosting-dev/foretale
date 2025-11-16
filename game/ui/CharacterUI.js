export class CharacterUI {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.characterCreationScreen = document.getElementById('characterCreationScreen');
        this.charactersScreen = document.getElementById('charactersScreen');
        this.racesGrid = document.getElementById('racesGrid');
        this.charactersGrid = document.getElementById('charactersGrid');
        this.currentSelectedRace = null;
        
        this.initEventListeners();
    }

    initEventListeners() {
        console.log('Initializing CharacterUI event listeners...');
        
        const manageCharsBtn = document.getElementById('manageCharactersBtn');
        if (manageCharsBtn) {
            manageCharsBtn.addEventListener('click', () => {
                console.log('Manage characters button clicked');
                this.showCharactersScreen();
            });
        }

        // Кнопка настроек в хедере
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                console.log('Settings button clicked from CharacterUI');
                this.gameManager.showSettings();
            });
        }

        const newCharBtn = document.getElementById('newCharacterBtn');
        if (newCharBtn) {
            newCharBtn.addEventListener('click', () => {
                console.log('New character button clicked');
                this.showCharacterCreation();
            });
        }

        const createFirstBtn = document.getElementById('createFirstCharacterBtn');
        if (createFirstBtn) {
            createFirstBtn.addEventListener('click', () => {
                console.log('Create first character button clicked');
                this.showCharacterCreation();
            });
        }

        const backToCharsBtn = document.getElementById('backToCharactersBtn');
        if (backToCharsBtn) {
            backToCharsBtn.addEventListener('click', () => {
                console.log('Back to characters button clicked');
                this.showCharactersScreen();
            });
        }

        const createCharBtn = document.getElementById('createCharacterBtn');
        if (createCharBtn) {
            createCharBtn.addEventListener('click', () => {
                console.log('Create character button clicked');
                this.createNewCharacter();
            });
        }

        const switchCharBtn = document.getElementById('switchCharacterBtn');
        if (switchCharBtn) {
            switchCharBtn.addEventListener('click', () => {
                console.log('Switch character button clicked');
                this.showCharactersScreen();
            });
        }

        const charNameInput = document.getElementById('characterName');
        if (charNameInput) {
            charNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.createNewCharacter();
                }
            });
        }

        console.log('CharacterUI event listeners initialized');
    }

    showCharacterCreation() {
        console.log('Showing character creation screen');
        this.hideAllScreens();
        this.characterCreationScreen.style.display = 'block';
        this.initRaceSelection();
    }

    showCharactersScreen() {
        console.log('Showing characters screen');
        this.hideAllScreens();
        this.charactersScreen.style.display = 'block';
        this.initCharactersGrid();
    }

    hideAllScreens() {
        const screens = [
            'characterCreationScreen',
            'charactersScreen', 
            'gameInterface',
            'settingsScreen',
            'battleScreen',
            'locationScreen',
            'shopScreen'
        ];
        
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) screen.style.display = 'none';
        });
    }

    initRaceSelection() {
        if (!this.racesGrid) return;
        
        this.racesGrid.innerHTML = '';
        const shopData = this.gameManager.getShopData();
        
        shopData.characters.forEach(shopItem => {
            if (shopItem.isPurchased) {
                const raceData = this.gameManager.getRaceData(shopItem.id);
                if (raceData) {
                    const raceOption = this.createRaceOption(raceData);
                    this.racesGrid.appendChild(raceOption);
                }
            }
        });
    }

    createRaceOption(raceData) {
        const raceOption = document.createElement('div');
        raceOption.className = 'race-option';
        raceOption.innerHTML = `
            <div class="race-name">${raceData.name}</div>
            <div class="race-description">${raceData.description}</div>
            <div class="race-stats">
                <div class="race-stat"><span>Здоровье:</span> <span>${raceData.baseHp}</span></div>
                <div class="race-stat"><span>Мана:</span> <span>${raceData.baseMp}</span></div>
                <div class="race-stat"><span>Урон:</span> <span>${raceData.baseDmg}</span></div>
                <div class="race-stat"><span>Реген HP:</span> <span>${raceData.hpRegen}/сек</span></div>
                <div class="race-stat"><span>Реген MP:</span> <span>${raceData.mpRegen}/сек</span></div>
            </div>
        `;
        
        raceOption.addEventListener('click', () => this.selectRace(raceOption, raceData));
        return raceOption;
    }

    selectRace(raceElement, raceData) {
        document.querySelectorAll('.race-option').forEach(option => {
            option.classList.remove('selected');
        });
        raceElement.classList.add('selected');
        this.currentSelectedRace = raceData;
    }

    initCharactersGrid() {
        if (!this.charactersGrid) return;
        
        this.charactersGrid.innerHTML = '';
        const characters = this.gameManager.getAllCharacters();
        
        if (characters.length === 0) {
            document.getElementById('noCharactersMessage').style.display = 'block';
            return;
        }
        
        document.getElementById('noCharactersMessage').style.display = 'none';
        
        characters.forEach(characterData => {
            const characterCard = this.createCharacterCard(characterData);
            this.charactersGrid.appendChild(characterCard);
        });
    }

    createCharacterCard(characterData) {
        const characterCard = document.createElement('div');
        characterCard.className = 'character-card';
        
        characterCard.innerHTML = `
            <div class="character-header">
                <div class="character-name">${characterData.name}</div>
                <div class="character-level-info">
                    <div class="character-level">Ур. ${characterData.level}</div>
                    ${characterData.availableStatPoints > 0 ? 
                        '<div class="stat-points-indicator upgrade-available">+' + characterData.availableStatPoints + '</div>' : 
                        ''
                    }
                </div>
            </div>
            <div class="character-details">
                <div class="character-detail"><span>Раса:</span> <span>${characterData.race}</span></div>
                <div class="character-detail"><span>Здоровье:</span> <span>${characterData.hp}/${characterData.maxHp}</span></div>
                <div class="character-detail"><span>Мана:</span> <span>${characterData.mp}/${characterData.maxMp}</span></div>
                <div class="character-detail"><span>Саны:</span> <span>${characterData.personalSans}</span></div>
            </div>
            <div class="character-progress">
                <div class="progress-label">
                    <span>Опыт:</span>
                    <span>${characterData.exp}/${characterData.expForLevel}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill exp-fill" style="width: ${(characterData.exp / characterData.expForLevel) * 100}%"></div>
                </div>
            </div>
            <div class="character-actions">
                <button class="select-character-btn" data-character-id="${characterData.id}">Выбрать</button>
                <button class="delete-character-btn" data-character-id="${characterData.id}" data-character-name="${characterData.name}">Удалить</button>
            </div>
        `;
        
        characterCard.addEventListener('mouseenter', () => {
            const actions = characterCard.querySelector('.character-actions');
            if (actions) actions.style.display = 'flex';
        });
        
        characterCard.addEventListener('mouseleave', () => {
            const actions = characterCard.querySelector('.character-actions');
            if (actions) actions.style.display = 'none';
        });
        
        const selectBtn = characterCard.querySelector('.select-character-btn');
        selectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectCharacter(characterData);
        });
        
        const deleteBtn = characterCard.querySelector('.delete-character-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showDeleteConfirmation(characterData);
        });
        
        return characterCard;
    }

    selectCharacter(characterData) {
        this.gameManager.setCurrentCharacter(characterData.id);
        this.gameManager.loadCharacterIntoGame(characterData);
        this.showGameInterface();
    }

    showDeleteConfirmation(characterData) {
        const characterName = characterData.name;
        const userInput = prompt(`Для подтверждения удаления персонажа "${characterName}" введите его имя:`);
        
        if (userInput === characterName) {
            if (confirm(`Вы уверены, что хотите удалить персонажа "${characterName}"? Это действие нельзя отменить!`)) {
                this.deleteCharacter(characterData.id);
            }
        } else if (userInput !== null) {
            alert('Неверное имя персонажа! Удаление отменено.');
        }
    }

    deleteCharacter(characterId) {
        this.gameManager.characterManager.deleteCharacter(characterId);
        this.initCharactersGrid();
        
        if (this.gameManager.characterManager.currentCharacterId === characterId) {
            this.gameManager.player = null;
            this.showCharactersScreen();
        }
        
        alert('Персонаж успешно удален!');
    }

    createNewCharacter() {
        const nameInput = document.getElementById('characterName');
        const characterName = nameInput.value.trim();
        
        if (!characterName) {
            alert('Пожалуйста, введите имя персонажа');
            return;
        }
        
        if (!this.currentSelectedRace) {
            alert('Пожалуйста, выберите расу');
            return;
        }
        
        console.log('Создание персонажа:', characterName, this.currentSelectedRace);
        
        const characterData = this.gameManager.createCharacter(characterName, this.currentSelectedRace);
        this.gameManager.setCurrentCharacter(characterData.id);
        this.gameManager.loadCharacterIntoGame(characterData);
        this.showGameInterface();
        
        nameInput.value = '';
        this.currentSelectedRace = null;
        document.querySelectorAll('.race-option').forEach(option => {
            option.classList.remove('selected');
        });
    }

    showGameInterface() {
        this.hideAllScreens();
        const gameInterface = document.getElementById('gameInterface');
        if (gameInterface) {
            gameInterface.style.display = 'block';
        }
        this.gameManager.showBattleScreen();
        // Убираем вызов несуществующего метода
        // this.gameManager.updateCurrentCharacterDisplay();
    }

    updateSansDisplay() {
        const globalSans = this.gameManager.getGlobalSans();
        document.getElementById('sansCount').textContent = globalSans;
    }
}