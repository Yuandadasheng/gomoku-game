// 游戏常量配置
const CELL_SIZE = 40;          // 棋盘格子大小
const BOARD_SIZE = 15;         // 棋盘大小 15x15
const BOARD_PADDING = 20;      // 棋盘边距

// 玩家枚举
const Players = {
    EMPTY: 0,
    BLACK: 1,
    WHITE: 2
};

// 获取DOM元素
const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const currentPlayerEl = document.getElementById('currentPlayer');
const restartBtn = document.getElementById('restartBtn');

// 游戏状态
let board = [];                // 棋盘数组
let currentPlayer = Players.BLACK;  // 当前玩家
let gameOver = false;          // 游戏结束标志
let lastMove = null;           // 最后落子位置 {row, col}
let moveHistory = [];          // 落子历史记录
let scores = { black: 0, white: 0 };  // 计分

/**
 * 初始化游戏
 */
function initGame() {
    // 初始化棋盘数组
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(Players.EMPTY));

    // 重置游戏状态
    currentPlayer = Players.BLACK;
    gameOver = false;
    lastMove = null;
    moveHistory = [];

    // 更新玩家显示
    updatePlayerDisplay();
    updateScoreDisplay();

    // 绘制棋盘
    drawBoard();
}

/**
 * 绘制棋盘
 */
function drawBoard() {
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制棋盘背景
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格线
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 1;

    // 绘制横线和竖线
    for (let i = 0; i < BOARD_SIZE; i++) {
        // 横线
        ctx.beginPath();
        ctx.moveTo(BOARD_PADDING, BOARD_PADDING + i * CELL_SIZE);
        ctx.lineTo(BOARD_PADDING + (BOARD_SIZE - 1) * CELL_SIZE, BOARD_PADDING + i * CELL_SIZE);
        ctx.stroke();

        // 竖线
        ctx.beginPath();
        ctx.moveTo(BOARD_PADDING + i * CELL_SIZE, BOARD_PADDING);
        ctx.lineTo(BOARD_PADDING + i * CELL_SIZE, BOARD_PADDING + (BOARD_SIZE - 1) * CELL_SIZE);
        ctx.stroke();
    }

    // 绘制天元和星位
    const starPoints = [
        [3, 3], [3, 11], [7, 7], [11, 3], [11, 11]
    ];

    ctx.fillStyle = '#8B4513';
    starPoints.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(
            BOARD_PADDING + x * CELL_SIZE,
            BOARD_PADDING + y * CELL_SIZE,
            4,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });

    // 绘制所有棋子
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] !== Players.EMPTY) {
                drawPiece(row, col, board[row][col]);
            }
        }
    }

    // 绘制最后落子高亮标记
    if (lastMove) {
        drawLastMoveMarker(lastMove.row, lastMove.col);
    }
}

/**
 * 绘制棋子
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 * @param {number} player - 玩家类型
 */
function drawPiece(row, col, player) {
    const x = BOARD_PADDING + col * CELL_SIZE;
    const y = BOARD_PADDING + row * CELL_SIZE;
    const radius = CELL_SIZE * 0.4;

    // 绘制棋子阴影
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();

    // 绘制棋子
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);

    // 根据玩家类型设置颜色
    if (player === Players.BLACK) {
        // 黑棋渐变
        const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
        gradient.addColorStop(0, '#555');
        gradient.addColorStop(1, '#000');
        ctx.fillStyle = gradient;
    } else {
        // 白棋渐变
        const gradient = ctx.createRadialGradient(x - radius/3, y - radius/3, 0, x, y, radius);
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#ddd');
        ctx.fillStyle = gradient;
    }

    ctx.fill();

    // 绘制棋子边框
    ctx.strokeStyle = player === Players.BLACK ? '#333' : '#999';
    ctx.lineWidth = 1;
    ctx.stroke();
}

/**
 * 更新玩家显示
 */
function updatePlayerDisplay() {
    const playerName = currentPlayer === Players.BLACK ? '黑棋' : '白棋';
    currentPlayerEl.textContent = playerName;
    currentPlayerEl.style.color = currentPlayer === Players.BLACK ? '#333' : '#999';
}

/**
 * 处理棋盘点击事件
 * @param {MouseEvent} event - 鼠标事件
 */
