//================================================================================================================================
//================================================================================================================================
// login.js // 아이디만으로 시작하는 로그인
//================================================================================================================================
//================================================================================================================================
import chalk from 'chalk';
import readlineSync from 'readline-sync';


export async function userLogin(){
    // 로그인 화면 띄우기
    displayLoginScreen();

    // 다음 플로우 진행하기 위해 입력 대기
    console.log(chalk.green("Type user ID to start the game."));
    const userId = readlineSync.question('user ID: ');
    return userId;
}

// 로그인 화면 띄우기
function displayLoginScreen(){
    // 상단 경계선
    console.clear();
    const line = chalk.magentaBright('='.repeat(50));
    console.log(line);
    console.log(chalk.yellowBright.bold('developed by jyko1101'));
}