import { LevelSystem } from './LevelSystem.js';

export class Monster {
    constructor(monsterData) {
        this.id = monsterData.id;
        this.name = monsterData.name;
        this.type = monsterData.type;
        this.maxHp = monsterData.hp;
        this.hp = monsterData.hp;
        this.maxMp = monsterData.mp;
        this.mp = monsterData.mp;
        this.dmg = monsterData.dmg;
        this.xpDrop = monsterData.xpDrop;
        this.specialAttack = monsterData.specialAttack;
        this.locations = monsterData.locations || [];
    }
    
    attack(target) {
        let damage = this.dmg;
        let message = `${this.name} атакует и наносит ${damage} урона!`;
        
        // Проверка на специальную атаку
        if (this.specialAttack && this.mp >= this.specialAttack.mpCost) {
            this.mp -= this.specialAttack.mpCost;
            damage += this.specialAttack.bonusDmg;
            message = `${this.name} использует ${this.specialAttack.name} и наносит ${damage} урона!`;
        }
        
        target.hp -= damage;
        return message;
    }
    
    takeDamage(damage) {
        this.hp -= damage;
        if (this.hp < 0) this.hp = 0;
        return this.hp <= 0;
    }
    
    isAlive() {
        return this.hp > 0;
    }
}