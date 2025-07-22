// Variables globales
let difficulty = 'facil';
let character = '1';
let maze = [];
let playerPos = {x: 0, y: 0};
let exitPos = {x: 0, y: 0};
let steps = 0;
let startTime = 0;
let timerInterval = null;

// Configuración de dificultad
const difficultySettings = {
    facil: { size: 10, name: "Fácil", cellClass: "cell-size-large" },
    medio: { size: 15, name: "Medio", cellClass: "cell-size-medium" },
    avanzado: { size: 20, name: "Avanzado", cellClass: "cell-size-small" }
};

// Nombres de personajes
const characterNames = {
    '1': 'Tony',
    '2': 'Sam',
    '3': 'Melvin',
    '4': 'Cornelio'
};

// Imágenes de personajes
const characterImages = {
    '1': 'personajes/Tony 1.jpg',
    '2': 'personajes/Sam 1.jpg',
    '3': 'personajes/Melvin 1.jpg',
    '4': 'personajes/Cornelio 1.jpg'
};

// Colores de personajes
const characterColors = {
    '1': '#3498db',
    '2': '#e74c3c',
    '3': '#b07d62',
    '4': '#2ecc71'
};

// Frases para pantalla de victoria
const winPhrases = {
    '1': '¡Lo hiciste GRRRAAAANDE!',
    '2': '¡Seguiste la pista y ganaste!',
    '3': '¡Jugaste en grande y ganaste!',
    '4': '¡Ganaste con toda la energía!'
}

// Elementos DOM
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const winScreen = document.getElementById('winScreen');
const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const menuBtn = document.getElementById('menuBtn');
const mazeElement = document.getElementById('maze');
const stepsElement = document.getElementById('steps');
const timerElement = document.getElementById('timer');
const selectedCharName = document.getElementById('selectedCharName');
const selectedLevel = document.getElementById('selectedLevel');
const winCharName = document.getElementById('winCharName');
const winLevel = document.getElementById('winLevel');
const winTime = document.getElementById('winTime');
const winSteps = document.getElementById('winSteps');
const winCharacterImg = document.getElementById('winCharacterImg');

// Selección de dificultad
document.querySelectorAll('.option[data-level]').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.option[data-level]').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        difficulty = option.getAttribute('data-level');
    });
});

// Selección de personaje
document.querySelectorAll('.char-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.char-option').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        character = option.getAttribute('data-char');
    });
});

// Iniciar juego
startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', startGame);

// Volver al menú
backBtn.addEventListener('click', showStartScreen);
menuBtn.addEventListener('click', showStartScreen);

// Controles de movimiento
document.addEventListener('keydown', handleKeyPress);
document.getElementById('upBtn').addEventListener('click', () => movePlayer(0, -1));
document.getElementById('downBtn').addEventListener('click', () => movePlayer(0, 1));
document.getElementById('leftBtn').addEventListener('click', () => movePlayer(-1, 0));
document.getElementById('rightBtn').addEventListener('click', () => movePlayer(1, 0));

// Mostrar pantalla de inicio
function showStartScreen() {
    document.body.style.overflow = 'auto';
    startScreen.style.display = 'flex';
    gameScreen.style.display = 'none';
    winScreen.style.display = 'none';
    clearInterval(timerInterval);
}

// Iniciar juego
function startGame() {
    document.body.style.overflow = 'hidden';
    // Obtener configuración
    const config = difficultySettings[difficulty];
    selectedCharName.textContent = characterNames[character];
    selectedLevel.textContent = config.name;
    
    // Reiniciar estadísticas
    steps = 0;
    stepsElement.textContent = steps;
    startTime = Date.now();
    startTimer();
    
    // Generar laberinto
    generateMaze(config.size);
    renderMaze(config.cellClass);
    
    // Mostrar pantalla de juego
    startScreen.style.display = 'none';
    gameScreen.style.display = 'flex';
    winScreen.style.display = 'none';
    
    // Enfocar el contenedor para eventos de teclado
    mazeElement.focus();
}

// Generar laberinto aleatorio usando Depth-First Search
function generateMaze(size) {
    // Inicializar laberinto
    maze = [];
    for (let y = 0; y < size; y++) {
        maze[y] = [];
        for (let x = 0; x < size; x++) {
            maze[y][x] = {
                top: true,
                right: true,
                bottom: true,
                left: true,
                visited: false
            };
        }
    }
    
    // Posición inicial del jugador
    playerPos = {x: 0, y: 0};
    
    // Crear camino usando DFS
    const stack = [{x: 0, y: 0}];
    maze[0][0].visited = true;
    
    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(current.x, current.y, size);
        
        if (neighbors.length > 0) {
            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWall(current, randomNeighbor);
            maze[randomNeighbor.y][randomNeighbor.x].visited = true;
            stack.push(randomNeighbor);
        } else {
            stack.pop();
        }
    }
    
    // Posición de salida (opuesta al inicio)
    exitPos = {x: size - 1, y: size - 1};
}

