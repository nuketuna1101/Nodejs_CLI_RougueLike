import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
    // private: stat vars
    #hp; #dmg;
    // 생성자
    constructor() {
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
        }
    }
    get hp(){
        return this.#hp;
    }
    get dmg(){
        return this.#dmg;
    }
}

class Monster {
    #hp;
    #dmg;
    constructor() {
        this.#hp = 100;
        this.#dmg = 10;
    }

    attack(player) {
        // 몬스터의 공격
        player.beAttacked(this.#dmg);
    }
    beAttacked(dmg){
        this.#hp -= dmg;
        if (this.#hp <= 0){
            /* 으앙 쥬금 */
        }
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
// 전투 씬
const battle = async (stage, player, monster) => {
    let logs = [];

    while (player.hp > 0) {
        console.clear();
        // displayStatus
        displayStatus(stage, player, monster);

        logs.forEach((log) => {console.log(log)});


        // 마지막 로그에: warnMsg 로그가 있다면 삭제--------
        const warnMsg = chalk.red(`올바른 선택을 하세요.`);
        if (logs.length > 0 && logs[logs.length - 1].includes(warnMsg)) {
            logs.pop();
        }
        //--------------------------------------------------
        console.log(
            chalk.green(
                `\n1. 공격한다 2. 아무것도 하지않는다.`,
            ),
        );
        const choice = readlineSync.question('당신의 선택은? ');

        // 플레이어의 선택에 따라 다음 행동 처리
        switch (choice) {
            case '1':
                logs.push(chalk.green(`${choice}를 선택하셨습니다.`) + chalk.yellow.bgGreen(`> 플레이어 공격`));
                //logs.push(chalk.yellow.bgGreen(`> 플레이어 공격`));
                // 여기에서 새로운 게임 시작 로직을 구현
                player.attack(monster);
                break;
            case '2':
                logs.push(chalk.green(`${choice}를 선택하셨습니다.`));
                //console.log(chalk.yellow('구현 준비중입니다.. 게임을 시작하세요'));
                // 업적 확인하기 로직을 구현
                break;
            default:
                logs.push(warnMsg);
        }



        // 몬스터 공격이 여기에 들어가야 할까?


    }

};
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
