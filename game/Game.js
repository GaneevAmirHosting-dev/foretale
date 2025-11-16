import { CharacterManager } from './managers/CharacterManager.js';
import { UIManager } from './managers/UIManager.js';
import { GameManager } from './core/GameManager.js';

export class Game {
    constructor() {
        this.characterManager = new CharacterManager();
        this.gameManager = new GameManager(this.characterManager);
        this.uiManager = new UIManager(this.gameManager);
        
        this.init();
    }

    async init() {
        try {
            // Загрузка данных игры
            await this.gameManager.loadGameData();
            
            // Инициализация UI - РАЗКОММЕНТИРУЙ ЭТУ СТРОКУ
            this.gameManager.initUI();
            
            // Запуск игры
            this.start();
            
        } catch (error) {
            console.error('Ошибка инициализации игры:', error);
        }
    }

    start() {
        console.log('Игра запущена!');
    }

    // Методы для внешнего использования
    getCharacterManager() {
        return this.characterManager;
    }

    getUIManager() {
        return this.uiManager;
    }

    getGameManager() {
        return this.gameManager;
    }
}