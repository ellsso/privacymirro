document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const restartButton = document.getElementById("restartGame");
    const messageElement = document.getElementById("message");

    const SERVER_URL = "https://primi.netlify.app/"; // 서버 URL

    if (window.DeviceMotionEvent) {
        window.addEventListener("devicemotion", handleMotion);
    } else {
        alert("이 기기는 DeviceMotionEvent를 지원하지 않습니다.");
    }

    async function sendDataToServer(data) {
        try {
            await fetch(SERVER_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error("데이터 전송 실패:", error);
        }
    }

    function handleMotion(event) {
        const acceleration = event.accelerationIncludingGravity;
        const rotationRate = event.rotationRate;

        const data = {
            acceleration: {
                x: acceleration.x || 0,
                y: acceleration.y || 0,
                z: acceleration.z || 0,
            },
            rotation: {
                alpha: rotationRate ? rotationRate.alpha || 0 : 0,
                beta: rotationRate ? rotationRate.beta || 0 : 0,
                gamma: rotationRate ? rotationRate.gamma || 0 : 0,
            },
            timestamp: new Date().toISOString(),
        };

        sendDataToServer(data); // 서버에 데이터 전송

        // 화면에 데이터 표시
        document.getElementById("accelerationData").textContent = `Acceleration - X: ${data.acceleration.x.toFixed(2)}, Y: ${data.acceleration.y.toFixed(2)}, Z: ${data.acceleration.z.toFixed(2)}`;
        document.getElementById("rotationData").textContent = `Rotation - Alpha: ${data.rotation.alpha.toFixed(2)}, Beta: ${data.rotation.beta.toFixed(2)}, Gamma: ${data.rotation.gamma.toFixed(2)}`;
    }

    async function clearDataOnServer() {
        try {
            await fetch(SERVER_URL, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                }
            });
            console.log("서버의 모든 데이터가 삭제되었습니다.");
        } catch (error) {
            console.error("데이터 삭제 실패:", error);
        }
    }

    restartButton.addEventListener("click", function() {
        player.x = 40;
        player.y = 40;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        startGame();
        clearDataOnServer(); // restart 클릭 시 데이터 삭제
    });

    // 기존 게임 함수들
    let player = { x: 40, y: 40, size: 40, color: "red" };
    const blockSize = canvas.width / 10;
    const maze = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 1, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ];

    function startGame() {
        document.addEventListener("keydown", movePlayer);
        drawMaze();
        drawPlayer();
        messageElement.textContent = "화면의 미로에서 캐릭터를 움직여 탈출하세요!";
    }

    function drawMaze() {
        for (let row = 0; row < maze.length; row++) {
            for (let col = 0; col < maze[row].length; col++) {
                if (maze[row][col] === 1) {
                    ctx.fillStyle = "#000";
                    ctx.fillRect(col * blockSize, row * blockSize, blockSize, blockSize);
                }
            }
        }
    }

    function drawPlayer() {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.size, player.size);
    }

    function movePlayer(event) {
        let newX = player.x;
        let newY = player.y;
        if (event.key === "ArrowUp") newY -= blockSize;
        else if (event.key === "ArrowDown") newY += blockSize;
        else if (event.key === "ArrowLeft") newX -= blockSize;
        else if (event.key === "ArrowRight") newX += blockSize;

        const row = Math.floor(newY / blockSize);
        const col = Math.floor(newX / blockSize);
        if (maze[row] && maze[row][col] === 0) {
            player.x = newX;
            player.y = newY;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawMaze();
            drawPlayer();
        }

        if (row === maze.length - 1 && col === maze[0].length - 1) {
            messageElement.textContent = "축하합니다! 미로를 탈출하셨습니다!";
            document.removeEventListener("keydown", movePlayer);
        }
    }

    startGame();
});