// Obtener vecinos no visitados
function getUnvisitedNeighbors(x, y, size) {
    const neighbors = [];
    
    if (y > 0 && !maze[y-1][x].visited) neighbors.push({x, y: y-1, wall: 'top'});
    if (x < size-1 && !maze[y][x+1].visited) neighbors.push({x: x+1, y, wall: 'right'});
    if (y < size-1 && !maze[y+1][x].visited) neighbors.push({x, y: y+1, wall: 'bottom'});
    if (x > 0 && !maze[y][x-1].visited) neighbors.push({x: x-1, y, wall: 'left'});
    
    return neighbors;
}

// Eliminar pared entre dos celdas
function removeWall(current, neighbor) {
    if (neighbor.wall === 'top') {
        maze[current.y][current.x].top = false;
        maze[neighbor.y][neighbor.x].bottom = false;
    } else if (neighbor.wall === 'right') {
        maze[current.y][current.x].right = false;
        maze[neighbor.y][neighbor.x].left = false;
    } else if (neighbor.wall === 'bottom') {
        maze[current.y][current.x].bottom = false;
        maze[neighbor.y][neighbor.x].top = false;
    } else if (neighbor.wall === 'left') {
        maze[current.y][current.x].left = false;
        maze[neighbor.y][neighbor.x].right = false;
    }
}

// Renderizar laberinto con paredes visibles y personaje seleccionado
function renderMaze(cellClass) {
    const size = maze.length;
    mazeElement.innerHTML = '';
    mazeElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add(cellClass);
            
            // Añadir clases de paredes
            const cellData = maze[y][x];
            if (cellData.top) cell.classList.add('wall-top');
            if (cellData.right) cell.classList.add('wall-right');
            if (cellData.bottom) cell.classList.add('wall-bottom');
            if (cellData.left) cell.classList.add('wall-left');
            
            // Añadir jugador con el personaje seleccionado
            if (x === playerPos.x && y === playerPos.y) {
                const player = document.createElement('div');
                player.classList.add('player');
                
                // Crear imagen del personaje
                const charImg = document.createElement('img');
                charImg.src = characterImages[character];
                charImg.alt = characterNames[character];
                player.appendChild(charImg);
                
                // También añadir color de fondo como alternativa
                player.style.backgroundColor = characterColors[character];
                cell.appendChild(player);
            }
            
            // Añadir salida
            if (x === exitPos.x && y === exitPos.y) {
                const exit = document.createElement('div');
                exit.classList.add('exit');
                cell.appendChild(exit);
            }
            
            mazeElement.appendChild(cell);
        }
    }
}

// Mover jugador
function movePlayer(dx, dy) {
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    const size = maze.length;
    
    // Verificar límites
    if (newX < 0 || newX >= size || newY < 0 || newY >= size) return;
    
    // Verificar si el movimiento es válido
    if (dx === -1 && !maze[playerPos.y][playerPos.x].left && !maze[newY][newX].right) {
        playerPos.x = newX;
        steps++;
    } else if (dx === 1 && !maze[playerPos.y][playerPos.x].right && !maze[newY][newX].left) {
        playerPos.x = newX;
        steps++;
    } else if (dy === -1 && !maze[playerPos.y][playerPos.x].top && !maze[newY][newX].bottom) {
        playerPos.y = newY;
        steps++;
    } else if (dy === 1 && !maze[playerPos.y][playerPos.x].bottom && !maze[newY][newX].top) {
        playerPos.y = newY;
        steps++;
    } else {
        return; // Movimiento inválido
    }
    
    // Actualizar UI
    stepsElement.textContent = steps;
    const config = difficultySettings[difficulty];
    renderMaze(config.cellClass);
    
    // Comprobar si ha llegado a la salida
    if (playerPos.x === exitPos.x && playerPos.y === exitPos.y) {
        winGame();
    }
}

// Manejar teclas presionadas
function handleKeyPress(event) {
    switch (event.key) {
        case "ArrowUp":
            event.preventDefault();
            movePlayer(0, -1);
            break;
        case "ArrowDown":
            event.preventDefault();
            movePlayer(0, 1);
            break;
        case "ArrowLeft":
            event.preventDefault();
            movePlayer(-1, 0);
            break;
        case "ArrowRight":
            event.preventDefault();
            movePlayer(1, 0);
            break;
    }
}


// Iniciar temporizador
function startTimer() {
    clearInterval(timerInterval);
    startTime = Date.now();
    
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        timerElement.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

// Ganar el juego
function winGame() {
    clearInterval(timerInterval);
    
    // Actualizar estadísticas de victoria
    winCharName.textContent = characterNames[character];
    winLevel.textContent = difficultySettings[difficulty].name;
    winTime.textContent = timerElement.textContent;
    winSteps.textContent = steps;
    document.getElementById('winPhrase').textContent = winPhrases[character];
    
    // Actualizar imagen del personaje en pantalla de victoria
    winCharacterImg.src = characterImages[character];
    winCharacterImg.alt = characterNames[character];
    
    // Mostrar pantalla de victoria
    gameScreen.style.display = 'none';
    winScreen.style.display = 'flex';
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    showStartScreen();
});
