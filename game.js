// C++ 键盘大师游戏

// 游戏数据 - 按级别分类
const levelData = {
    1: {
        name: '级别 1 - 字母练习',
        description: '输入下落的字母！',
        items: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
        speed: 8,
        spawnRate: 2000
    },
    2: {
        name: '级别 2 - 符号挑战',
        description: '输入C++常用符号！',
        items: ['{', '}', '(', ')', '[', ']', ';', ':', ',', '.', '=', '+', '-', '*', '/', '<', '>', '!', '&', '|'],
        speed: 7,
        spawnRate: 1800
    },
    3: {
        name: '级别 3 - 简单单词',
        description: '输入C++关键词！按回车确认',
        items: ['int', 'for', 'if', 'else', 'do', 'new', 'try', 'char', 'void', 'bool', 'true', 'false', 'null', 'auto'],
        speed: 7,
        singleItem: true
    },
    4: {
        name: '级别 4 - 中级单词',
        description: '更多C++关键词来啦！',
        items: ['class', 'while', 'break', 'const', 'float', 'short', 'catch', 'throw', 'using', 'return', 'switch', 'static', 'public', 'delete'],
        speed: 6,
        singleItem: true
    },
    5: {
        name: '级别 5 - 高级单词',
        description: '挑战长单词！',
        items: ['iostream', 'include', 'namespace', 'private', 'protected', 'virtual', 'template', 'operator', 'continue', 'unsigned', 'typedef'],
        speed: 5.5,
        singleItem: true
    },
    6: {
        name: '级别 6 - 代码片段',
        description: '输入代码片段！',
        items: ['cout', 'cin', 'endl', 'string', 'vector', 'map', 'set', 'list', 'queue', 'stack', 'pair', 'std::', 'main', 'size'],
        speed: 5,
        singleItem: true
    },
    7: {
        name: '级别 7 - 混合挑战',
        description: '字母、符号、单词全都有！',
        items: ['#include', 'std::cout', 'std::cin', 'int main', 'return 0', 'nullptr', 'sizeof', 'struct', 'enum', 'union'],
        speed: 4.5,
        singleItem: true
    },
    8: {
        name: '级别 8 - 极速模式',
        description: '速度翻倍！加油！',
        items: ['algorithm', 'function', 'exception', 'iterator', 'container', 'constexpr', 'decltype', 'explicit', 'inline'],
        speed: 4,
        singleItem: true
    }
};

// 游戏状态
let gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    level: 1,
    combo: 0,
    lives: 5,
    fallingChars: [],
    spawnInterval: null,
    animationFrame: null,
    currentLevelScore: 0,
    scoreToNextLevel: 100
};

// DOM 元素
const elements = {
    gameScreen: document.getElementById('gameScreen'),
    userInput: document.getElementById('userInput'),
    scoreDisplay: document.getElementById('score'),
    levelDisplay: document.getElementById('level'),
    comboDisplay: document.getElementById('combo'),
    livesDisplay: document.getElementById('lives'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    resumeBtn: document.getElementById('resumeBtn'),
    gameOver: document.getElementById('gameOver'),
    levelUp: document.getElementById('levelUp'),
    finalScore: document.getElementById('finalScore'),
    finalLevel: document.getElementById('finalLevel'),
    restartBtn: document.getElementById('restartBtn'),
    levelInfo: document.getElementById('levelInfo'),
    newLevel: document.getElementById('newLevel')
};

// 初始化游戏
function initGame(startLevel = 1) {
    gameState = {
        isPlaying: false,
        isPaused: false,
        score: 0,
        level: startLevel,
        combo: 0,
        lives: 5,
        fallingChars: [],
        spawnInterval: null,
        animationFrame: null,
        currentLevelScore: 0,
        scoreToNextLevel: 100
    };

    updateDisplay();
    updateLevelInfo();
    updateActiveLevelButton();
    elements.gameScreen.innerHTML = '';
    elements.userInput.value = '';
    elements.gameOver.style.display = 'none';
    elements.levelUp.style.display = 'none';
}

// 更新显示
function updateDisplay() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.levelDisplay.textContent = gameState.level;
    elements.comboDisplay.textContent = gameState.combo;
    elements.livesDisplay.textContent = '❤️'.repeat(gameState.lives);

    // 连击动画
    if (gameState.combo > 0) {
        elements.comboDisplay.parentElement.classList.add('combo-pulse');
        setTimeout(() => {
            elements.comboDisplay.parentElement.classList.remove('combo-pulse');
        }, 300);
    }
}

// 更新关卡信息
function updateLevelInfo() {
    const levelInfo = levelData[gameState.level];
    if (levelInfo) {
        elements.levelInfo.querySelector('.level-name').textContent = levelInfo.name;
        elements.levelInfo.querySelector('.level-description').textContent = levelInfo.description;
    }
}

