function toggleFullscreen(gameId) {
    const game = document.getElementById(gameId);
    if (!document.fullscreenElement) {
        game.classList.add('fullscreen');
        if (game.requestFullscreen) {
            game.requestFullscreen();
        } else if (game.webkitRequestFullscreen) {
            game.webkitRequestFullscreen();
        } else if (game.msRequestFullscreen) {
            game.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        game.classList.remove('fullscreen');
    }
}

// Handle ESC key to exit fullscreen
document.addEventListener('fullscreenchange', exitHandler);
document.addEventListener('webkitfullscreenchange', exitHandler);
document.addEventListener('msfullscreenchange', exitHandler);

function exitHandler() {
    if (!document.fullscreenElement && !document.webkitIsFullScreen && !document.msFullscreenElement) {
        document.querySelectorAll('.game-card.fullscreen').forEach(game => {
            game.classList.remove('fullscreen');
        });
    }
}

// Snake Game
(function() {
    const canvas = document.getElementById('snake-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('snake-score');
    const lengthElement = document.getElementById('snake-length');
    const startButton = document.getElementById('snake-start');
    const pauseButton = document.getElementById('snake-pause');

    const gridSize = 20;
    const tileSize = canvas.width / gridSize;
    let snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
    let food = {x: 0, y: 0};
    let dx = 1;
    let dy = 0;
    let score = 0;
    let baseSpeed = 120;
    let speedIncrease = 2;
    let gameSpeed = baseSpeed;
    let gameInterval;
    let isPaused = false;
    let isGameRunning = false;
    let growthAmount = 1;

    function drawTile(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }

    function generateFood() {
        food.x = Math.floor(Math.random() * gridSize);
        food.y = Math.floor(Math.random() * gridSize);

        // Make sure food doesn't spawn on snake
        for (let segment of snake) {
            if (segment.x === food.x && segment.y === food.y) {
                return generateFood();
            }
        }
    }

    function update() {
        if (isPaused || !isGameRunning) return;

        const head = {x: snake[0].x + dx, y: snake[0].y + dy};

        // Wall collision
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            gameOver();
            return;
        }

        // Self collision
        for (let segment of snake) {
            if (segment.x === head.x && segment.y === head.y) {
                gameOver();
                return;
            }
        }

        snake.unshift(head);

        // Food collision
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            scoreElement.textContent = score;

            // Increase length
            for (let i = 0; i < growthAmount; i++) {
                snake.push({...snake[snake.length-1]});
            }
            lengthElement.textContent = snake.length;

            // Increase growth amount every 5 foods
            if (score % 50 === 0) {
                growthAmount++;
            }

            // Increase speed (but not too fast)
            gameSpeed = Math.max(60, gameSpeed - speedIncrease);
            clearInterval(gameInterval);
            gameInterval = setInterval(update, gameSpeed);

            generateFood();
        } else {
            snake.pop();
        }

        draw();
    }

    function draw() {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        snake.forEach((segment, index) => {
            // Head is brighter green
            const color = index === 0 ? '#0f0' : '#0a0';
            drawTile(segment.x, segment.y, color);
        });

        // Draw food
        drawTile(food.x, food.y, '#f00');
    }

    function gameOver() {
        clearInterval(gameInterval);
        isGameRunning = false;
        alert(`Game Over! Your score: ${score}\nLength: ${snake.length}`);
        resetGame();
    }

    function resetGame() {
        snake = [{x: 10, y: 10}, {x: 9, y: 10}, {x: 8, y: 10}];
        dx = 1;
        dy = 0;
        score = 0;
        scoreElement.textContent = score;
        lengthElement.textContent = snake.length;
        gameSpeed = baseSpeed;
        growthAmount = 1;
        generateFood();
        draw();
    }

    function startGame() {
        if (gameInterval) clearInterval(gameInterval);
        resetGame();
        isGameRunning = true;
        gameInterval = setInterval(update, gameSpeed);
        isPaused = false;
        pauseButton.textContent = 'Pause';
    }

    function togglePause() {
        if (!isGameRunning) return;

        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    }

    document.addEventListener('keydown', function(e) {
        if (!isGameRunning || isPaused) return;

        switch(e.key) {
            case 'ArrowUp':
                if (dy !== 1) { dx = 0; dy = -1; }
                break;
            case 'ArrowDown':
                if (dy !== -1) { dx = 0; dy = 1; }
                break;
            case 'ArrowLeft':
                if (dx !== 1) { dx = -1; dy = 0; }
                break;
            case 'ArrowRight':
                if (dx !== -1) { dx = 1; dy = 0; }
                break;
        }
    });

    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);

    generateFood();
    draw();
})();

