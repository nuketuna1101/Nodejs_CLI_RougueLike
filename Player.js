//================================================================================================================================
//================================================================================================================================
// Player.js // 플레이어 클래스
//================================================================================================================================
//================================================================================================================================
import { EventEmitter } from 'events';
import { InitialStatData, InitialProbData, GameData, ActionStateType} from './data.js';

export class Player extends EventEmitter {
    // private: stat vars
    #maxHp; #hp; #dmg; #armor;

    // need state variable: basic, defense, counteratk
    #actionState;

    // 생성자
    constructor() {
        // eventemitter 초기화
        super();    
        // 스탯 초기화
        this.#maxHp = InitialStatData.playerMaxHp;
        this.#hp = this.#maxHp;
        this.#dmg = InitialStatData.playerDmg;
        this.#armor = InitialStatData.playerArmorInitAmount;
        this.#actionState = ActionStateType.Basic;
    }
    // 공격: 나의 데미지 전달
    attack(monster, atkCoef = 1.0) {
        const tmpDmg = Math.round(this.#dmg * atkCoef);
        monster.beAttacked(tmpDmg);
    }
    // 피격: 상대가 준 데미지에 대해 방어도 경감하여 적용
    beAttacked(dmg){
        // 체력 디스플레이 음수를 안 보이게 하기 위해 : .. 나중에 딱뎀 or 압살 같은거로 바꾸면 바꿔야함
        // 1차 피해 전처리 : 방어도에 의한 경감
        let processedDmg = Math.max(dmg - this.#armor, 0);
        switch(this.#actionState)
        {
            // 방어 상태일시, 완벽한 방어 발동 체크
            case ActionStateType.Defense:
                if (this.#isPerfectBlocked())
                {
                    this.emit('perfectBlock');
                    processedDmg = 0;
                }
                break;
            // 반격 상태일 시, 반격 로직 : 데미지 절반 경감
            case ActionStateType.CounterAtk:
                processedDmg = Math.round(processedDmg / 2);
                break;
            default :
                break;
        }
        // 실제 입은 데미지 반환
        this.emit('processedDmg', processedDmg);
        this.#hp = Math.max(this.#hp - processedDmg, 0); 

        if (this.#actionState === ActionStateType.CounterAtk) {
            this.emit('counterAtk');
        }
        if (this.#hp <= 0){
            /* 으앙 쥬금 */
            this.#die();
        }
    }
    // 치유: 치유량만큼 치유 (기본값: 기본 스테이지 클리어 치유량)
    heal(healAmount = InitialStatData.playerHealAmount){
        // 체력 회복: 최대체력보다 높을 순 없다.
        this.#hp = Math.min(this.#hp + healAmount, this.#maxHp);
    }
    // 액션상태 지정
    setActionState(targetActionState = ActionStateType.Basic){
        this.#actionState = targetActionState;
        switch(targetActionState)
        {
            // 1) basic : 일반 상태로 돌아오기
            case ActionStateType.Basic:
                this.#getArmorOrigin();           // 원래 방어도로 롤백
                break;
            // 2) defense : 방어도 증가
            case ActionStateType.Defense:
                this.#gainArmorTemp();           // 방어 태세 : 1턴동안 추가 방어도 획득
                break;
            case ActionStateType.CounterAtk:
                break;
            default :
                break;
        }
    }
    // 
    // 방어도 획득: 일시적인 획득 : 나중에 콜백되어 초기화된다
    #gainArmorTemp(armorAmount = InitialStatData.playerArmorAddAmount){
        this.#armor += armorAmount;
    }
    // 방어도 콜백
    #getArmorOrigin(){
        this.#armor = InitialStatData.playerArmorInitAmount;
    }
    // defense 상태 : 피격 시 일정확률로 완벽한 방어 발동
    #isPerfectBlocked(){
        return Math.random() <= (InitialProbData.perfectBlockProb / 100);
    }

    // 사망: 데스 이벤트 델리게이트
    #die(){
        this.emit('death', this);
    }
    // getter funcs
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