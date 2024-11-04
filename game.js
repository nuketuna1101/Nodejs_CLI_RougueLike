import chalk from 'chalk';
import readlineSync from 'readline-sync';
import readline from 'readline';
import { EventEmitter } from 'events';

class Player extends EventEmitter {
    // private: stat vars
    #hp; #dmg;
    // 생성자
    constructor() {
        // eventemitter 초기화
        super();    
        // 스탯 초기화
        this.#hp = 100;
        this.#dmg = 30;
    }

    // 
    

    attack(monster) {
        // 플레이어의 공격
        monster.beAttacked(this.#dmg);
    }
    beAttacked(dmg){
        this.#hp -= dmg;
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
        this.#hp -= dmg;
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
// 플레이어 정보, 몬스터 정보
function displayStatus(stage, player, monster) {
    console.log(chalk.magentaBright(`\n=== Current Status ===`));
    console.log(
        chalk.cyanBright(`| Stage: ${stage} \n`) +
        chalk.blueBright(
            `| Player Stat: HP : ${player.hp}} Atk: ${player.dmg}\n`
        ) +
        chalk.redBright(
            `| Monster Stat: HP : ${monster.hp}} Atk: ${monster.dmg}`
        ),
    );
    console.log(chalk.magentaBright(`=====================\n`));
}
// 시간 지연을 위한
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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



    // 턴제 전투 로직
    while (player.hp > 0) {
        // 콘솔창 초기화 후 그리기
        console.clear();
        displayStatus(stage, player, monster);
        displayLog(log_actionHistory);

        // 사용자 턴 입력 받기
        await flowPlayerTurn(stage, player, monster, log_actionHistory);

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

    if (!isMonsterAlive){
        // 몬스터를 처치한 스테이지 클리어 flow
        const loopTime = 5;
        const delayTime = 250;
        let curLoop = loopTime;
        while(curLoop-- > 0){
            console.clear();
            displayStatus(stage, player, monster);
            displayLog(log_actionHistory);
            console.log(chalk.black.bgWhite(`stage ${stage} 몬스터를 무찔렀다!`));
            await delay(delayTime); 
            console.clear();
            displayStatus(stage, player, monster);
            displayLog(log_actionHistory);
            console.log(chalk.white.bgBlack(`stage ${stage} 몬스터를 무찔렀다!`));
            await delay(delayTime); 
        }
        return;
    }

    if(!isPlayerAlive){
        // 플레이어가 사망한 경우
        const loopTime = 5;
        const delayTime = 250;
        let curLoop = loopTime;
        while(curLoop-- > 0){
            console.clear();
            displayStatus(stage, player, monster);
            displayLog(log_actionHistory);
            console.log(chalk.black.bgRed(`GAME OVER  stage ${stage}`));
            await delay(delayTime); 
            console.clear();
            displayStatus(stage, player, monster);
            displayLog(log_actionHistory);
            console.log(chalk.red.bgBlack(`GAME OVER  stage ${stage}`));
            await delay(delayTime); 
        }
        return;
    }

};

// targetLogs 배열에 대한 로그 출력
function displayLog(targetLogs){
    targetLogs.forEach((log) => {console.log(log)});
}

// 플레이어 턴 액션 : 공격, 대기 2가지 선택지 현재는
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
            logs.push(chalk.green(`[${choice} 선택됨] :: `) + chalk.white.bgGreen(`>공격>`) + chalk.yellow(` ${player.dmg}의 피해를 줌`));
            player.attack(monster);
            break;
        case '2':
            logs.push(chalk.green(`${choice}를 선택하셨습니다.`));
            break;
        default:
            logs.push(warnMsg);
    }
}
// 몬스터 턴 액션 : 우선은 공격으로 고정
async function flowMonsterTurn(stage, player, monster, logs){
    /* todo: 몬스터 공격 flow */
    await delay(500); 
    console.log(chalk.yellow("몬스터 행동 선택 중..."));
    await delay(500); 
    monster.attack(player);
    logs.push(chalk.red('[상대 턴]  :: ') + chalk.white.bgRed(`>공격>`) + chalk.yellow(` ${monster.dmg}의 피해를 받음`));
}

// server.js에서 export되는 게임 시작 함수
export async function startGame() {
    console.clear();
    const player = new Player();
    let stage = 1;

    while (stage <= 10) {
        const monster = new Monster(stage);
        await battle(stage, player, monster);

        // 스테이지 클리어 및 게임 종료 조건

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