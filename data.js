//================================================================================================================================
//================================================================================================================================
//================================================================================================================================
// Player와 Monster 등의 초기화 값 데이터 : 하드코딩을 막기 위해
export const InitialStatData = {
    playerMaxHp: 100,
    playerDmg: 20,
    playerHealAmount: 10,
    playerArmorInitAmount: 5,
    playerArmorAddAmount: 15,
    monsterMaxHp: 50,
    monsterHpCoef: 10,
    monsterDmg: 10,
    monsterDmgCoef: 5,
    monsterArmorInitAmount: 5,
    monsterArmorAddAmount: 10,
};
// 확률값에 대한 초기화값 데이터 : -Prob 접미사 사용, x/100 값으로 백분율임
export const InitialProbData = {
    perfectBlockProb : 3,               // 완벽한 방어 확률

};
// 그 이외 중요한 초기 게임 데이터
export const GameData = {
    maxStageNum : 10,
};
// 액션타입
export const ActionStateType = {
    Basic : 'basic',
    Defense : 'defense',
    CounterAtk : 'counterAtk',
};

//================================================================================================================================
//================================================================================================================================