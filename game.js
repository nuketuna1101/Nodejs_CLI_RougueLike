import chalk from 'chalk';
import readlineSync from 'readline-sync';
import readline from 'readline';
import { EventEmitter } from 'events';

//================================================================================================================================
//================================================================================================================================
//================================================================================================================================
// Player와 Monster 등의 초기화 값 데이터 : 하드코딩을 막기 위해
const InitialStatData = {
    playerMaxHp: 100,
    playerDmg: 30,
    playerHealAmount: 10,

};

//================================================================================================================================
//================================================================================================================================
//================================================================================================================================
// Player와 Monster 클래스

class Player extends EventEmitter {
    // private: stat vars
    #maxHp; #hp; #dmg;
    // 생성자
    constructor() {
        // eventemitter 초기화
        super();    
        // 스탯 초기화
        this.#maxHp = InitialStatData.playerMaxHp;
        this.#hp = this.#maxHp;
        this.#dmg = InitialStatData.playerDmg;
    }

    attack(monster) {
        // 플레이어의 공격
        monster.beAttacked(this.#dmg);
    }
    beAttacked(dmg){
        // 체력 디스플레이 음수를 안 보이게 하기 위해 : .. 나중에 딱뎀 or 압살 같은거로 바꾸면 바꿔야함
        this.#hp = Math.max(this.#hp - dmg, 0); 
        if (this.#hp <= 0){
            /* 으앙 쥬금 */
            this.#die();
        }
    }
    heal(healAmount = InitialStatData.playerHealAmount){
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
}

class Monster extends EventEmitter {
    #hp;
    #dmg;
    constructor(stage) {
        super();
        this.#hp = 50 + 20 * stage;
        this.#dmg = 10 + 10 * stage;
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
//================================================================================================================================
//================================================================================================================================
//================================================================================================================================


// 플레이어 정보, 몬스터 정보
function displayStatus(stage, player, monster) {
    console.log(chalk.magentaBright(`\n=== Current Status ================`));
    console.log(
        chalk.cyanBright(`| Stage: ${stage} \n`) +
        chalk.blueBright(
            `| Player Stat: HP : ${player.hp}} Atk: ${player.dmg}\n`
        ) +
        chalk.redBright(
            `| Monster Stat: HP : ${monster.hp}} Atk: ${monster.dmg}`
        ),
    );
    console.log(chalk.magentaBright(`===================================\n`));
};
// 전투 씬
const battle = async (stage, player, monster) => {
    // 플레이어 및 몬스터의 액션 로그에 대한 히스토리를 저장하는 공간
    let log_actionHistory = [];

    // 플레이어 및 몬스터의 상태 플래그
    let isPlayerAlive = true;
    let isMonsterAlive = true;

    // 이벤트 리스너 등록
    player.on('death', () => {
        console.log(`플레이어 쥬금.`);
        isPlayerAlive = false;
    });
    monster.on('death', () => {
        console.log(`몬스터가 처치되었다.`);
        isMonsterAlive = false;
    });

    // 스테이지 적과 최초 조우 시 콘솔창
    await displayInstantTextAnim("앗, 야생의 몬스터가 나타났다.", 1000);

    // 턴제 전투 로직
    while (player.hp > 0) {
        // 콘솔창 초기화 후 그리기
        console.clear();
        displayStatus(stage, player, monster);
        displayLog(log_actionHistory);

        // 사용자 턴 입력 받기
        const isPlayerInputValid = await flowPlayerTurn(stage, player, monster, log_actionHistory);
        // 사용자 턴 입력 올바르지 않으면 다시
        if (!isPlayerInputValid)
            continue;

        if (!isMonsterAlive)
            break;

        // 콘솔창 초기화 후 다시 그리기
        console.clear();
        displayStatus(stage, player, monster);
        displayLog(log_actionHistory);

        await flowMonsterTurn(stage, player, monster, log_actionHistory);

        if (!isPlayerAlive)
            break;
    }
    const callbacks = [() => displayStatus(stage, player, monster), () => displayLog(log_actionHistory)];
    // 플레이어가 사망한 경우
    if(!isPlayerAlive){
        await displayInstantTextAnim(chalk.black.bgWhite(`stage ${stage} 플레이어 사망하셨습니다.`), 2000, callbacks);
        return;
    }
    // 몬스터 처치 완료한 경우
    if (!isMonsterAlive){
        await displayInstantTextAnim(chalk.black.bgWhite(`stage ${stage} 몬스터를 무찔렀다!`), 2000, callbacks);

        // 스테이지 클리어 시, 마지막 스테이지를 제외하고 피를 회복하자.
        const stageClearHealAmount = 10;
        if (stage < MaxStageNum){
            await displayInstantTextAnim(chalk.green.bgWhite(`[sys] 스테이지를 클리어하여 ${stageClearHealAmount}만큼의 체력을 회복했다!`), 2000, callbacks);
            player.heal();
            await displayInstantTextAnim(chalk.green.bgWhite(`[sys] 현재 체력 ${player.hp}`), 2000, callbacks);
        }
        return;
    }


}

// 시간 지연을 위한
async function delay(duration) {
    await new Promise((resolve) => setTimeout(resolve, duration));
};
// targetLogs 배열에 대한 로그 출력
function displayLog(targetLogs){
    targetLogs.forEach((log) => {console.log(log)});
};
// 콘솔창에 텍스트를 전부 지우고 애니메이션으로 띄움
async function displayInstantTextAnim(text, duration, prevConsoleFunctions = null) {
    return new Promise((resolve) => {
        const showTime = duration / (text.length * 2);
        let index = 0;

        // 배경색을 설정하기 위한 변수
        const originalStyle = chalk.reset; // 원래 스타일 저장
        
        // 문자열 나타내기
        const showInterval = setInterval(() => {
            if (index < text.length) {
                console.clear();
                // 인자로 받은 함수들 실행
                prevConsoleFunctions?.forEach(func => {
                    func();
                });
                console.log(originalStyle(text.slice(0, ++index))); // 원래 스타일 적용
            } else {
                clearInterval(showInterval);
                let revIndex = text.length - 1;
                const hideInterval = setInterval(() => {
                    console.clear();
                    // 인자로 받은 함수들 실행
                    prevConsoleFunctions?.forEach(func => {
                        func();
                    });
                    console.log(originalStyle(text.slice(0, revIndex))); // 원래 스타일 적용
                    revIndex--;
                    // exit animation
                    if (revIndex < 0) {
                        clearInterval(hideInterval);
                        resolve(); // 애니메이션 완료 시 Promise 해결
                    }
                }, showTime);
            }
        }, showTime);
    });
};
// 콘솔창에 텍스트를 전부 지우고 애니메이션으로 띄움
async function displayTextAnim(text, duration, prevConsoleFunctions = null) {
    return new Promise((resolve) => {
        const showTime = duration / text.length;
        let index = 0;
        // 배경색을 설정하기 위한 변수
        const originalStyle = chalk.reset; // 원래 스타일 저장
        
        // 문자열 나타내기
        const showInterval = setInterval(() => {
            if (index < text.length) {
                console.clear();
                // 인자로 받은 함수들 실행
                prevConsoleFunctions?.forEach(func => {
                    func();
                });
                console.log(originalStyle(text.slice(0, ++index))); // 원래 스타일 적용
            } else {
                clearInterval(showInterval);
            }
        }, showTime);
    });
};
// 플레이어 턴 액션 : 공격, 대기 2가지 선택지 현재는
// 플레이어 입력의 유효성 반환
async function flowPlayerTurn(stage, player, monster, logs){
    const warnMsg = chalk.red(`올바른 선택을 하세요.`);
    if (logs.length > 0 && logs[logs.length - 1].includes(warnMsg)) {
        logs.pop();
    }
    console.log(
        chalk.green(
            `\n1. 공격한다 2. 아무것도 하지않는다.`,
        ),
    );
    const choice = readlineSync.question('[Player Turn] ::> select your choice ::>  ');
    // 입력 후 마지막 한 줄 지우기
    readline.cursorTo(process.stdout, 0);    // 커서를 줄의 시작으로 이동
    readline.clearLine(process.stdout, 0);   // 현재 줄을 지움
    // 플레이어의 선택에 따라 다음 행동 처리
    switch (choice) {
        case '1':
            logs.push(chalk.green(`[${choice} 선택됨] :: `) + chalk.white.bgGreen(`>공격>`) + chalk.yellow(` << ${player.dmg}의 피해를 줌`));
            player.attack(monster);
            return true;
        case '2':
            logs.push(chalk.green(`[${choice} 선택됨] :: `));
            return true;
        default:
            logs.push(warnMsg);
    }
    return false;
};
// 몬스터 턴 액션 : 우선은 공격으로 고정
async function flowMonsterTurn(stage, player, monster, logs){
    const callbacks = [() => displayStatus(stage, player, monster), () => displayLog(logs)];
    await displayInstantTextAnim(chalk.yellow("몬스터 행동 선택 중..."), 1000, callbacks);
    monster.attack(player);
    logs.push(chalk.red('[상대 턴]  :: ') + chalk.white.bgRed(`>공격>`) + chalk.yellow(` >> ${monster.dmg}의 피해를 받음`));
};

const MaxStageNum = 10;

// server.js에서 export되는 게임 시작 함수
export async function startGame() {
    console.clear();
    const player = new Player();
    let stage = 1;

    while (stage <= MaxStageNum) {
        const monster = new Monster(stage);
        await battle(stage, player, monster);

        // 스테이지 클리어 및 게임 종료 조건
        if (!player.hp)
            break;
        
        stage++;
    }
}





//================================================================================================================================
//================================================================================================================================
//================================================================================================================================
// EVENT EMITTER 이벤트 리스너

// player.on('death', (actor) => {
//     console.log("으앙 플레이어 쥬금");
// });


// monster.on('death', (actor) => {
//     console.log("으앙 플레이어 쥬금");
// });

//================================================================================================================================
//================================================================================================================================
//================================================================================================================================