function handleBoardClick(event) {
    if (gameOver) return;

    // 获取点击位置
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // 计算缩放比例 - 修复移动端坐标计算
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // 计算棋盘上的坐标
    const col = Math.round((x * scaleX - BOARD_PADDING) / CELL_SIZE);
    const row = Math.round((y * scaleY - BOARD_PADDING) / CELL_SIZE);

    // 验证坐标是否有效
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
        return;
    }

    // 检查该位置是否已有棋子
    if (board[row][col] !== Players.EMPTY) {
        return;
    }

    // 落子
    board[row][col] = currentPlayer;
    lastMove = { row, col };
    moveHistory.push({ row, col, player: currentPlayer });
    playSound('place');
    drawBoard();

    // 检查是否获胜
    if (checkWin(row, col)) {
        gameOver = true;
        const winner = currentPlayer === Players.BLACK ? '黑棋' : '白棋';
        if (currentPlayer === Players.BLACK) {
            scores.black++;
        } else {
            scores.white++;
        }
        updateScoreDisplay();
        playSound('win');
        showGameModal(`🎉 游戏结束！<br><br><span style="font-size: 1.5em; color: ${currentPlayer === Players.BLACK ? '#333' : '#666'};">${winner}获胜！</span>`);
        return;
    }

    // 检查是否平局
    if (checkDraw()) {
        gameOver = true;
        playSound('lose');
        showGameModal('🤝 游戏结束！<br><br><span style="font-size: 1.5em;">平局！</span>');
        return;
    }

    // 切换玩家
    currentPlayer = currentPlayer === Players.BLACK ? Players.WHITE : Players.BLACK;
    updatePlayerDisplay();
}

/**
 * 检查是否获胜
 * @param {number} row - 落子行
 * @param {number} col - 落子列
 * @returns {boolean} 是否获胜
 */
function checkWin(row, col) {
    const player = board[row][col];

    // 检查四个方向：横、竖、对角线、反对角线
    const directions = [
        [[0, 1], [0, -1]],   // 横向
        [[1, 0], [-1, 0]],   // 纵向
        [[1, 1], [-1, -1]],  // 主对角线
        [[1, -1], [-1, 1]]   // 副对角线
    ];

    for (const [dir1, dir2] of directions) {
        let count = 1;  // 当前棋子算一个

        // 向第一个方向检查
        let r = row + dir1[0];
        let c = col + dir1[1];
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            count++;
            r += dir1[0];
            c += dir1[1];
        }

        // 向相反方向检查
        r = row + dir2[0];
        c = col + dir2[1];
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
            count++;
            r += dir2[0];
            c += dir2[1];
        }

        // 如果连续五子，获胜
        if (count >= 5) {
            return true;
        }
    }

    return false;
}

/**
 * 检查是否平局
 * @returns {boolean} 是否平局
 */
function checkDraw() {
    // 检查棋盘是否已满
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === Players.EMPTY) {
                return false;
            }
        }
    }
    return true;
}

/**
 * 绘制最后落子高亮标记
 * @param {number} row - 行索引
 * @param {number} col - 列索引
 */
function drawLastMoveMarker(row, col) {
    const x = BOARD_PADDING + col * CELL_SIZE;
    const y = BOARD_PADDING + row * CELL_SIZE;

    // 绘制红色小方块标记
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(x - 3, y - 3, 6, 6);
}

/**
 * 播放音效
 * @param {string} type - 音效类型 ('place', 'win', 'lose')
 */
function playSound(type) {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'place') {
        // 落子音效：短促的点击声
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'win') {
        // 胜利音效：欢快的三和弦
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.3);
            osc.start(audioCtx.currentTime + i * 0.1);
            osc.stop(audioCtx.currentTime + i * 0.1 + 0.3);
        });
    } else if (type === 'lose') {
        // 失败音效：低沉的声音
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    }
}

/**
 * 更新计分显示
 */
function updateScoreDisplay() {
    const scoreBlack = document.getElementById('scoreBlack');
    const scoreWhite = document.getElementById('scoreWhite');
    if (scoreBlack) scoreBlack.textContent = scores.black;
    if (scoreWhite) scoreWhite.textContent = scores.white;
}

/**
 * 悔棋功能
 */
function undoMove() {
    if (gameOver || moveHistory.length === 0) return;

    const lastMoveData = moveHistory.pop();
    board[lastMoveData.row][lastMoveData.col] = Players.EMPTY;

    // 恢复上一个落子位置
    if (moveHistory.length > 0) {
        lastMove = moveHistory[moveHistory.length - 1];
    } else {
        lastMove = null;
    }

    // 切换回上一个玩家
    currentPlayer = lastMoveData.player;
    updatePlayerDisplay();

    drawBoard();
}

/**
 * 重新开始游戏
 */
function restartGame() {
    initGame();
}

/**
 * 显示游戏结束模态框
 * @param {string} message - 显示的消息
 */
function showGameModal(message) {
    const modal = document.getElementById('gameModal');
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.innerHTML = message;
    modal.style.display = 'flex';
}

/**
 * 关闭游戏结束模态框
 */
function closeGameModal() {
    const modal = document.getElementById('gameModal');
    modal.style.display = 'none';
}

// 事件监听
canvas.addEventListener('click', handleBoardClick);
restartBtn.addEventListener('click', restartGame);

// 悔棋按钮监听
const undoBtn = document.getElementById('undoBtn');
if (undoBtn) {
    undoBtn.addEventListener('click', undoMove);
}

// 模态框按钮监听
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalRestartBtn = document.getElementById('modalRestartBtn');
if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeGameModal);
}
if (modalRestartBtn) {
    modalRestartBtn.addEventListener('click', () => {
        closeGameModal();
        restartGame();
    });
}

// 初始化游戏
initGame();
