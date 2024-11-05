//================================================================================================================================
//================================================================================================================================
// turnAction.js // battle 흐름에서 player와 monster의 턴 액션
//================================================================================================================================
//================================================================================================================================

import chalk from 'chalk';
import readlineSync from 'readline-sync';
import readline from 'readline';
import { InitialStatData, InitialProbData, GameData, ActionStateType} from './data.js';
import { displayStatus, displayLog, displayTextAnim } from './display.js';

// 플레이어 턴 액션 : 공격, 대기 2가지 선택지 현재는
// 플레이어 입력의 유효성 반환
export async function turnPlayerAction(stage, player, monster, logs){
    const warnMsg = chalk.red(`올바른 선택을 하세요.`);
    if (logs.length > 0 && logs[logs.length - 1].includes(warnMsg)) {
        logs.pop();
    }
    console.log(
        chalk.green(
            `\n1. 공격 2. 방어 3. 반격 `,
        ),
    );
    const choice = readlineSync.question(':: select your choice ::>  ');
    // 입력 후 마지막 한 줄 지우기
    readline.cursorTo(process.stdout, 0);    // 커서를 줄의 시작으로 이동
    readline.clearLine(process.stdout, 0);   // 현재 줄을 지움
    // 플레이어의 선택에 따라 다음 행동 처리
    switch (choice) {
        case '1':
            logs.push(chalk.green(`[${choice} 선택됨] :: `) + chalk.white.bgGreen(`<공격<`) + chalk.yellow(` << ${player.dmg}의 피해를 줌`));
            player.attack(monster);
            return true;
        case '2':
            player.setActionState(ActionStateType.Defense);
            logs.push(chalk.green(`[${choice} 선택됨] :: `) + chalk.white.bgGreen(`|방어|`) + chalk.yellow(` || 현재 방어도 ${player.armor}`));
            return true;
        case '3':
            player.setActionState(ActionStateType.CounterAtk);
            logs.push(chalk.green(`[${choice} 선택됨] :: `) + chalk.white.bgGreen(`<반격|`) + chalk.yellow(` <| 반격 모드 활성화`));
            return true;
        default:
            logs.push(warnMsg);
    }
    return false;
};
// 몬스터 턴 액션 : 우선은 공격으로 고정
export async function turnMonsterAction(stage, player, monster, logs){
    const callbacks = [() => displayStatus(stage, player, monster), () => displayLog(logs)];
    await displayTextAnim(chalk.yellow("몬스터 행동 선택 중..."), 1000, callbacks);
    let processedDmg;
    let isPefectBlocked = false;
    let isCounterAtk = false;

    // perfectBlock 리스너를 제거하여 중복 방지
    player.removeAllListeners('perfectBlock');
    player.removeAllListeners('processedDmg');
    player.removeAllListeners('counterAtk');
    // perfectBlock 이벤트에 대한 리스너 등록
    player.once('perfectBlock', () => {
        isPefectBlocked = true;
    });
    // counterAtk 이벤트에 대한 리스너 등록
    player.once('counterAtk', () => {
        isCounterAtk = true;
        player.attack(monster, 1.5);
    });
    // processedDmg 이벤트에 대한 리스너 등록
    player.once('processedDmg', (data) => {
        processedDmg = data;
    });
    monster.attack(player);

    logs.push(chalk.red('[상대 턴]  :: ') + chalk.white.bgRed(`>공격>`) + chalk.yellow(` >> ${monster.dmg}의 공격 >>`) 
    + (isPefectBlocked ? chalk.blue(` [완벽한 방어] 발동`) : "") +  chalk.green(` >> ${processedDmg} 피해 받음`));
    if (isCounterAtk)
        logs.push(chalk.white('              ') + chalk.blue(`[반격] 발동>`) + chalk.yellow(` << ${Math.round(player.dmg * 1.5)}의 피해를 줌`));          // 일단은 반격데미지 하드코딩
    isPefectBlocked = false;
    isCounterAtk = false;


};
