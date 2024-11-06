//================================================================================================================================
//================================================================================================================================
// app.js // 웹 서버 앱 : fetch API + firebase admin과 연결
//================================================================================================================================
//================================================================================================================================
import express from 'express';
import admin from 'firebase-admin';
import fs from 'fs/promises';
// Firebase Admin SDK 초기화
const initializeFirebase = async () => {
    const serviceAccount = await fs.readFile('./ServiceAccountKey_jyko.json', 'utf8');
    const serviceAccountJson = JSON.parse(serviceAccount);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
        databaseURL: "https://sparta-d16df-default-rtdb.firebaseio.com"
    });
};
// Express.js 앱 설정
const app = express();
const PORT = 3000;

app.use(express.json());  // 여기에서 JSON 미들웨어를 추가합니다.


// [기능] 업데이트
app.post('/leaderboard/update', async (req, res) => {
    // 데이터 정리
    const {date, time, userId, resultStageNo} = req.body;
    const data = {
        date: date,
        time: time,
        userId: userId,
        resultStageNo: resultStageNo,
    };

    try {
        // userId 일치하는게 존재하는지 검색
        const db = admin.firestore();
        const leaderboardRef = db.collection('cli_rougelike');
        const querySnapshot = await leaderboardRef.where('userId', '==', userId).get();

        if (querySnapshot.empty)
        {
            // 불일치 시, 새로추가
            await leaderboardRef.add(data);
            res.status(200).send({
                msg: '[Success] new data updated',
                flag: 'CREATE'
            });
        }
        else
        {
            // 일치 시, 점수가 더 높은지 비교하여
            const docSnapshot = querySnapshot.docs[0];
            const prevData = docSnapshot.data();

            if (prevData.resultStageNo < data.resultStageNo)
            {
                // 기존꺼보다 높으면, 기존 데이터 삭제 후 현재 데이터 추가
                await leaderboardRef.doc(docSnapshot.id).delete();
                await leaderboardRef.add(data);
                res.status(200).send({
                    msg: '[Success] prev data deleted and new data updated',
                    flag: 'REPLACE'
                });
            }
            else
            {
                // 기존꺼보다 같거나 작으면 업데이트할 이유 x
                res.status(200).send({
                    msg: '[info] no update',
                    flag: 'NO_UPDATE'
                });
            }
        }
    } catch(e) {
        res.status(500).send('[Error] Error updating data');
    }
});
// [기능] 조회 : 리더보드를 읽어오는 엔드포인트
app.get('/leaderboard', async (req, res) => {
    try {
        const db = admin.firestore();
        const snapshot = await db.collection('cli_rougelike').orderBy('resultStageNo', 'desc').get();
        const leaderboard = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(leaderboard); // 리더보드 데이터 반환
    } catch (error) {
        console.error('[Error] Error fetching leaderboard:', error);
        res.status(500).send('Error fetching leaderboard');
    }
});

// 서버 시작
const runServer = async () => {
    await initializeFirebase();
    app.listen(PORT, () => {
        console.log(`[Jyko Server] on http://localhost:${PORT}`);
    });
};
runServer().catch(console.error);
