import chalk from 'chalk';
import readlineSync from 'readline-sync';
import readline from 'readline';
import { Player } from './Player.js';
import { Monster } from './Monster.js';
import { InitialStatData, InitialProbData, GameData, ActionStateType} from './data.js';
import { displayStatus, displayLog, displayTextAnim } from './display.js';
/* to do:  파일 분리 + 스테이지 등 다른 클래스 객체화 */


// 전투 씬
const battle = async (stage, player, monster) => {
    // 플레이어 및 몬스터의 액션 로그에 대한 히스토리를 저장하는 공간
    let log_actionHistory = [];

    // 플레이어 및 몬스터의 상태 플래그
    let isPlayerAlive = true;
    let isMonsterAlive = true;

    // 이벤트 리스너 등록
    player.on('death', () => {
        isPlayerAlive = false;
    });
    monster.on('death', () => {
        isMonsterAlive = false;
    });

    // 스테이지 적과 최초 조우 시 콘솔창
    await displayTextAnim("앗, 야생의 몬스터가 나타났다.", 1000);

    // 턴제 전투 로직
    while (player.hp > 0) {
        // +----------------------------------+ Player 턴 시작 +-----------------------------------
        // 콘솔창 초기화 후 그리기
        console.clear();
        displayStatus(stage, player, monster);
        displayLog(log_actionHistory);

        // player의 actionState=> basic으로 초기화 (턴이 종료되고 새 턴을 시작하므로)
        player.setActionState();

        // 사용자 턴 입력 받기
        const isPlayerInputValid = await flowPlayerTurn(stage, player, monster, log_actionHistory);
        // 사용자 턴 입력 올바르지 않으면 다시
        if (!isPlayerInputValid)
            continue;
        // 몬스터 생존 확인
        if (!isMonsterAlive)
            break;
        // -----------------------------------+ Player 턴 종료 +----------------------------------+ 

        // +----------------------------------+ Monster 턴 시작 +-----------------------------------

        // 콘솔창 초기화 후 다시 그리기
        console.clear();
        displayStatus(stage, player, monster);
        displayLog(log_actionHistory);

        await flowMonsterTurn(stage, player, monster, log_actionHistory);
        // 플레이어 생존 확인
        if (!isPlayerAlive)
            break;
        // -----------------------------------+ Monster 턴 종료 +----------------------------------+ 
    }
    // 상태와 액션 로그 내용위해
    const callbacks = [() => displayStatus(stage, player, monster), () => displayLog(log_actionHistory)];
    // 플레이어가 사망한 경우
    if(!isPlayerAlive){
        await displayTextAnim(chalk.black.bgWhite(`stage ${stage} 플레이어 사망하셨습니다.`), 2000, callbacks);
        return;
    }
    // 몬스터 처치 완료한 경우
    if (!isMonsterAlive){
        await displayTextAnim(chalk.black.bgWhite(`stage ${stage} 몬스터를 무찔렀다!`), 2000, callbacks);
        // 스테이지 클리어 시, 마지막 스테이지를 제외하고 피를 회복하자.
        const stageClearHealAmount = 10;
        if (stage < GameData.maxStageNum){
            await displayTextAnim(chalk.green.bgWhite(`[sys] 스테이지를 클리어하여 ${stageClearHealAmount}만큼의 체력을 회복했다!`), 2000, callbacks);
            player.heal();
            await displayTextAnim(chalk.green.bgWhite(`[sys] 현재 체력 ${player.hp}`), 2000, callbacks);
        }
        return;
    }
}

// 시간 지연을 위한
async function delay(duration) {
    await new Promise((resolve) => setTimeout(resolve, duration));
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
            `\n1. 공격 2. 방어 3. 반격 `,
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
            logs.push(chalk.green(`[${choice} 선택됨] :: `) + chalk.white.bgGreen(`>방어>`) + chalk.yellow(` << ${player.armor} 방어도 증가`));
            player.setActionState(ActionStateType.Defense);
            //player.gainArmorTemp();
            return true;
        case '3':
            logs.push(chalk.green(`[${choice} 선택됨] :: `) + chalk.white.bgGreen(`>방어>`) + chalk.yellow(` << ${player.armor} 방어도 증가`));
            player.setActionState(ActionStateType.CounterAtk);
            //player.gainArmorTemp();
            return true;
        default:
            logs.push(warnMsg);
    }
    return false;
};
// 몬스터 턴 액션 : 우선은 공격으로 고정
async function flowMonsterTurn(stage, player, monster, logs){
    const callbacks = [() => displayStatus(stage, player, monster), () => displayLog(logs)];
    await displayTextAnim(chalk.yellow("몬스터 행동 선택 중..."), 1000, callbacks);
    monster.attack(player);
    logs.push(chalk.red('[상대 턴]  :: ') + chalk.white.bgRed(`>공격>`) + chalk.yellow(` >> ${monster.dmg}의 피해를 받음`));
};

// server.js에서 export되는 게임 시작 함수
export async function startGame() {
    console.clear();
    const player = new Player();
    let stage = 1;

    while (stage <= GameData.maxStageNum) {
        const monster = new Monster(stage);
        await battle(stage, player, monster);

        // 스테이지 클리어 및 게임 종료 조건
        if (!player.hp)
            break;
        
        stage++;
    }
}