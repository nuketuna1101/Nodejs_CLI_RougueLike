//================================================================================================================================
//================================================================================================================================
// leaderboard.js // leaderboard : 실제 유저의 id/연원일/시간/최대도달스테이지
//================================================================================================================================
//================================================================================================================================

// fetch API : POST : 리더보드에 데이터 추가
export function addLeaderboard(input){
    if (!isValid(input))
        return;

    fetch('http://localhost:3000/leaderboard/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(input),
        })
        .then(response => response.text())
        .catch(error => console.error('[Error] error occurred :', error));
}


// fetch API : GET : 전체 리더보드 가져오기
export function fetchLeaderboard() {
    fetch('http://localhost:3000/leaderboard')
        .then(response => {
            if (!response.ok)       throw new Error('Network response was not ok');      
            return response.json(); // JSON 형태로 응답 받기
        })
        .catch(error => console.error('[Error] error occurred :', error));
}

// 입력 데이터 유효성 검사
function isValid(input){
    const { userId, resultStageNo } = input;
    const isUserIdValid = (typeof userId !== 'string' || userId.trim() === '');
    const isResultStageNoValid = (typeof resultStageNo !== 'number' || resultStageNo <= 0);
    return (isUserIdValid && isResultStageNoValid);
}