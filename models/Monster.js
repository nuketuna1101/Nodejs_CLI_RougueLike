//================================================================================================================================
//================================================================================================================================
// Monster.js // 몬스터 클래스
//================================================================================================================================
//================================================================================================================================
import { EventEmitter } from 'events';
import { InitialStatData, InitialProbData, GameData, ActionStateType} from './data.js';

export class Monster extends EventEmitter {
    // private: stat vars
    #maxHp; #hp; #dmg; #armor;
    constructor(stage) {
        super();
        this.#maxHp = InitialStatData.monsterMaxHp + (stage - 1) * InitialStatData.monsterHpCoef;
        this.#hp = this.#maxHp;
        this.#dmg = InitialStatData.monsterDmg + (stage - 1) * InitialStatData.monsterDmgCoef;
        this.#armor = InitialStatData.monsterArmorInitAmount + (stage - 1) * InitialStatData.monsterArmorCoef;
    }
    attack(player, atkCoef = 1.0) {
        const tmpDmg = Math.round(this.#dmg * atkCoef);
        player.beAttacked(tmpDmg);
    }
    beAttacked(dmg){
        let processedDmg = Math.max(dmg - this.#armor, 0);
        this.#hp = Math.max(this.#hp - processedDmg, 0); 
        if (this.#hp <= 0){
            this.#die();
        }
    }
    // 치유: 치유량만큼 치유 (기본값: 기본 스테이지 클리어 치유량)
    heal(healAmount = Math.round(this.#maxHp / 10)){
        // 체력 회복: 최대체력보다 높을 순 없다.
        this.#hp = Math.min(this.#hp + healAmount, this.#maxHp);
    }
    // 사망
    #die(){
        this.emit('death', this);
    }
    get hp(){
        return this.#hp;
    }
    get dmg(){
        return this.#dmg;
    }
    get armor(){
        return this.#armor;
    }
}