// Tetris Game
(function() {
    const canvas = document.getElementById('tetris-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('tetris-score');
    const linesElement = document.getElementById('tetris-lines');
    const levelElement = document.getElementById('tetris-level');
    const startButton = document.getElementById('tetris-start');
    const pauseButton = document.getElementById('tetris-pause');

    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = canvas.width / COLS;
    const SHAPES = [
        [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], // I
        [[1,1], [1,1]], // O
        [[0,1,0], [1,1,1], [0,0,0]], // T
        [[1,0,0], [1,1,1], [0,0,0]], // L
        [[0,0,1], [1,1,1], [0,0,0]], // J
        [[0,1,1], [1,1,0], [0,0,0]], // S
        [[1,1,0], [0,1,1], [0,0,0]]  // Z
    ];
    const COLORS = ['#000', '#00F', '#0A0', '#F0F', '#FF0', '#0FF', '#F00', '#F80'];

    let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    let piece = null;
    let nextPiece = null;
    let score = 0;
    let lines = 0;
    let level = 1;
    let gameInterval;
    let isPaused = false;
    let dropCounter = 0;
    let baseDropInterval = 1000;
    let dropInterval = baseDropInterval;
    let lastTime = 0;
    let isGameRunning = false;

    function createPiece() {
        const shapeId = Math.floor(Math.random() * SHAPES.length);
        const shape = SHAPES[shapeId];
        const piece = {
            shape,
            color: COLORS[shapeId],
            pos: {x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0}
        };
        return piece;
    }

    function drawBlock(x, y, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    }

    function draw() {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw board
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                if (board[y][x]) {
                    drawBlock(x, y, board[y][x]);
                }
            }
        }

        // Draw current piece
        if (piece) {
            piece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        drawBlock(piece.pos.x + x, piece.pos.y + y, piece.color);
                    }
                });
            });
        }
    }

    function merge() {
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    board[piece.pos.y + y][piece.pos.x + x] = piece.color;
                }
            });
        });
    }

    function rotate() {
        const rotated = piece.shape[0].map((_, i) => 
            piece.shape.map(row => row[i]).reverse()
        );

        if (!collision(rotated)) {
            piece.shape = rotated;
        }
    }

    function collision(shape = piece.shape) {
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] !== 0) {
                    const newX = piece.pos.x + x;
                    const newY = piece.pos.y + y;

                    if (newX < 0 || newX >= COLS || newY >= ROWS) {
                        return true;
                    }

                    if (newY >= 0 && board[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function clearLines() {
        let linesCleared = 0;

        for (let y = ROWS - 1; y >= 0; y--) {
            if (board[y].every(cell => cell !== 0)) {
                board.splice(y, 1);
                board.unshift(Array(COLS).fill(0));
                linesCleared++;
                y++; // Check same row again
            }
        }

        if (linesCleared > 0) {
            lines += linesCleared;
            linesElement.textContent = lines;

            // Update score based on lines cleared
            const points = [0, 100, 300, 500, 800][linesCleared] * level;
            score += points;
            scoreElement.textContent = score;

            // Level up every 10 lines
            const newLevel = Math.floor(lines / 10) + 1;
            if (newLevel > level) {
                level = newLevel;
                levelElement.textContent = level;
                dropInterval = Math.max(100, baseDropInterval - (level * 100));
            }
        }
    }

    function resetGame() {
        board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
        score = 0;
        lines = 0;
        level = 1;
        scoreElement.textContent = score;
        linesElement.textContent = lines;
        levelElement.textContent = level;
        dropInterval = baseDropInterval;
        piece = createPiece();
        nextPiece = createPiece();
    }

    function gameOver() {
        isGameRunning = false;
        clearInterval(gameInterval);
        alert(`Game Over! Your score: ${score}\nLevel: ${level}`);
        resetGame();
    }

    function update(time = 0) {
        if (isPaused || !isGameRunning) return;

        const deltaTime = time - lastTime;
        lastTime = time;

        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            piece.pos.y++;
            if (collision()) {
                piece.pos.y--;
                merge();
                clearLines();
                piece = nextPiece;
                nextPiece = createPiece();

                if (collision()) {
                    gameOver();
                    return;
                }
            }
            dropCounter = 0;
        }

        draw();
        requestAnimationFrame(update);
    }

    function startGame() {
        if (gameInterval) clearInterval(gameInterval);
        resetGame();
        lastTime = 0;
        dropCounter = 0;
        isPaused = false;
        isGameRunning = true;
        pauseButton.textContent = 'Pause';
        update();
    }

    function togglePause() {
        if (!isGameRunning) return;

        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
        if (!isPaused) {
            lastTime = 0;
            dropCounter = 0;
            update();
        }
    }

    function hardDrop() {
        if (isPaused || !isGameRunning) return;

        while (!collision()) {
            piece.pos.y++;
        }
        piece.pos.y--;
        merge();
        clearLines();
        piece = nextPiece;
        nextPiece = createPiece();

        if (collision()) {
            gameOver();
            return;
        }

        dropCounter = 0;
    }

    function softDrop() {
        if (isPaused || !isGameRunning) return;

        piece.pos.y++;
        if (collision()) {
            piece.pos.y--;
        } else {
            score += 1;
            scoreElement.textContent = score;
        }
        dropCounter = 0;
    }

    document.addEventListener('keydown', function(e) {
        if (isPaused || !isGameRunning) return;

        switch(e.key) {
            case 'ArrowLeft':
                piece.pos.x--;
                if (collision()) piece.pos.x++;
                break;
            case 'ArrowRight':
                piece.pos.x++;
                if (collision()) piece.pos.x--;
                break;
            case 'ArrowDown':
                softDrop();
                break;
            case 'ArrowUp':
                rotate();
                break;
            case ' ':
                hardDrop();
                break;
        }
    });

    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);

    resetGame();
    draw();
})();

