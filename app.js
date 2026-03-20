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

/**
 * 初始化游戏
 */
function initGame() {
    // 初始化棋盘数组
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(Players.EMPTY));

    // 重置游戏状态
    currentPlayer = Players.BLACK;
    gameOver = false;

    // 更新玩家显示
    updatePlayerDisplay();

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

    // 计算缩放比例
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
    drawBoard();

    // 检查是否获胜
    if (checkWin(row, col)) {
        gameOver = true;
        const winner = currentPlayer === Players.BLACK ? '黑棋' : '白棋';
        setTimeout(() => {
            alert(`游戏结束！${winner}获胜！`);
        }, 100);
        return;
    }

    // 检查是否平局
    if (checkDraw()) {
        gameOver = true;
        setTimeout(() => {
            alert('游戏结束！平局！');
        }, 100);
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
 * 重新开始游戏
 */
function restartGame() {
    initGame();
}

// 事件监听
canvas.addEventListener('click', handleBoardClick);
restartBtn.addEventListener('click', restartGame);

// 初始化游戏
initGame();
