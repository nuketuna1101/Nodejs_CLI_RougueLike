//================================================================================================================================
//================================================================================================================================
// display.js // 디스플레이 클래스 : 콘솔 화면 출력 함수 모음
//================================================================================================================================
//================================================================================================================================
import chalk from 'chalk';
// 콘솔창 초기화 후 다시 그리기
export function refreshWholeDisplay(stage, player, monster, logs){
    const callbacks = [
        () => console.clear(), 
        () => displayStatus(stage, player, monster), 
        () => displayLog(logs)
    ];
    callbacks?.forEach(func => {
        func();
    });
}

// 플레이어 정보, 몬스터 정보
export function displayStatus(stage, player, monster) {
    console.log(chalk.magentaBright(`\n=== Current Status ================`));
    const stageStat = chalk.cyanBright(` Stage: ${stage} \n`);
    const playerStat = chalk.blueBright(` Player Stat:   HP : ${player.hp} Atk: ${player.dmg} Armor: ${player.armor}\n`);
    const monsterStat = chalk.redBright(` Monster Stat:  HP : ${monster.hp} Atk: ${monster.dmg} Armor: ${monster.armor}`);
    console.log(stageStat + playerStat + monsterStat);

    console.log(chalk.magentaBright(`===================================\n`));
};

// targetLogs 배열에 대한 로그 출력
export function displayLog(targetLogs){
    targetLogs.forEach((log) => {console.log(log)});
};

// 콘솔창에 텍스트를 전부 지우고 애니메이션으로 띄움
export async function displayTextAnim(text, duration, prevConsoleFunctions = null) {
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