// 2048 Game
(function() {
    const canvas = document.getElementById('game2048-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('game2048-score');
    const startButton = document.getElementById('game2048-start');

    const GRID_SIZE = 4;
    const TILE_SIZE = canvas.width / GRID_SIZE;
    let grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
    let score = 0;
    let gameOver = false;

    const COLORS = {
        0: '#ccc',
        2: '#eee4da',
        4: '#ede0c8',
        8: '#f2b179',
        16: '#f59563',
        32: '#f67c5f',
        64: '#f65e3b',
        128: '#edcf72',
        256: '#edcc61',
        512: '#edc850',
        1024: '#edc53f',
        2048: '#edc22e'
    };

    function drawTile(x, y, value) {
        ctx.fillStyle = COLORS[value] || '#000';
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        if (value > 0) {
            ctx.fillStyle = value <= 4 ? '#776e65' : '#f9f6f2';
            ctx.font = 'bold ' + (TILE_SIZE / 2) + 'px Courier New';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value, x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
        }
    }

    function draw() {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                drawTile(x, y, grid[y][x]);
            }
        }
    }

    function addRandomTile() {
        const emptyCells = [];

        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[y][x] === 0) {
                    emptyCells.push({x, y});
                }
            }
        }

        if (emptyCells.length > 0) {
            const {x, y} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            grid[y][x] = Math.random() < 0.9 ? 2 : 4;
            return true;
        }

        return false;
    }

    function moveTiles(direction) {
        let moved = false;
        const oldGrid = grid.map(row => [...row]);

        // Rotate grid to simplify movement logic
        if (direction === 'up' || direction === 'down') {
            grid = grid[0].map((_, i) => grid.map(row => row[i]));
        }

        if (direction === 'right' || direction === 'down') {
            grid.forEach(row => row.reverse());
        }

        // Process each row
        for (let y = 0; y < GRID_SIZE; y++) {
            // Remove zeros
            let row = grid[y].filter(val => val !== 0);

            // Merge tiles
            for (let i = 0; i < row.length - 1; i++) {
                if (row[i] === row[i + 1]) {
                    row[i] *= 2;
                    score += row[i];
                    scoreElement.textContent = score;
                    row.splice(i + 1, 1);
                }
            }

            // Add zeros back
            while (row.length < GRID_SIZE) {
                row.push(0);
            }

            if (JSON.stringify(grid[y]) !== JSON.stringify(row)) {
                moved = true;
            }

            grid[y] = row;
        }

        // Reverse changes from rotation
        if (direction === 'right' || direction === 'down') {
            grid.forEach(row => row.reverse());
        }

        if (direction === 'up' || direction === 'down') {
            grid = grid[0].map((_, i) => grid.map(row => row[i]));
        }

        // Check if any tile moved
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[y][x] !== oldGrid[y][x]) {
                    moved = true;
                    break;
                }
            }
            if (moved) break;
        }

        return moved;
    }

    function checkGameOver() {
        // Check for empty cells
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (grid[y][x] === 0) {
                    return false;
                }
            }
        }

        // Check for possible merges
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE - 1; x++) {
                if (grid[y][x] === grid[y][x + 1]) {
                    return false;
                }
            }
        }

        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE - 1; y++) {
                if (grid[y][x] === grid[y + 1][x]) {
                    return false;
                }
            }
        }

        return true;
    }

    function resetGame() {
        grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
        score = 0;
        scoreElement.textContent = score;
        gameOver = false;
        addRandomTile();
        addRandomTile();
        draw();
    }

    function handleMove(direction) {
        if (gameOver) return;

        if (moveTiles(direction)) {
            addRandomTile();
            draw();

            if (checkGameOver()) {
                gameOver = true;
                setTimeout(() => alert(`Game Over! Your score: ${score}`), 100);
            }
        }
    }

    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowUp': handleMove('up'); break;
            case 'ArrowDown': handleMove('down'); break;
            case 'ArrowLeft': handleMove('left'); break;
            case 'ArrowRight': handleMove('right'); break;
        }
    });

    startButton.addEventListener('click', resetGame);

    resetGame();
})();

