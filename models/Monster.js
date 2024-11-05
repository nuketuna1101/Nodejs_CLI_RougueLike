//================================================================================================================================
//================================================================================================================================
// Monster.js // 몬스터 클래스
//================================================================================================================================
//================================================================================================================================
import { EventEmitter } from 'events';
import { InitialStatData, InitialProbData, GameData, ActionStateType} from './data.js';

export class Monster extends EventEmitter {
    // private: stat vars
    #maxHp; #hp; #dmg;
    constructor(stage) {
        super();
        this.#maxHp = InitialStatData.monsterMaxHp + (stage - 1) * InitialStatData.monsterHpCoef;
        this.#hp = this.#maxHp;
        this.#dmg = InitialStatData.monsterDmg + (stage - 1) * InitialStatData.monsterDmgCoef;
    }

    attack(player) {
        // 몬스터의 공격
        player.beAttacked(this.#dmg);
    }
    beAttacked(dmg){
        this.#hp = Math.max(this.#hp - dmg, 0); 
        if (this.#hp <= 0){
            /* 으앙 쥬금 */
            this.#die();
        }
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
}