// 更新激活的级别按钮
function updateActiveLevelButton() {
    const allLevelBtns = document.querySelectorAll('.level-btn');
    allLevelBtns.forEach(btn => {
        const level = parseInt(btn.getAttribute('data-level'));
        if (level === gameState.level) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 开始游戏
function startGame(startLevel = null) {
    if (startLevel !== null) {
        initGame(startLevel);
    } else {
        initGame(gameState.level);
    }
    gameState.isPlaying = true;
    elements.startBtn.style.display = 'none';
    elements.pauseBtn.style.display = 'inline-block';
    elements.userInput.focus();

    // 开始生成下落字符
    startSpawning();
}

// 开始生成字符
function startSpawning() {
    const levelInfo = levelData[gameState.level];

    // 如果是单个项目模式（单词模式），只在没有字符时生成
    if (levelInfo.singleItem) {
        gameState.spawnInterval = setInterval(() => {
            if (!gameState.isPaused && gameState.isPlaying && gameState.fallingChars.length === 0) {
                spawnChar();
            }
        }, 100); // 频繁检查，但只在没有字符时才生成
    } else {
        // 字母和符号模式，按照原来的生成速率
        gameState.spawnInterval = setInterval(() => {
            if (!gameState.isPaused && gameState.isPlaying) {
                spawnChar();
            }
        }, levelInfo.spawnRate);
    }
}

// 生成一个下落字符
function spawnChar() {
    const levelInfo = levelData[gameState.level];
    const randomItem = levelInfo.items[Math.floor(Math.random() * levelInfo.items.length)];

    const charElement = document.createElement('div');
    charElement.className = 'falling-char rainbow';
    charElement.textContent = randomItem;
    charElement.style.animationDuration = levelInfo.speed + 's';

    // 先添加到DOM以获取实际宽度
    elements.gameScreen.appendChild(charElement);

    // 获取元素实际宽度，并确保不超出画布
    const charWidth = charElement.offsetWidth;
    const maxLeft = elements.gameScreen.offsetWidth - charWidth - 10; // 右边留10px边距
    const randomLeft = Math.max(10, Math.random() * maxLeft); // 左边也留10px边距
    charElement.style.left = randomLeft + 'px';

    const charObj = {
        element: charElement,
        text: randomItem,
        startTime: Date.now()
    };

    gameState.fallingChars.push(charObj);

    // 监听动画结束（字符到达底部）
    charElement.addEventListener('animationend', () => {
        if (charElement.parentElement) {
            loseLife();
            removeChar(charObj);
        }
    });
}

// 移除字符
function removeChar(charObj) {
    const index = gameState.fallingChars.indexOf(charObj);
    if (index > -1) {
        gameState.fallingChars.splice(index, 1);
    }
    if (charObj.element.parentElement) {
        charObj.element.remove();
    }
}

// 检查输入
function checkInput(input) {
    if (!input) return;

    // 查找匹配的字符
    const matchingChar = gameState.fallingChars.find(char => char.text === input);

    if (matchingChar) {
        // 正确输入
        correctInput(matchingChar);
    } else {
        // 错误输入
        wrongInput();
    }

    elements.userInput.value = '';
}

// 正确输入
function correctInput(charObj) {
    // 添加正确动画
    charObj.element.classList.add('correct');

    // 创建星星特效
    createStars(charObj.element);

    // 更新分数和连击
    gameState.combo++;
    const points = 10 + (gameState.combo * 2);
    gameState.score += points;
    gameState.currentLevelScore += points;

    // 移除字符
    setTimeout(() => removeChar(charObj), 500);

    updateDisplay();

    // 检查是否升级
    if (gameState.currentLevelScore >= gameState.scoreToNextLevel) {
        levelUp();
    } else {
        // 在单词模式下，立即生成下一个单词（移除后）
        const levelInfo = levelData[gameState.level];
        if (levelInfo.singleItem) {
            setTimeout(() => {
                if (gameState.isPlaying && !gameState.isPaused && gameState.fallingChars.length === 0) {
                    spawnChar();
                }
            }, 600);
        }
    }
}

// 错误输入
function wrongInput() {
    gameState.combo = 0;
    elements.userInput.style.borderColor = '#f5576c';
    setTimeout(() => {
        elements.userInput.style.borderColor = '#667eea';
    }, 300);
    updateDisplay();
}

// 失去生命
function loseLife() {
    gameState.lives--;
    gameState.combo = 0;
    updateDisplay();

    if (gameState.lives <= 0) {
        endGame();
    }
}

// 升级
function levelUp() {
    if (gameState.level >= 8) {
        // 已经是最高级别，继续增加难度
        gameState.currentLevelScore = 0;
        gameState.scoreToNextLevel += 50;
        return;
    }

    gameState.level++;
    gameState.currentLevelScore = 0;
    gameState.scoreToNextLevel = 100 + (gameState.level - 1) * 50;
    gameState.lives = Math.min(gameState.lives + 1, 5); // 升级奖励1条命，最多5条

    // 清除当前所有下落字符
    gameState.fallingChars.forEach(char => {
        if (char.element.parentElement) {
            char.element.remove();
        }
    });
    gameState.fallingChars = [];

    // 显示升级提示
    elements.newLevel.textContent = gameState.level;
    elements.levelUp.style.display = 'block';

    // 暂停游戏
    gameState.isPaused = true;
    clearInterval(gameState.spawnInterval);

    setTimeout(() => {
        elements.levelUp.style.display = 'none';
        gameState.isPaused = false;
        updateLevelInfo();
        updateDisplay();
        updateActiveLevelButton();

        // 重新开始生成字符
        startSpawning();
    }, 2000);
}

// 结束游戏
function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.spawnInterval);

    elements.finalScore.textContent = gameState.score;
    elements.finalLevel.textContent = gameState.level;
    elements.gameOver.style.display = 'flex';
    elements.pauseBtn.style.display = 'none';
}

// 创建星星特效
function createStars(element) {
    const rect = element.getBoundingClientRect();
    const gameRect = elements.gameScreen.getBoundingClientRect();

    for (let i = 0; i < 5; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.textContent = '⭐';
        star.style.left = (rect.left - gameRect.left + rect.width / 2) + 'px';
        star.style.top = (rect.top - gameRect.top + rect.height / 2) + 'px';
        elements.gameScreen.appendChild(star);

        setTimeout(() => star.remove(), 1000);
    }
}

// 暂停游戏
function pauseGame() {
    gameState.isPaused = true;
    elements.pauseBtn.style.display = 'none';
    elements.resumeBtn.style.display = 'inline-block';

    // 暂停所有下落字符的动画
    gameState.fallingChars.forEach(char => {
        if (char.element && char.element.parentElement) {
            char.element.classList.add('paused');
        }
    });
}

// 继续游戏
function resumeGame() {
    gameState.isPaused = false;
    elements.pauseBtn.style.display = 'inline-block';
    elements.resumeBtn.style.display = 'none';
    elements.userInput.focus();

    // 恢复所有下落字符的动画
    gameState.fallingChars.forEach(char => {
        if (char.element && char.element.parentElement) {
            char.element.classList.remove('paused');
        }
    });
}

// 事件监听
elements.startBtn.addEventListener('click', startGame);
elements.pauseBtn.addEventListener('click', pauseGame);
elements.resumeBtn.addEventListener('click', resumeGame);
elements.restartBtn.addEventListener('click', () => {
    elements.startBtn.style.display = 'inline-block';
    elements.gameOver.style.display = 'none';
    initGame();
});

// 输入事件 - 字母和符号模式下即时检查（单个字符）
elements.userInput.addEventListener('input', (e) => {
    if (gameState.isPlaying && !gameState.isPaused) {
        const levelInfo = levelData[gameState.level];
        // 只在非单词模式下即时检查
        if (!levelInfo.singleItem) {
            checkInput(e.target.value.trim());
        }
    }
});

// 回车键事件 - 单词模式下按回车检查
elements.userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && gameState.isPlaying && !gameState.isPaused) {
        const levelInfo = levelData[gameState.level];
        // 在单词模式下按回车检查
        if (levelInfo.singleItem) {
            checkInput(e.target.value.trim());
        }
    }
});

// 防止输入框失去焦点
elements.userInput.addEventListener('blur', () => {
    if (gameState.isPlaying && !gameState.isPaused) {
        setTimeout(() => elements.userInput.focus(), 0);
    }
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gameState.isPlaying) {
        if (gameState.isPaused) {
            resumeGame();
        } else {
            pauseGame();
        }
    }
});

// 级别选择按钮事件监听
const levelButtons = document.querySelectorAll('.level-btn');
levelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const selectedLevel = parseInt(btn.getAttribute('data-level'));
        if (!gameState.isPlaying) {
            // 游戏未开始时，更新级别并开始游戏
            startGame(selectedLevel);
        } else {
            // 游戏进行中时，询问是否重新开始
            if (confirm(`要从级别 ${selectedLevel} 重新开始吗？当前进度将丢失。`)) {
                clearInterval(gameState.spawnInterval);
                startGame(selectedLevel);
            }
        }
    });
});

// 初始化显示
initGame();
