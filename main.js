import { Game } from './game/Game.js';

// Запуск игры после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.rpgGame = new Game();
});