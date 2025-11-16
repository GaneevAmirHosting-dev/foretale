export class SettingsUI {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.settingsScreen = null;
        this.isListeningForKey = false;
        this.currentKeybind = null;
        
        this.init();
    }

    init() {
        this.createSettingsScreen();
        this.initEventListeners();
    }

    createSettingsScreen() {
        // Удаляем старый экран если есть
        const oldScreen = document.getElementById('settingsScreen');
        if (oldScreen) {
            oldScreen.remove();
        }

        // Создаем новый экран настроек
        const settingsScreen = document.createElement('div');
        settingsScreen.className = 'settings-screen';
        settingsScreen.id = 'settingsScreen';
        settingsScreen.style.display = 'none';
        
        settingsScreen.innerHTML = `
            <div class="settings-modal">
                <h2>⚙️ Настройки</h2>
                <div class="settings-tabs">
                    <button class="settings-tab active" data-tab="keybinds">Управление</button>
                    <button class="settings-tab" data-tab="audio">Аудио</button>
                    <button class="settings-tab" data-tab="graphics">Графика</button>
                </div>
                
                <div class="settings-content">
                    <!-- Вкладка управления -->
                    <div id="keybindsTab" class="tab-content active">
                        <h3>Настройки управления</h3>
                        <div class="keybinds-list" id="keybindsList">
                            <!-- Список привязок клавиш будет заполнен динамически -->
                        </div>
                        <div class="keybind-info">
                            <p>💡 Нажмите на кнопку с клавишей чтобы изменить привязку</p>
                            <p>🎮 Текущие горячие клавиши:</p>
                            <ul id="currentKeybindsList">
                                <!-- Список текущих привязок -->
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Вкладка аудио -->
                    <div id="audioTab" class="tab-content">
                        <div class="tab-placeholder">
                            <h3>Раздел в разработке</h3>
                            <p>Скоро здесь появятся настройки звука!</p>
                        </div>
                    </div>
                    
                    <!-- Вкладка графики -->
                    <div id="graphicsTab" class="tab-content">
                        <div class="tab-placeholder">
                            <h3>Раздел в разработке</h3>
                            <p>Скоро здесь появятся настройки графики!</p>
                        </div>
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button class="settings-btn" id="resetKeybindsBtn">Сбросить к стандартным</button>
                    <button class="settings-btn primary" id="closeSettingsBtn">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(settingsScreen);
        this.settingsScreen = document.getElementById('settingsScreen');
        this.updateKeybindsDisplay();
        
        console.log('Settings screen created');
    }

    initEventListeners() {
        // Обработчики вкладок
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('settings-tab')) {
                this.showTab(e.target.dataset.tab);
            }
        });

        // Кнопка закрытия
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeSettingsBtn') {
                this.hideSettings();
            }
        });

        // Кнопка сброса
        document.addEventListener('click', (e) => {
            if (e.target.id === 'resetKeybindsBtn') {
                this.resetKeybinds();
            }
        });

        // Глобальный обработчик для прослушивания клавиш
        document.addEventListener('keydown', (e) => {
            if (this.isListeningForKey && this.currentKeybind) {
                e.preventDefault();
                this.setKeybind(this.currentKeybind, e.code);
            }
        });

        // Клик вне модального окна закрывает его
        document.addEventListener('click', (e) => {
            if (e.target === this.settingsScreen) {
                this.hideSettings();
            }
        });

        // Обработчик для кнопок привязки клавиш (делегирование событий)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('keybind-btn')) {
                const action = e.target.dataset.action;
                if (action) {
                    this.startKeyListening(action);
                }
            }
        });
    }

    showTab(tabName) {
        console.log('Showing tab:', tabName);
        
        // Обновляем активную вкладку
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.settings-tab[data-tab="${tabName}"]`).classList.add('active');

        // Показываем соответствующее содержимое
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    updateKeybindsDisplay() {
        this.updateKeybindsList();
        this.updateCurrentKeybindsList();
    }

    updateKeybindsList() {
        const keybindsList = document.getElementById('keybindsList');
        if (!keybindsList) {
            console.error('Keybinds list element not found!');
            return;
        }

        let html = '';
        for (const [action, keyCode] of Object.entries(this.gameManager.keybinds)) {
            const description = this.gameManager.getKeybindDescription(action);
            const keyName = this.gameManager.getKeyName(keyCode);
            
            html += `
                <div class="keybind-item">
                    <span class="keybind-label">${description}</span>
                    <button class="keybind-btn" data-action="${action}">
                        ${keyName}
                    </button>
                </div>
            `;
        }

        keybindsList.innerHTML = html;
        console.log('Keybinds list updated');
    }

    updateCurrentKeybindsList() {
        const currentKeybindsList = document.getElementById('currentKeybindsList');
        if (!currentKeybindsList) {
            console.error('Current keybinds list element not found!');
            return;
        }

        let html = '';
        for (const [action, keyCode] of Object.entries(this.gameManager.keybinds)) {
            const description = this.gameManager.getKeybindDescription(action);
            const keyName = this.gameManager.getKeyName(keyCode);
            
            html += `<li><strong>${keyName}</strong> - ${description}</li>`;
        }

        currentKeybindsList.innerHTML = html;
    }

    startKeyListening(action) {
        console.log('Starting key listening for:', action);
        this.isListeningForKey = true;
        this.currentKeybind = action;
        
        const btn = document.querySelector(`[data-action="${action}"]`);
        if (btn) {
            btn.textContent = 'Нажмите клавишу...';
            btn.classList.add('listening');
        }
        
        // Добавляем обработчик для отмены по ESC
        const cancelListener = (e) => {
            if (e.code === 'Escape') {
                this.cancelKeyListening();
                document.removeEventListener('keydown', cancelListener);
            }
        };
        document.addEventListener('keydown', cancelListener);
        
        setTimeout(() => {
            document.removeEventListener('keydown', cancelListener);
            if (this.isListeningForKey) {
                this.cancelKeyListening();
            }
        }, 5000);
    }

    cancelKeyListening() {
        console.log('Canceling key listening');
        this.isListeningForKey = false;
        this.updateKeybindsDisplay();
        this.currentKeybind = null;
    }

    setKeybind(action, keyCode) {
        console.log('Setting keybind:', action, '->', keyCode);
        this.gameManager.keybinds[action] = keyCode;
        this.gameManager.saveKeybinds();
        this.isListeningForKey = false;
        this.currentKeybind = null;
        this.updateKeybindsDisplay();
        
        // Показываем уведомление об успешном изменении
        const description = this.gameManager.getKeybindDescription(action);
        const keyName = this.gameManager.getKeyName(keyCode);
        this.showNotification(`Клавиша для "${description}" изменена на ${keyName}`);
    }

    resetKeybinds() {
        if (confirm('Сбросить все привязки клавиш к стандартным?')) {
            this.gameManager.resetKeybinds();
            this.updateKeybindsDisplay();
            this.showNotification('Привязки клавиш сброшены к стандартным');
        }
    }

    showNotification(message) {
        // Создаем временное уведомление
        const notification = document.createElement('div');
        notification.className = 'settings-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showSettings() {
        console.log('Showing settings screen');
        if (this.settingsScreen) {
            this.settingsScreen.style.display = 'flex';
            this.updateKeybindsDisplay();
            console.log('Settings screen should be visible now');
        } else {
            console.error('Settings screen not found!');
        }
    }

    hideSettings() {
        console.log('Hiding settings screen');
        if (this.settingsScreen) {
            this.settingsScreen.style.display = 'none';
            this.cancelKeyListening();
        }
    }
}