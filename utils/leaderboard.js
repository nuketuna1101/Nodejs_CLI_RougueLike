//================================================================================================================================
//================================================================================================================================
// leaderboard.js // leaderboard : 실제 유저의 id/연원일/시간/최대도달스테이지
//================================================================================================================================
//================================================================================================================================
import chalk from 'chalk';
import readlineSync from 'readline-sync';
import { start } from '../server.js';
import { response } from 'express';

// 리더보드 조회하기
export async function checkLeaderboard(){
    // 디스플레이 화면 올리기
    await displayLeaderboard();
    // 다음 플로우 진행하기 위해 입력 대기
    console.log(chalk.green("Press any key to go back to the main screen."));
    const choice = readlineSync.question('input: ');
    switch(choice){
        default:
            start();
    }
}

// 리더보드 화면 띄우기
async function displayLeaderboard(){
    const leaderboardData = await fetchLeaderboard();
    let logs = [];
    const category1 = "ID".padEnd(12, ' ');
    const category2 = "DATE".padEnd(12, ' ');
    const category3 = "TIME".padEnd(12, ' ');
    const category4 = "StageNo".padEnd(12, ' ');
    logs.push(chalk.black.bgWhite(`${category1}${category2}${category3}${category4}`));
    leaderboardData.forEach(entry => {
        const userId = entry.userId.padEnd(12, ' ');
        const resultStageNo = (entry.resultStageNo.toString()).padEnd(12, ' ');
        const date = entry.date.padEnd(12, ' ');
        const time = entry.time.padEnd(12, ' ');
        logs.push(chalk.yellow(`${userId}${date}${time}${resultStageNo}\n`));
    });
    console.clear();
    logs.forEach((log) => {console.log(log)});
}



// fetch API : POST : 리더보드에 데이터 추가
export async function tryUpdateLeaderboard(userId, resultStageNo){
    const {date, time} = getCurrentDateTime();
    try {
        const response = await fetch('http://localhost:3000/leaderboard/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({userId, resultStageNo}),
        });
        
        if (!response.ok)       
            throw new Error('[Error] failed to update leaderboard');        
        const resJson = await response.json();
        return resJson.flag;
    } catch (e) {
        console.error('[Error] error occurred :', e);
        return 'ERROR';
    }
}

// fetch API : GET : 전체 리더보드 가져오기
async function fetchLeaderboard() {
    try {
        const response = await fetch('http://localhost:3000/leaderboard');
        if (!response.ok)       throw new Error('[Error] network BAD response');
        
        const data = await response.json();
        return data;
    } catch (e) {
        console.error('[Error] error occurred :', e);
        return null;
    }
}



// 입력 데이터 유효성 검사
function isValid(input){
    const { userId, resultStageNo } = input;
    const isUserIdValid = (typeof userId !== 'string' || userId.trim() === '');
    const isResultStageNoValid = (typeof resultStageNo !== 'number' || resultStageNo <= 0);
    return (isUserIdValid && isResultStageNoValid);
}