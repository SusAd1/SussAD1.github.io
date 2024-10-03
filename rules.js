const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const gameInformation = document.querySelector("#information");
const ctxI =  gameInformation.getContext("2d");

const resetBtn = document.querySelector("#resetBtn");
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;
const informationWidth = gameInformation.width;
const informationHeight = gameInformation.height;
const bgColour = "white";
const unitSize = 30;
const itemColour = "green";

const playerIMG = new Image();
playerIMG.src = "/graphics /student.jpg";

const itemIMG = new Image();
itemIMG.src = "/graphics /book.jpg"; 

const enemyIMG = new Image();
enemyIMG.src = "/graphics /cigarette.jpg"; // Adjust the path

let running = false;
let pause = false;
let score = 0;

let items = [];
let max_items = 5;

let enemies = []; 
let max_enemy = 10;
let enemy_waits_for = 8;
let increase_Game_Diffulcity_after = 15;

let playerCor =[
  {x:0, y:0}, 
  {x:0, y:unitSize}
]
let health = 3;

let magnet = [unitSize*2,unitSize*2];


document.addEventListener("keydown", (e) => {
  setTimeout(() => movePlayerKey(e),60)
});
resetBtn.addEventListener("click", resetGame);
pauseBtn.addEventListener("click", pauseGame)

document.getElementById("dpad-up").addEventListener("click", () =>   movePlayerKey({key: 'w'}) );
document.getElementById("dpad-down").addEventListener("click", () => movePlayerKey({key: 's'}));
document.getElementById("dpad-left").addEventListener("click", () => movePlayerKey({key: 'a'}));
document.getElementById("dpad-right").addEventListener("click", () => movePlayerKey({key: 'd'}));

let imagesLoaded = 0;

enemyIMG.onload = () => {
  imagesLoaded++;
  if (imagesLoaded === 3) {
    startGame();
  }
};

playerIMG.onload = () => {
  imagesLoaded++;
  if (imagesLoaded === 3) {
    startGame();
  }
};

itemIMG.onload = () => {
  imagesLoaded++;
  if (imagesLoaded === 3) {
    startGame();
  }
};

function magnet(){
  ctx.fillStyle = "cyan";
  ctx.fillRect(playerCor[0].x-magnet[0],playerCo[0])
}

function startGame() {
  running = true;
  createItem();
  drawItem();
  drawPlayer();
  addEnemy();
  addEnemy();
  displayInformation();
  nextTick();
  setInterval(addEnemy, 15000);
  setInterval(createItem, 5000);
}

function nextTick() {
  if (running) {
    setTimeout(() => {
      clearBoard();
      displayInformation();
      moveEnemies();
      drawItem();
      drawEnemies();
      drawPlayer();
      checkItemTouch();
      checkGameOver();
      increase_Game_Diffulcity();
      nextTick();
    }, 200);
  } else if(!pause) gameOver();
}

function clearBoard() {
  ctx.fillStyle = bgColour;
  ctx.fillRect(0, 0, gameWidth, gameHeight);
}

function createItem() {
  if (items.length >= max_items) return;
  function randomItem(max, min) {
    let randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
    return randNum;
  }
  let itemX = randomItem(0, gameWidth - unitSize);
  let itemY = randomItem(0, gameHeight - unitSize);
  playerCor.forEach(player => {
  if(itemX != player.x || itemY != player.y){
    items.push({x: itemX,y: itemY});
  }
  })
}

function drawItem() {
  ctx.fillStyle = itemColour;
  items.forEach(item =>{ctx.drawImage(itemIMG,item.x, item.y, unitSize, unitSize);})
}

function checkItemTouch() {
  items.forEach((item,index) =>{
    playerCor.forEach(player => {
      if (player.x == item.x && player.y == item.y) {
        score += 0.5;
        items.splice(index,1);
        createItem();
      }
    })
  })
}

function drawPlayer() {
  ctx.drawImage(playerIMG,playerCor[0].x, playerCor[0].y, unitSize, unitSize*2);
}

function movePlayerKey(Event) {
  if (!running && !pause) return;
  if (Event.key == "w" || Event.key == "ArrowUp") playerCor.forEach(plyr => plyr.y -= unitSize);
  if (Event.key == "s" || Event.key == "ArrowDown") playerCor.forEach(plyr => plyr.y += unitSize); 
  if (Event.key == "a" || Event.key == "ArrowLeft") playerCor.forEach(plyr => plyr.x -= unitSize);
  if (Event.key == "d" || Event.key == "ArrowRight") playerCor.forEach(plyr => plyr.x += unitSize);
  if (Event.key == "p" || Event.key == "P") pauseGame();
  checkItemTouch();
  checkGameOver();
}

