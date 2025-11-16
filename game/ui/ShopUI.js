export class ShopUI {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.shopScreen = document.getElementById('shopScreen');
        
        this.init();
    }

    init() {
        this.createShopStructure();
        this.initEventListeners();
    }

    createShopStructure() {
        if (!this.shopScreen) {
            console.error('Shop screen element not found!');
            return;
        }

        this.shopScreen.innerHTML = `
            <h2>🛒 Магазин</h2>
            <div class="shop-tabs">
                <div class="shop-tab active" data-tab="characters">Персонажи</div>
                <div class="shop-tab" data-tab="items">Предметы</div>
                <div class="shop-tab" data-tab="skills">Умения</div>
            </div>
            <div class="shop-content">
                <div id="charactersTab" class="tab-content active">
                    <!-- Содержимое вкладки персонажей -->
                </div>
                <div id="itemsTab" class="tab-content">
                    <div class="tab-placeholder">
                        <h3>Раздел в разработке</h3>
                        <p>Скоро здесь появятся магические предметы!</p>
                    </div>
                </div>
                <div id="skillsTab" class="tab-content">
                    <div class="tab-placeholder">
                        <h3>Раздел в разработке</h3>
                        <p>Скоро здесь появятся новые умения!</p>
                    </div>
                </div>
            </div>
            <div class="shop-actions">
                <button class="back-btn" id="backFromShopBtn">Назад к бою</button>
            </div>
        `;

        // Сразу показываем вкладку персонажей
        this.showCharactersTab();
    }

    initEventListeners() {
        // Обработчики вкладок магазина
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('shop-tab')) {
                this.showShopTab(e.target.dataset.tab);
            }
        });

        // Кнопка назад из магазина
        document.addEventListener('click', (e) => {
            if (e.target.id === 'backFromShopBtn') {
                this.gameManager.showBattleScreen();
            }
        });
    }

    showShopTab(tabName) {
        console.log('Showing shop tab:', tabName);
        
        // Обновляем активную вкладку
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`.shop-tab[data-tab="${tabName}"]`).classList.add('active');

        // Показываем соответствующее содержимое
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Загружаем содержимое вкладки
        switch(tabName) {
            case 'characters':
                this.showCharactersTab();
                break;
            case 'items':
                // Уже заполнено в HTML
                break;
            case 'skills':
                // Уже заполнено в HTML
                break;
        }
    }

    showCharactersTab() {
        const charactersTab = document.getElementById('charactersTab');
        if (!charactersTab) return;

        charactersTab.innerHTML = `
            <div class="shop-section">
                <h3>🦸 Доступные расы</h3>
                <div class="shop-items-grid" id="shopCharactersGrid">
                    <!-- Персонажи будут загружены динамически -->
                </div>
            </div>
        `;

        this.loadShopCharacters();
    }

    loadShopCharacters() {
        const shopCharactersGrid = document.getElementById('shopCharactersGrid');
        if (!shopCharactersGrid) return;

        shopCharactersGrid.innerHTML = '<div class="loading">Загрузка рас...</div>';
        
        setTimeout(() => {
            const shopData = this.gameManager.getShopData();
            const playerSans = this.gameManager.getCurrentCharacter()?.personalSans || 0;

            let html = '';
            shopData.characters.forEach(shopItem => {
                const raceData = this.gameManager.getRaceData(shopItem.id);
                if (raceData) {
                    const shopItemElement = this.createShopCharacterItem(shopItem, raceData, playerSans);
                    html += shopItemElement;
                }
            });

            shopCharactersGrid.innerHTML = html || '<div class="no-items">Нет доступных рас</div>';
        }, 100);
    }

    createShopCharacterItem(shopItem, raceData, playerSans) {
        const isPurchased = shopItem.isPurchased;
        const canAfford = playerSans >= shopItem.price;
        
        return `
            <div class="shop-character-item ${isPurchased ? 'purchased' : ''} ${!isPurchased && !canAfford ? 'cannot-afford' : ''}">
                <div class="character-card-shop">
                    <div class="character-header-shop">
                        <div class="character-name-shop">${raceData.name}</div>
                        <div class="character-status">
                            ${isPurchased ? 
                                '<span class="status-purchased">✓ Куплено</span>' : 
                                `<span class="status-price">${shopItem.price} санов</span>`
                            }
                        </div>
                    </div>
                    <div class="character-description-shop">${raceData.description}</div>
                    <div class="character-stats-shop">
                        <div class="stat-row">
                            <span>❤️ Здоровье:</span>
                            <span>${raceData.baseHp}</span>
                        </div>
                        <div class="stat-row">
                            <span>🔮 Мана:</span>
                            <span>${raceData.baseMp}</span>
                        </div>
                        <div class="stat-row">
                            <span>⚔️ Урон:</span>
                            <span>${raceData.baseDmg}</span>
                        </div>
                        <div class="stat-row">
                            <span>🩸 Реген HP:</span>
                            <span>${raceData.hpRegen || 1}/сек</span>
                        </div>
                        <div class="stat-row">
                            <span>💫 Реген MP:</span>
                            <span>${raceData.mpRegen || 1}/сек</span>
                        </div>
                    </div>
                    ${!isPurchased ? `
                        <div class="character-bonuses">
                            <strong>🎁 Бонусы:</strong>
                            ${Object.entries(raceData.bonuses || {}).map(([key, value]) => 
                                `<div class="bonus-item">${this.getBonusName(key)}: ${value}</div>`
                            ).join('')}
                        </div>
                        <button class="buy-character-btn ${!canAfford ? 'disabled' : ''}" 
                                data-item-id="${shopItem.id}" 
                                ${!canAfford ? 'disabled' : ''}>
                            ${!canAfford ? '❌ Недостаточно санов' : '💰 Купить'}
                        </button>
                    ` : `
                        <div class="purchased-overlay">
                            <span>✅ Доступно для создания</span>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    getBonusName(bonusKey) {
        const names = {
            'hpRegen': '❤️ Регенерация HP',
            'mpRegen': '💫 Регенерация MP',
            'criticalChance': '🎯 Шанс крита',
            'dodgeChance': '🌀 Уклонение',
            'spellPower': '🔮 Сила заклинаний',
            'armor': '🛡️ Броня',
            'lifesteal': '🩸 Вампиризм',
            'nightPower': '🌙 Ночная сила',
            'stunResistance': '💪 Сопр. оглушению',
            'manaShield': '✨ Магический щит'
        };
        return names[bonusKey] || bonusKey;
    }

    showShopScreen() {
        console.log('Showing shop screen');
        
        // Скрываем все экраны
        const screens = [
            'battleScreen', 
            'locationScreen', 
            'charactersScreen', 
            'characterCreationScreen',
            'settingsScreen'
        ];
        
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) screen.style.display = 'none';
        });
        
        // Показываем магазин
        if (this.shopScreen) {
            this.shopScreen.style.display = 'block';
            this.showCharactersTab();
        }
    }
}