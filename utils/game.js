import chalk from 'chalk';
import { Player } from '../models/player.js';
import { Monster } from '../models/Monster.js';
import { InitialStatData, InitialProbData, GameData, ActionStateType} from '../models/data.js';
import { refreshWholeDisplay, displayStatus, displayLog, displayTextAnim } from './display.js';
import { turnPlayerAction, turnMonsterAction } from './turnAction.js';
import { tryUpdateLeaderboard } from './leaderboard.js';
import { userId, start } from '../server.js';
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
    while (true) {
        // +----------------------------------+ Player 턴 시작 +-----------------------------------

        // player의 actionState=> basic으로 초기화 (턴이 종료되고 새 턴을 시작하므로)
        player.setActionState();

        // 콘솔창 초기화 후 그리기
        refreshWholeDisplay(stage, player, monster, log_actionHistory);

        // 사용자 턴 입력 받기
        const isPlayerInputValid = await turnPlayerAction(stage, player, monster, log_actionHistory);
        // 사용자 턴 입력 올바르지 않으면 다시
        if (!isPlayerInputValid)
            continue;
        // 몬스터 생존 확인
        if (!isMonsterAlive)
            break;
        // -----------------------------------+ Player 턴 종료 +----------------------------------+ 

        // +----------------------------------+ Monster 턴 시작 +-----------------------------------
        refreshWholeDisplay(stage, player, monster, log_actionHistory);

        await turnMonsterAction(stage, player, monster, log_actionHistory);
        // 플레이어 생존 확인
        if (!isPlayerAlive || !isMonsterAlive)
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
    // stage 값을 통해 클리어 했는지, 도중 사망했는지 알 수 있다.
    if (stage > GameData.maxStageNum)
    {
        // 클리어 성공
        await displayTextAnim(chalk.black.bgWhite(` 모든 스테이지를 완료했습니다. `), 2000);
    }
    else
    {
        // 도중 실패
        await displayTextAnim(chalk.black.bgWhite(` G A M E  O V E R `), 2000);
    }
    const resultFlag = await tryUpdateLeaderboard(userId, --stage);

    switch(resultFlag)
    {
        case 'CREATE':
            await displayTextAnim(chalk.green(` 새로운 유저 `) + chalk.yellow.bold(` ${userId} `) + chalk.green(`의 기록을 저장했습니다. `), 2000);
            break;
        case 'REPLACE':
            await displayTextAnim(chalk.green(` 유저 `) + chalk.yellow.bold(` ${userId} `) + chalk.green(`의 신기록을 저장했습니다. `), 2000);
            break;
        case 'NO_UPDATE':
            await displayTextAnim(chalk.green(` 유저 `) + chalk.yellow.bold(` ${userId} `) + chalk.green(`의 이전 기록에 미치지 못했습니다.`), 2000);
            break;
        default:
            await displayTextAnim(chalk.black.bgWhite(` Failed to update data `), 2000);
            break;
    }
    // 검사해서 기록 갱신했는지 혹은 나의 기록 갱신했는지

    await displayTextAnim(chalk.black.bgWhite(` 잠시 후 메인화면으로 돌아갑니다 `), 2000);
    // 게임 다시 돌아가기
    start();
}