function drawEnemies() {
  enemies.forEach(enemy => {
    ctx.drawImage(enemyIMG, enemy.x, enemy.y, unitSize, unitSize);
  });
}
function moveEnemies(){
  enemies.forEach(enemy => {
    let player = playerCor[0];
    if(enemy.wait >= enemy_waits_for){
      let newX = enemy.x;
      let newY = enemy.y;

      if (enemy.x > player.x){
        newX = enemy.x - unitSize; // Move left
      }
      if (enemy.x < player.x){
        newX = enemy.x + unitSize; // Move right
      }
      if (enemy.y < player.y){
        newY = enemy.y + unitSize; // Move down
      }
      if (enemy.y > player.y){
        newY = enemy.y - unitSize; // Move up
      }

      // Check for collisions with other enemies
      let collision = enemies.some(enemy1 => enemy1.x === newX && enemy1.y === newY);
      
      if (!collision && isWithinBounds(newX, newY)) {
        enemy.x = newX;
        enemy.y = newY;
      }
      
      enemy.wait = 0;
    }
    else {
      enemy.wait += 1;
    }
  });
}

// Helper function to ensure new positions are within game boundaries
function isWithinBounds(x, y) {
  return x >= 0 && x < gameWidth && y >= 0 && y < gameHeight;
}

function addEnemy() {
  if (enemies.length >= max_enemy) return;
  function randomPosition() {
    return Math.round(Math.random() * (gameWidth - unitSize) / unitSize) * unitSize;
  }
  let enemyX = randomPosition();
  let enemyY = randomPosition();
  
  if (enemyX != playerCor[0].x || enemyY != playerCor[0].y){
    let collision = false;
    items.forEach(item =>{
      if (enemyX == item.x && enemyY == item.y) {
        collision = true;
      }
    });
    enemies.forEach(enemy =>{
      if (enemyX == enemy.x && enemyY == enemy.y) {
        collision = true;
      }
    });
    if (!collision){
      enemies.push({x: enemyX,y: enemyY,wait:0});
    } else {
      addEnemy();
    }
  } else {
    addEnemy();
  }
}

function displayInformation() {
  ctxI.fillStyle = "silver";  
  ctxI.fillRect(0, 0, informationWidth, unitSize + 10); 
  
  ctxI.fillStyle = "black";
  ctxI.font = `20px Arial`;
  ctxI.fillText(`Score: ${score}`, 0, 25);  // Display score
  ctxI.fillText(`Health: ${health}/3`, informationWidth - 100, 25);  // Display health on the top-right
}

function increase_Game_Diffulcity() {
  if (increase_Game_Diffulcity_after <= score){
    addEnemy();
    max_enemy += 0.75;
    if (max_items > 3) max_items -= 0.5;
    increase_Game_Diffulcity_after += 10;
    if(enemy_waits_for > 7 ) enemy_waits_for -= 0.5;
  }
}

function checkGameOver() {
  playerCor.forEach(player =>{
  if (player.x < 0 || player.x >= gameWidth || player.y < 0 || player.y >= gameHeight) {
    gameOver();
    return;
  }
  });
  enemies.forEach((enemy,index)=> {
    playerCor.forEach(player =>{
    if (player.x === enemy.x && player.y === enemy.y) {
      health -= 1;
      enemies.splice(index,1)
      addEnemy();
    }
    });
  });
  displayInformation();
  if (health <= 0) gameOver();
}

function gameOver() {
  running = false;
  ctx.fillStyle = "black";
  ctx.font = "24px Arial";
  ctx.fillText("Game Over", gameWidth / 2 - 60, gameHeight / 2 -unitSize);
  ctx.fillText(`Score: ${score}`, gameWidth / 2 - 60, gameHeight / 2 +1);
  ctx.fillText("Press r or reset to reset the game", gameWidth / 2 - 180, gameHeight / 2+unitSize+1);
}

function resetGame() {
  running = true;
  playerCor = [{x:0, y:0},{x:0, y:unitSize}];
  enemies = [];
  items = [];
  score = 0;
  health = 3;
  enemy_waits_for = 8;
  max_enemy = 10;
  increase_Game_Diffulcity_after = 15;
  createItem();
  startGame();
}

function pauseGame() {
  if (!pause){
    running = false;
    pause = true;
    ctx.fillStyle = "black";
    ctx.font = "25px Arial";
    ctx.fillText("Pause", gameWidth / 2 - 80, gameHeight / 2);
  }
  else{
    pause = false;
    running = true;
    ctx.fillText("Resume", gameWidth / 2 - 80, gameHeight / 2);
    nextTick();
  }
}
