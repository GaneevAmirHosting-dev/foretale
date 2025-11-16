export class ShopTabs {
    constructor(shopUI) {
        this.shopUI = shopUI;
        this.currentTab = 'characters';
        this.init();
    }

    init() {
        this.createTabs();
        this.showTab('characters');
    }

    createTabs() {
        const shopScreen = document.getElementById('shopScreen');
        
        // Создаем контейнер для вкладок
        const tabsContainer = document.createElement('div');
        tabsContainer.className = 'shop-tabs';
        tabsContainer.innerHTML = `
            <div class="shop-tab active" data-tab="characters">Персонажи</div>
            <div class="shop-tab" data-tab="items">Предметы</div>
            <div class="shop-tab" data-tab="skills">Умения</div>
        `;

        // Вставляем вкладки перед содержимым магазина
        const shopContent = shopScreen.querySelector('.shop-content');
        shopScreen.insertBefore(tabsContainer, shopContent);

        // Добавляем обработчики
        tabsContainer.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.showTab(tab.dataset.tab);
            });
        });
    }

    showTab(tabName) {
        // Обновляем активную вкладку
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Показываем соответствующее содержимое
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}Tab`).style.display = 'block';

        this.currentTab = tabName;
        
        // Загружаем содержимое вкладки
        switch(tabName) {
            case 'characters':
                this.shopUI.showCharactersTab();
                break;
            case 'items':
                this.showItemsTab();
                break;
            case 'skills':
                this.showSkillsTab();
                break;
        }
    }

    showItemsTab() {
        const itemsTab = document.getElementById('itemsTab');
        itemsTab.innerHTML = `
            <div class="tab-placeholder">
                <h3>Раздел в разработке</h3>
                <p>Скоро здесь появятся магические предметы!</p>
            </div>
        `;
    }

    showSkillsTab() {
        const skillsTab = document.getElementById('skillsTab');
        skillsTab.innerHTML = `
            <div class="tab-placeholder">
                <h3>Раздел в разработке</h3>
                <p>Скоро здесь появятся новые умения!</p>
            </div>
        `;
    }
}