// Pong Game
(function() {
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');
    const playerScoreElement = document.getElementById('pong-player-score');
    const computerScoreElement = document.getElementById('pong-computer-score');
    const startButton = document.getElementById('pong-start');
    const pauseButton = document.getElementById('pong-pause');

    const PADDLE_WIDTH = 10;
    const PADDLE_HEIGHT = 80;
    const BALL_SIZE = 10;
    const PADDLE_SPEED = 8;
    const COMPUTER_SPEED = 6;

    let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
    let computerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 5;
    let ballSpeedY = 5;
    let playerScore = 0;
    let computerScore = 0;
    let isPaused = false;
    let gameInterval;

    function draw() {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw center line
        ctx.strokeStyle = '#0f0';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw paddles
        ctx.fillStyle = '#0f0';
        ctx.fillRect(10, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillRect(canvas.width - 20, computerY, PADDLE_WIDTH, PADDLE_HEIGHT);

        // Draw ball
        ctx.beginPath();
        ctx.arc(ballX, ballY, BALL_SIZE, 0, Math.PI * 2);
        ctx.fillStyle = '#f00';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();

        // Draw scores
        ctx.fillStyle = '#0f0';
        ctx.font = '30px Courier New';
        ctx.fillText(playerScore, 100, 50);
        ctx.fillText(computerScore, canvas.width - 100, 50);
    }

    function update() {
        if (isPaused) return;

        // Move ball
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Ball collision with top and bottom
        if (ballY - BALL_SIZE < 0 || ballY + BALL_SIZE > canvas.height) {
            ballSpeedY = -ballSpeedY;
        }

        // Ball collision with player paddle
        if (ballX - BALL_SIZE < 20 && 
            ballY > playerY && 
            ballY < playerY + PADDLE_HEIGHT) {
            ballSpeedX = Math.abs(ballSpeedX);
            // Add spin based on where ball hits paddle
            const hitPosition = (ballY - playerY) / PADDLE_HEIGHT;
            ballSpeedY = 8 * (hitPosition - 0.5);
        }

        // Ball collision with computer paddle
        if (ballX + BALL_SIZE > canvas.width - 20 && 
            ballY > computerY && 
            ballY < computerY + PADDLE_HEIGHT) {
            ballSpeedX = -Math.abs(ballSpeedX);
            // Add spin based on where ball hits paddle
            const hitPosition = (ballY - computerY) / PADDLE_HEIGHT;
            ballSpeedY = 8 * (hitPosition - 0.5);
        }

        // Ball out of bounds
        if (ballX < 0) {
            computerScore++;
            computerScoreElement.textContent = computerScore;
            resetBall();
        } else if (ballX > canvas.width) {
            playerScore++;
            playerScoreElement.textContent = playerScore;
            resetBall();
        }

        // Computer AI
        if (computerY + PADDLE_HEIGHT / 2 < ballY) {
            computerY += COMPUTER_SPEED;
        } else {
            computerY -= COMPUTER_SPEED;
        }

        // Keep computer paddle in bounds
        if (computerY < 0) computerY = 0;
        if (computerY > canvas.height - PADDLE_HEIGHT) computerY = canvas.height - PADDLE_HEIGHT;

        draw();

        // Check win condition
        if (playerScore >= 5 || computerScore >= 5) {
            clearInterval(gameInterval);
            alert(`Game Over! ${playerScore >= 5 ? 'Player' : 'Computer'} wins!`);
            resetGame();
        }
    }

    function resetBall() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 5;
        ballSpeedY = (Math.random() * 4 - 2);
    }

    function resetGame() {
        playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
        computerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
        playerScore = 0;
        computerScore = 0;
        playerScoreElement.textContent = playerScore;
        computerScoreElement.textContent = computerScore;
        resetBall();
    }

    function startGame() {
        if (gameInterval) clearInterval(gameInterval);
        resetGame();
        gameInterval = setInterval(update, 1000/60);
        isPaused = false;
        pauseButton.textContent = 'Pause';
    }

    function togglePause() {
        isPaused = !isPaused;
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    }

    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                playerY -= PADDLE_SPEED;
                if (playerY < 0) playerY = 0;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                playerY += PADDLE_SPEED;
                if (playerY > canvas.height - PADDLE_HEIGHT) playerY = canvas.height - PADDLE_HEIGHT;
                break;
        }
    });

    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);

    draw();
})();

