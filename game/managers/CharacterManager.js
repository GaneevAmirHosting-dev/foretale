export class CharacterManager {
    constructor() {
        this.characters = this.loadCharacters();
        this.currentCharacterId = this.loadCurrentCharacterId();
        this.globalSans = this.loadGlobalSans();
    }

    // Загрузка персонажей из localStorage
    loadCharacters() {
        try {
            const saved = localStorage.getItem('rpgCharacters');
            if (!saved) return [];
            
            const characters = JSON.parse(saved);
            // Добавляем регенерацию к существующим персонажам
            return characters.map(char => ({
                ...char,
                hpRegen: char.hpRegen || 1,
                mpRegen: char.mpRegen || 1,
                lastRegenTime: char.lastRegenTime || Date.now()
            }));
        } catch (e) {
            console.error('Error loading characters:', e);
            return [];
        }
    }

    // Загрузка ID текущего персонажа
    loadCurrentCharacterId() {
        return localStorage.getItem('currentCharacterId') || null;
    }

    // Загрузка глобальных сан
    loadGlobalSans() {
        try {
            const saved = localStorage.getItem('globalSans');
            return saved ? parseInt(saved) : 0;
        } catch (e) {
            console.error('Error loading global sans:', e);
            return 0;
        }
    }

    // Сохранение персонажей в localStorage
    saveCharacters() {
        try {
            localStorage.setItem('rpgCharacters', JSON.stringify(this.characters));
        } catch (e) {
            console.error('Error saving characters:', e);
        }
    }

    // Сохранение глобальных сан
    saveGlobalSans() {
        try {
            localStorage.setItem('globalSans', this.globalSans.toString());
        } catch (e) {
            console.error('Error saving global sans:', e);
        }
    }

    // Создание нового персонажа
    createCharacter(name, raceData) {
        const character = {
            id: Date.now().toString(),
            name: name.trim(),
            race: raceData.name,
            raceId: raceData.id,
            level: 1,
            exp: 0,
            expForLevel: 20,
            maxHp: raceData.baseHp,
            hp: raceData.baseHp,
            maxMp: raceData.baseMp,
            mp: raceData.baseMp,
            dmg: raceData.baseDmg,
            availableStatPoints: 0,
            spentStatPoints: 0,
            hpRegen: raceData.bonuses?.hpRegen || 1,
            mpRegen: raceData.bonuses?.mpRegen || 1,
            lastRegenTime: Date.now(),
            levelUpConfig: raceData.levelUp || {
                hpGain: 25,
                mpGain: 15,
                dmgGain: 5,
                statPoints: 5
            },
            bonuses: raceData.bonuses || {},
            personalSans: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.characters.push(character);
        this.saveCharacters();
        
        return character;
    }

    // Регенерация здоровья и маны
    regenerateCharacter(characterId) {
        const character = this.getCharacter(characterId);
        if (!character) return;
        
        const now = Date.now();
        const timeDiff = now - character.lastRegenTime;
        
        // Регенерация каждую секунду
        if (timeDiff >= 1000) {
            const regenCycles = Math.floor(timeDiff / 1000);
            
            // Восстанавливаем HP
            character.hp = Math.min(character.maxHp, character.hp + (character.hpRegen * regenCycles));
            
            // Восстанавливаем MP
            character.mp = Math.min(character.maxMp, character.mp + (character.mpRegen * regenCycles));
            
            character.lastRegenTime = now;
            this.saveCharacters();
        }
    }

    // Полное восстановление при уровне
    fullRestoreOnLevelUp(characterId) {
        const character = this.getCharacter(characterId);
        if (character) {
            character.hp = character.maxHp;
            character.mp = character.maxMp;
            this.saveCharacters();
        }
    }

    // Получение персонажа по ID
    getCharacter(id) {
        return this.characters.find(char => char.id === id);
    }

    // Получение текущего персонажа
    getCurrentCharacter() {
        return this.currentCharacterId ? this.getCharacter(this.currentCharacterId) : null;
    }

    // Получение данных текущего персонажа
    getCurrentCharacterData() {
        return this.getCharacter(this.currentCharacterId);
    }

    // Установка текущего персонажа
    setCurrentCharacter(id) {
        this.currentCharacterId = id;
        try {
            localStorage.setItem('currentCharacterId', id);
        } catch (e) {
            console.error('Error saving current character ID:', e);
        }
    }

    // Обновление прогресса персонажа
    updateCharacterProgress(characterData) {
        const character = this.getCharacter(characterData.id);
        if (character) {
            character.level = characterData.level;
            character.exp = characterData.exp;
            character.expForLevel = characterData.expForLevel;
            character.maxHp = characterData.maxHp;
            character.hp = characterData.hp;
            character.maxMp = characterData.maxMp;
            character.mp = characterData.mp;
            character.dmg = characterData.dmg;
            character.availableStatPoints = characterData.availableStatPoints;
            character.spentStatPoints = characterData.spentStatPoints;
            character.personalSans = characterData.personalSans;
            character.hpRegen = characterData.hpRegen || character.hpRegen;
            character.mpRegen = characterData.mpRegen || character.mpRegen;
            character.updatedAt = new Date().toISOString();
            
            this.saveCharacters();
        }
    }

    // Добавление сан персонажу
    addSansToCharacter(characterId, amount) {
        const character = this.getCharacter(characterId);
        if (character) {
            character.personalSans += amount;
            this.saveCharacters();
        }
    }

    // Добавление глобальных сан
    addGlobalSans(amount) {
        this.globalSans += amount;
        this.saveGlobalSans();
    }

    // Трата глобальных сан
    spendGlobalSans(amount) {
        if (this.globalSans >= amount) {
            this.globalSans -= amount;
            this.saveGlobalSans();
            return true;
        }
        return false;
    }

    // Получение глобальных сан
    getGlobalSans() {
        return this.globalSans;
    }

    // Удаление персонажа
    deleteCharacter(id) {
        this.characters = this.characters.filter(char => char.id !== id);
        if (this.currentCharacterId === id) {
            this.currentCharacterId = null;
            localStorage.removeItem('currentCharacterId');
        }
        this.saveCharacters();
    }

    // Получение всех персонажей
    getAllCharacters() {
        return this.characters.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    // Проверка существования персонажей
    hasCharacters() {
        return this.characters.length > 0;
    }

    // Восстановление здоровья и маны персонажа
    restoreCharacter(characterId) {
        const character = this.getCharacter(characterId);
        if (character) {
            character.hp = character.maxHp;
            character.mp = character.maxMp;
            this.saveCharacters();
        }
    }

    // Получение количества персонажей
    getCharacterCount() {
        return this.characters.length;
    }

    // Очистка всех сохранений
    clearAllData() {
        this.characters = [];
        this.currentCharacterId = null;
        this.globalSans = 0;
        
        localStorage.removeItem('rpgCharacters');
        localStorage.removeItem('currentCharacterId');
        localStorage.removeItem('globalSans');
    }

    // Получение статистики персонажей
    getCharactersStats() {
        return {
            totalCharacters: this.characters.length,
            totalLevels: this.characters.reduce((sum, char) => sum + char.level, 0),
            averageLevel: this.characters.length > 0 ? 
                Math.round(this.characters.reduce((sum, char) => sum + char.level, 0) / this.characters.length) : 0,
            totalSans: this.characters.reduce((sum, char) => sum + char.personalSans, 0) + this.globalSans
        };
    }
}