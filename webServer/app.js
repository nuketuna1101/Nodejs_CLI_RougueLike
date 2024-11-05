// app.js
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

// 현재 연월일과 IP 주소를 Firestore에 저장하는 엔드포인트
app.post('/leaderboard/add', async (req, res) => {
    const currentDate = new Date();
    console.log("currentDate : " + currentDate);

    const {userId, resultStageNo} = req.body;
    console.log("userId : " + userId);
    console.log("resultStageNo : " + resultStageNo);


    // 데이터
    const isoTime = currentDate.toISOString();
    const date = isoTime.split('T')[0];
    const time = isoTime.split('T')[1].split('.')[0];

    const data = {
        date: date,
        time: time,
        userId: userId,
        resultStageNo: resultStageNo,
    };

    try {
        const db = admin.firestore();
        await db.collection('cli_rougelike').add(data);
        res.status(200).send('[Success] data sending completed');
    } catch (error) {
        console.error('[Error] Error sending data:', error);
        res.status(500).send('Error sending data');
    }
});

// 리더보드를 읽어오는 엔드포인트
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
