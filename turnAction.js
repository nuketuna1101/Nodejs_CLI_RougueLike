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
            logs.push(chalk.green(`[${choice} 선택됨] :: `) + chalk.white.bgGreen(`|방어|`) + chalk.yellow(` || ${player.armor} 방어도 증가`));
            player.setActionState(ActionStateType.Defense);
            //player.gainArmorTemp();
            return true;
        case '3':
            logs.push(chalk.green(`[${choice} 선택됨] :: `) + chalk.white.bgGreen(`<반격|`) + chalk.yellow(` <| ${player.armor} 방어도 증가`));
            player.setActionState(ActionStateType.CounterAtk);
            //player.gainArmorTemp();
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
    monster.attack(player);
    logs.push(chalk.red('[상대 턴]  :: ') + chalk.white.bgRed(`>공격>`) + chalk.yellow(` >> ${monster.dmg}의 피해를 받음`));
};