// Space Invaders Game
(function() {
    const canvas = document.getElementById('invaders-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('invaders-score');
    const livesElement = document.getElementById('invaders-lives');
    const startButton = document.getElementById('invaders-start');

    const PLAYER_WIDTH = 40;
    const PLAYER_HEIGHT = 20;
    const BULLET_SIZE = 4;
    const BULLET_SPEED = 7;
    const ENEMY_ROWS = 4;
    const ENEMY_COLS = 8;
    const ENEMY_WIDTH = 30;
    const ENEMY_HEIGHT = 25;
    const ENEMY_SPACING = 40;

    let playerX = canvas.width / 2 - PLAYER_WIDTH / 2;
    let playerSpeed = 6;
    let bullets = [];
    let enemies = [];
    let enemySpeed = 1;
    let enemyDirection = 1;
    let score = 0;
    let lives = 3;
    let isGameRunning = false;
    let gameInterval;

    function initEnemies() {
        enemies = [];
        for (let row = 0; row < ENEMY_ROWS; row++) {
            for (let col = 0; col < ENEMY_COLS; col++) {
                enemies.push({
                    x: col * ENEMY_SPACING + 50,
                    y: row * ENEMY_SPACING + 30,
                    alive: true
                });
            }
        }
    }

    function draw() {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw player
        ctx.fillStyle = '#0f0';
        ctx.fillRect(playerX, canvas.height - 40, PLAYER_WIDTH, PLAYER_HEIGHT);

        // Draw bullets
        ctx.fillStyle = '#ff0';
        bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, BULLET_SIZE, BULLET_SIZE * 2);
        });

        // Draw enemies
        enemies.forEach(enemy => {
            if (enemy.alive) {
                ctx.fillStyle = '#f00';
                ctx.fillRect(enemy.x, enemy.y, ENEMY_WIDTH, ENEMY_HEIGHT);
            }
        });
    }

    function update() {
        if (!isGameRunning) return;

        // Move player
        if (keys['ArrowLeft'] && playerX > 0) {
            playerX -= playerSpeed;
        }
        if (keys['ArrowRight'] && playerX < canvas.width - PLAYER_WIDTH) {
            playerX += playerSpeed;
        }

        // Move bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= BULLET_SPEED;

            // Remove bullets that go off screen
            if (bullets[i].y < 0) {
                bullets.splice(i, 1);
                continue;
            }

            // Check for bullet-enemy collisions
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (enemies[j].alive && 
                    bullets[i].x > enemies[j].x && 
                    bullets[i].x < enemies[j].x + ENEMY_WIDTH &&
                    bullets[i].y > enemies[j].y && 
                    bullets[i].y < enemies[j].y + ENEMY_HEIGHT) {

                    enemies[j].alive = false;
                    bullets.splice(i, 1);
                    score += 10;
                    scoreElement.textContent = score;
                    break;
                }
            }
        }

        // Move enemies
        let edgeReached = false;
        enemies.forEach(enemy => {
            if (!enemy.alive) return;

            enemy.x += enemySpeed * enemyDirection;

            // Check if enemy reached edge
            if (enemy.x <= 0 || enemy.x + ENEMY_WIDTH >= canvas.width) {
                edgeReached = true;
            }
        });

        if (edgeReached) {
            enemyDirection *= -1;
            enemies.forEach(enemy => {
                if (enemy.alive) {
                    enemy.y += 20;
                    // Check if enemy reached bottom
                    if (enemy.y + ENEMY_HEIGHT >= canvas.height - 40) {
                        lives--;
                        livesElement.textContent = lives;
                        if (lives <= 0) {
                            gameOver();
                            return;
                        }
                        resetPlayer();
                    }
                }
            });
        }

        // Check if all enemies are destroyed
        const allDead = enemies.every(enemy => !enemy.alive);
        if (allDead) {
            winGame();
            return;
        }

        draw();
    }

    function resetPlayer() {
        playerX = canvas.width / 2 - PLAYER_WIDTH / 2;
        bullets = [];
    }

    function shoot() {
        if (bullets.length < 3) {
            bullets.push({
                x: playerX + PLAYER_WIDTH / 2 - BULLET_SIZE / 2,
                y: canvas.height - 40
            });
        }
    }

    function gameOver() {
        clearInterval(gameInterval);
        isGameRunning = false;
        alert(`Game Over! Your score: ${score}`);
        resetGame();
    }

    function winGame() {
        clearInterval(gameInterval);
        isGameRunning = false;
        alert(`You Win! Your score: ${score}`);
        resetGame();
    }

    function resetGame() {
        playerX = canvas.width / 2 - PLAYER_WIDTH / 2;
        bullets = [];
        initEnemies();
        score = 0;
        lives = 3;
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        enemySpeed = 1;
        enemyDirection = 1;
    }

    function startGame() {
        if (gameInterval) clearInterval(gameInterval);
        resetGame();
        isGameRunning = true;
        gameInterval = setInterval(update, 1000/60);
    }

    const keys = {};
    document.addEventListener('keydown', function(e) {
        keys[e.key] = true;
        if (e.key === ' ' && isGameRunning) {
            shoot();
        }
    });

    document.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });

    startButton.addEventListener('click', startGame);

    initEnemies();
    draw();
})();

