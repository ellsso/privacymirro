const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas URI (사용자 정보와 데이터베이스 이름 수정)
const MONGO_URI = "mongodb+srv://user:1234@cluster0.5uyhb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// MongoDB 연결 설정
mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Atlas에 연결 성공"))
    .catch(err => console.error("MongoDB Atlas 연결 실패:", err));

// 데이터 스키마 및 모델 생성
const dataSchema = new mongoose.Schema({
    acceleration: { x: Number, y: Number, z: Number },
    rotation: { alpha: Number, beta: Number, gamma: Number },
    timestamp: String
});

const SensorData = mongoose.model("SensorData", dataSchema);

// 데이터 저장 엔드포인트
app.post("/sensor-data", async (req, res) => {
    try {
        const data = new SensorData(req.body);
        await data.save();
        res.status(200).send("데이터가 저장되었습니다.");
    } catch (error) {
        console.error("데이터 저장 실패:", error);
        res.status(500).send("데이터 저장에 실패했습니다.");
    }
});

// 데이터 삭제 엔드포인트
app.delete("/sensor-data", async (req, res) => {
    try {
        await SensorData.deleteMany({});
        res.status(200).send("모든 데이터가 삭제되었습니다.");
    } catch (error) {
        console.error("데이터 삭제 실패:", error);
        res.status(500).send("데이터 삭제에 실패했습니다.");
    }
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
