# 五子棋游戏 (Gomoku Game)

一个基于HTML5 Canvas的五子棋双人对战游戏。

## 功能特性

- 双人轮流对战
- 15x15标准棋盘
- 黑棋先行
- 自动判定胜负
- 精美的渐变棋子效果
- 响应式设计

## 运行方式

### 方法一：直接打开HTML文件

直接在浏览器中打开 `index.html` 文件即可开始游戏。

### 方法二：使用本地服务器

```bash
# 安装serve（如果未安装）
npm install -g serve

# 运行
npm run dev
```

## 游戏规则

1. 黑棋先行，双方轮流落子
2. 点击棋盘交叉点落子
3. 先连成五子（横、竖、斜）者获胜
4. 棋盘填满且无人获胜则平局

## 项目结构

```
gomoku-game/
├── index.html      # 主页面
├── styles.css      # 样式文件
├── app.js          # 游戏逻辑
├── package.json    # 项目配置
└── README.md       # 说明文档
```

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Canvas API
