export class SaveManager {
    constructor() {
        this.saveKey = 'rpgGameSave';
    }

    // Полная сохранка игры
    saveGame(gameState) {
        try {
            const saveData = {
                characters: gameState.characters,
                currentCharacterId: gameState.currentCharacterId,
                globalSans: gameState.globalSans,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };
            
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            return false;
        }
    }

    // Загрузка игры
    loadGame() {
        try {
            const saved = localStorage.getItem(this.saveKey);
            if (!saved) return null;
            
            return JSON.parse(saved);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            return null;
        }
    }

    // Удаление сохранения
    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            return true;
        } catch (error) {
            console.error('Ошибка удаления:', error);
            return false;
        }
    }

    // Проверка наличия сохранения
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    // Экспорт сохранения
    exportSave() {
        const saveData = this.loadGame();
        if (!saveData) return null;
        
        const dataStr = JSON.stringify(saveData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        return URL.createObjectURL(dataBlob);
    }

    // Импорт сохранения
    importSave(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const saveData = JSON.parse(e.target.result);
                    
                    // Валидация данных
                    if (!this.validateSaveData(saveData)) {
                        reject(new Error('Неверный формат сохранения'));
                        return;
                    }
                    
                    localStorage.setItem(this.saveKey, JSON.stringify(saveData));
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }

    // Валидация данных сохранения
    validateSaveData(saveData) {
        return saveData && 
               saveData.characters !== undefined &&
               saveData.globalSans !== undefined &&
               saveData.timestamp !== undefined;
    }

    // Получение информации о сохранении
    getSaveInfo() {
        const saveData = this.loadGame();
        if (!saveData) return null;
        
        return {
            characterCount: saveData.characters ? saveData.characters.length : 0,
            timestamp: saveData.timestamp,
            globalSans: saveData.globalSans,
            version: saveData.version || 'unknown'
        };
    }
}