// Minesweeper Game
(function() {
    const canvas = document.getElementById('minesweeper-canvas');
    const ctx = canvas.getContext('2d');
    const flagsElement = document.getElementById('minesweeper-flags');
    const totalMinesElement = document.getElementById('minesweeper-total-mines');
    const startButton = document.getElementById('minesweeper-start');
    const difficultyButtons = document.querySelectorAll('.difficulty-btn');

    // Game settings
    const settings = {
        easy: { rows: 9, cols: 9, mines: 10 },
        medium: { rows: 16, cols: 16, mines: 40 },
        hard: { rows: 16, cols: 30, mines: 99 }
    };

    let currentDifficulty = 'easy';
    let rows = settings.easy.rows;
    let cols = settings.easy.cols;
    let mines = settings.easy.mines;
    let tileSize;
    let board = [];
    let revealed = [];
    let flagged = [];
    let gameOver = false;
    let firstClick = true;
    let flagsPlaced = 0;

    // Colors
    const colors = {
        hidden: '#333',
        revealed: '#111',
        flag: '#f00',
        mine: '#000',
        text: ['#000', '#00f', '#0a0', '#f00', '#008', '#800', '#088', '#000', '#000'],
        mineRed: '#f00'
    };

    function initGame() {
        // Calculate tile size based on canvas and board size
        tileSize = Math.min(canvas.width / cols, canvas.height / rows);

        // Initialize boards
        board = Array(rows).fill().map(() => Array(cols).fill(0));
        revealed = Array(rows).fill().map(() => Array(cols).fill(false));
        flagged = Array(rows).fill().map(() => Array(cols).fill(false));

        gameOver = false;
        firstClick = true;
        flagsPlaced = 0;
        updateFlagCounter();

        drawBoard();
    }

    function placeMines(avoidRow, avoidCol) {
        let minesPlaced = 0;

        while (minesPlaced < mines) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);

            // Don't place mine on first click or where mines already exist
            if ((row !== avoidRow || col !== avoidCol) && board[row][col] !== -1) {
                board[row][col] = -1; // -1 represents a mine
                minesPlaced++;

                // Increment numbers around the mine
                for (let r = Math.max(0, row-1); r <= Math.min(rows-1, row+1); r++) {
                    for (let c = Math.max(0, col-1); c <= Math.min(cols-1, col+1); c++) {
                        if (board[r][c] !== -1) {
                            board[r][c]++;
                        }
                    }
                }
            }
        }
    }

    function drawBoard() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * tileSize;
                const y = row * tileSize;

                if (revealed[row][col]) {
                    // Draw revealed tile
                    ctx.fillStyle = colors.revealed;
                    ctx.fillRect(x, y, tileSize, tileSize);

                    // Draw number or mine
                    if (board[row][col] === -1) {
                        // Mine
                        ctx.fillStyle = colors.mine;
                        ctx.beginPath();
                        ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/3, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = colors.mineRed;
                        ctx.beginPath();
                        ctx.arc(x + tileSize/2, y + tileSize/2, tileSize/4, 0, Math.PI * 2);
                        ctx.fill();
                    } else if (board[row][col] > 0) {
                        // Number
                        ctx.fillStyle = colors.text[board[row][col]];
                        ctx.font = `bold ${tileSize/2}px Courier New`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(board[row][col], x + tileSize/2, y + tileSize/2);
                    }
                } else {
                    // Draw hidden tile
                    ctx.fillStyle = colors.hidden;
                    ctx.fillRect(x, y, tileSize, tileSize);

                    // Draw flag if present
                    if (flagged[row][col]) {
                        ctx.fillStyle = colors.flag;
                        ctx.beginPath();
                        ctx.moveTo(x + tileSize/4, y + tileSize/4);
                        ctx.lineTo(x + tileSize/4, y + tileSize*3/4);
                        ctx.lineTo(x + tileSize*3/4, y + tileSize/2);
                        ctx.closePath();
                        ctx.fill();
                    }
                }

                // Draw grid
                ctx.strokeStyle = '#0f0';
                ctx.strokeRect(x, y, tileSize, tileSize);
            }
        }
    }

    function revealTile(row, col) {
        if (row < 0 || row >= rows || col < 0 || col >= cols || revealed[row][col] || flagged[row][col]) {
            return;
        }

        revealed[row][col] = true;

        if (board[row][col] === -1) {
            // Hit a mine - game over
            gameOver = true;
            revealAllMines();
            alert('Game Over! You hit a mine.');
            return;
        }

        if (board[row][col] === 0) {
            // Reveal adjacent tiles if this is a blank space
            for (let r = Math.max(0, row-1); r <= Math.min(rows-1, row+1); r++) {
                for (let c = Math.max(0, col-1); c <= Math.min(cols-1, col+1); c++) {
                    if (!(r === row && c === col)) {
                        revealTile(r, c);
                    }
                }
            }
        }

        checkWin();
    }

    function revealAllMines() {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (board[row][col] === -1) {
                    revealed[row][col] = true;
                }
            }
        }
        drawBoard();
    }

    function toggleFlag(row, col) {
        if (revealed[row][col] || gameOver) return;

        if (flagged[row][col]) {
            flagged[row][col] = false;
            flagsPlaced--;
        } else if (flagsPlaced < mines) {
            flagged[row][col] = true;
            flagsPlaced++;
        }

        updateFlagCounter();
        drawBoard();
    }

    function updateFlagCounter() {
        flagsElement.textContent = flagsPlaced;
        totalMinesElement.textContent = mines;
    }

    function checkWin() {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (board[row][col] !== -1 && !revealed[row][col]) {
                    return; // There are still unrevealed safe tiles
                }
            }
        }

        // All safe tiles revealed - you win!
        gameOver = true;
        alert('Congratulations! You won!');
    }

    function handleClick(e) {
        if (gameOver) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const col = Math.floor(x / tileSize);
        const row = Math.floor(y / tileSize);

        if (row < 0 || row >= rows || col < 0 || col >= cols) return;

        if (e.button === 0) { // Left click
            if (firstClick) {
                firstClick = false;
                placeMines(row, col);
            }

            if (!flagged[row][col]) {
                revealTile(row, col);
                drawBoard();
            }
        } else if (e.button === 2) { // Right click
            toggleFlag(row, col);
        }
    }

    function setDifficulty(difficulty) {
        currentDifficulty = difficulty;
        const setting = settings[difficulty];
        rows = setting.rows;
        cols = setting.cols;
        mines = setting.mines;

        // Update active button
        difficultyButtons.forEach(btn => {
            if (btn.dataset.difficulty === difficulty) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        initGame();
    }

    // Event listeners
    canvas.addEventListener('mousedown', function(e) {
        e.preventDefault(); // Prevent context menu on right click
        handleClick(e);
    });

    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault(); // Prevent context menu on right click
    });

    startButton.addEventListener('click', initGame);

    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            setDifficulty(this.dataset.difficulty);
        });
    });

    // Initialize game
    setDifficulty('easy');
})();