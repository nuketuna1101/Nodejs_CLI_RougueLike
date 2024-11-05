//================================================================================================================================
//================================================================================================================================
// leaderboard.js // leaderboard : 실제 유저의 id/연원일/시간/최대도달스테이지
//================================================================================================================================
//================================================================================================================================

// fetch API 통해서 리더보드에 데이터 추가
export function addLeaderboard(input){

    if (!isValid(input))
        return;

    fetch('http://localhost:3000/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(input),
        })
        .then(response => response.text())
        .catch(error => console.error('[Error] error occurred :', error));
}

function isValid(input){
    const { userId, resultStageNo } = input;
    const isUserIdValid = (typeof userId !== 'string' || userId.trim() === '');
    const isResultStageNoValid = (typeof resultStageNo !== 'number' || resultStageNo <= 0);
    return (isUserIdValid && isResultStageNoValid);
}