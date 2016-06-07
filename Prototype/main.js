var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas()
{
	canvas.width = 1400; 
	canvas.height = 875;
}
resizeCanvas();

var startFrameMillis = Date.now();
var endFrameMillis = Date.now();
var background = new Image();
background.src = "background.jpg";


function getDeltaTime()
{
	endFrameMillis = startFrameMillis;
	startFrameMillis = Date.now();
	var deltaTime = (startFrameMillis - endFrameMillis) * 0.001;
	if(deltaTime > 1)
		deltaTime = 1;		
	return deltaTime;
}
//-------------------- Don't modify anything above here
var SCREEN_WIDTH = canvas.width;
var SCREEN_HEIGHT = canvas.height;


var STATE_SPLASH = 0;
var STATE_GAME = 1;
var STATE_GAMEOVER = 2;
var STATE_LIFELOST = 3;
var gameState = STATE_SPLASH;

var highscore = localStorage.getItem("highscore");
if(highscore == null){
	highscore = 0; 
	localStorage.setItem("highscore", 0);
}

var fps = 0;
var fpsCount = 0;
var fpsTime = 0;

var player = new Player();
var keyboard = new Keyboard();
var bullets = [];
var enemies = [];
var boss = [];

var LAYER_COUNT = level1.layers.length;
var LAYER_BACKGROUND = 0
var LAYER_PLATFORMS = 1;
var LAYER_DEATHONTOUCH = 2;
var LAYER_TRIGGERS = 3;
var LAYER_MAX = 4; 

var MAP = {tw: level1.width, th: level1.height};
var TILE = level1.tilewidth;
var TILESET_TILE = level1.tilesets[0].tilewidth;
var TILESET_PADDING = level1.tilesets[0].margin;
var TILESET_SPACING = level1.tilesets[0].spacing;
var TILESET_COUNT_X = level1.tilesets[0].columns;
var TILESET_COUNT_Y = level1.tilesets[0].tilecount / TILESET_COUNT_X;
var tileset = document.createElement("img");
tileset.src = level1.tilesets[0].image;

var METER = TILE;
var GRAVITY = METER * 9.8 * 4;
var MAXDX = METER * 10;
var MAXDY = METER * 15;
var ACCEL = MAXDX * 2;
var FRICTION = MAXDX * 8;
var JUMP = METER * 1500;
var ENEMY_MAXDX = METER * 5;
var ENEMY_ACCEL = ENEMY_MAXDX * 2;
var BOSS_MAXDX = METER * 5;
var BOSS_ACCEL = BOSS_MAXDX * 2;
var score = 0;

var level = 1;

function cellAtPixelCoord(layer, x,y)
{
if(x<0 || x>SCREEN_WIDTH || y<0)
return 1;
// let the player drop of the bottom of the screen (this means death)
if(y>SCREEN_HEIGHT)
return 0;
return cellAtTileCoord(layer, p2t(x), p2t(y));
};

function triggerAtTileCoord(layer, tx, ty){
	if(tx < 0 || tx >= MAP.tw || ty < 0)
return 0;
// let the player drop of the bottom of the screen (this means death)
if(ty <0 || ty >= MAP.th)
return 0;
return cells[layer][ty][tx];
}

function cellAtTileCoord(layer, tx, ty)
{
if(tx < 0 || tx >= MAP.tw || ty < 0)
return 1;
// let the player drop of the bottom of the screen (this means death)
if(ty <0 || ty>=MAP.th)
return 0;
return cells[layer][ty][tx];
};
function tileToPixel(tile)
{
return tile * TILE;
};
function pixelToTile(pixel)
{
return Math.floor(pixel/TILE);
};
function bound(value, min, max)
{
if(value < min)
return min;
if(value > max)
return max;
return value;
}



function drawMap()
{
	if(level == 1){
for(var layerIdx=0; layerIdx<LAYER_COUNT; layerIdx++)
{
	if(level1.layers[layerIdx].visible == false) continue;
var idx = 0;
for( var y = 0; y < level1.layers[layerIdx].height; y++ )
{
for( var x = 0; x < level1.layers[layerIdx].width; x++ )
{
if( level1.layers[layerIdx].data[idx] != 0 )
{
// the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile), so subtract one from the tileset id to get the
// correct tile
var tileIndex = level1.layers[layerIdx].data[idx] - 1;
var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) * (TILESET_TILE + TILESET_SPACING);
context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, x*TILE, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
}
idx++;
}
}
}
}
else if(level == 2){
for(var layerIdx=0; layerIdx<LAYER_COUNT; layerIdx++)
{
	if(level2.layers[layerIdx].visible == false) continue;
var idx = 0;
for( var y = 0; y < level2.layers[layerIdx].height; y++ )
{
for( var x = 0; x < level2.layers[layerIdx].width; x++ )
{
if( level2.layers[layerIdx].data[idx] != 0 )
{
// the tiles in the Tiled map are base 1 (meaning a value of 0 means no tile), so subtract one from the tileset id to get the
// correct tile
var tileIndex = level2.layers[layerIdx].data[idx] - 1;
var sx = TILESET_PADDING + (tileIndex % TILESET_COUNT_X) * (TILESET_TILE + TILESET_SPACING);
var sy = TILESET_PADDING + (Math.floor(tileIndex / TILESET_COUNT_Y)) * (TILESET_TILE + TILESET_SPACING);
context.drawImage(tileset, sx, sy, TILESET_TILE, TILESET_TILE, x*TILE, (y-1)*TILE, TILESET_TILE, TILESET_TILE);
}
idx++;
}
}
}
}
}

var musicBackround;
var sfxFire;

var cells = []; // the array that holds our simplified collision data
function initialize() {
	if(level == 1){
 for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) { // initialize the collision map
 cells[layerIdx] = [];
 var idx = 0;
 for(var y = 0; y < level1.layers[layerIdx].height; y++) {
 cells[layerIdx][y] = [];
 for(var x = 0; x < level1.layers[layerIdx].width; x++) {
 if(level1.layers[layerIdx].data[idx] != 0) {
 // for each tile we find in the layer data, we need to create 4 collisions
 // (because our collision squares are 35x35 but the tile in the
// level are 70x70)
 cells[layerIdx][y][x] = 1;
cells[layerIdx][y-1][x] = 1;
cells[layerIdx][y-1][x+1] = 1;
cells[layerIdx][y][x+1] = 1;
 }
 else if(cells[layerIdx][y][x] != 1) {
// if we haven't set this cell's value, then set it to 0 now
 cells[layerIdx][y][x] = 0;
}
 idx++;
 }
 }
	}}
else if(level == 2){
 for(var layerIdx = 0; layerIdx < LAYER_COUNT; layerIdx++) { // initialize the collision map
 cells[layerIdx] = [];
 var idx = 0;
 for(var y = 0; y < level2.layers[layerIdx].height; y++) {
 cells[layerIdx][y] = [];
 for(var x = 0; x < level2.layers[layerIdx].width; x++) {
 if(level2.layers[layerIdx].data[idx] != 0) {
 // for each tile we find in the layer data, we need to create 4 collisions
 // (because our collision squares are 35x35 but the tile in the
// level are 70x70)
 cells[layerIdx][y][x] = 1;
cells[layerIdx][y-1][x] = 1;
cells[layerIdx][y-1][x+1] = 1;
cells[layerIdx][y][x+1] = 1;
 }
 else if(cells[layerIdx][y][x] != 1) {
// if we haven't set this cell's value, then set it to 0 now
 cells[layerIdx][y][x] = 0;
}
 idx++;
 }
 }
	}}
}

function run()
{
context.fillStyle = "#ccc";
context.fillRect(0, 0, canvas.width, canvas.height);
var deltaTime = getDeltaTime();
switch(gameState)
{
case STATE_SPLASH:
runSplash(deltaTime);
break;
case STATE_GAME:
runGame(deltaTime);
break;
case STATE_GAMEOVER:
runGameOver(deltaTime);
break;
case STATE_LIFELOST:
runLifeLost(deltaTime);
break;
case STATE_LEVEL2:
runLevel2(deltaTime);
break;
}
//end run
}

var viewOffset = new Vector2();

function runGame(deltaTime){
	//asdasd	
	

context.save();

drawMap();

player.update(deltaTime);

player.draw();

if(player.position.x < viewOffset.x){
	player.velocity.x = 0; 
 	if(player.velocity.x == 0 && keyboard.isKeyDown(keyboard.KEY_RIGHT) == true){
		player.velocity.x = player.velocity.x;
		player.position.x = viewOffset.x;
	}
}

//bullet stuff


if(player.shootTimer > 0)
player.shootTimer -= deltaTime;

if(player.shoot == true && player.lives >= 1 && bullets.length <= 10 && player.shootTimer <= 0 && player.climbing == false)
{
	if(player.direction == RIGHT){
	var e = new Bullet(player.position.x + 100, player.position.y - 14, player.direction == RIGHT); 
	player.shootTimer += 0.2;
	bullets.push(e);
	}
else if(player.direction == LEFT){
	var e = new Bullet(player.position.x - 100, player.position.y - 14, player.direction == RIGHT); 
	player.shootTimer += 0.2;
	bullets.push(e);
}
}
var hit=false;
for(var i=0; i<bullets.length; i++)
{
bullets[i].update(deltaTime);
if( bullets[i].position.x - viewOffset.x < 0 ||
bullets[i].position.x - viewOffset.x > SCREEN_WIDTH)
{
hit = true;
}
for(var j=0; j<enemies.length; j++)
{
if(intersects( bullets[i].position.x, bullets[i].position.y, TILE, TILE,
               enemies[j].position.x, enemies[j].position.y, TILE, TILE) == true)
{
// kill both the bullet and the enemy
enemies.splice(j, 1);
hit = true;
// increment the player score
score += 1;
break;
}
}

////////////////////////////////////////////////////////////// boss stuff
for(var j=0; j<boss.length; j++)
{
if(intersects( bullets[i].position.x, bullets[i].position.y, TILE, TILE,
               boss[j].position.x, boss[j].position.y, TILE, TILE) == true && boss.lives > 1)
{
boss.lives -= 1;
hit = true;
score += 1;
break;
}
else if(intersects( bullets[i].position.x, bullets[i].position.y, TILE, TILE,
                    boss[j].position.x, boss[j].position.y, TILE, TILE) == true && boss.lives == 1){
				   boss.lives -= 1; 
				   boss.splice(j, 1);
				   score += 10;
				   hit = true;
				   break;
			   }
}
if(hit == true)
{
bullets.splice(i, 1);
break;
}
}







for(var i=0; i<bullets.length; i++){
	var tx = pixelToTile(bullets[i].position.x);
    var ty = pixelToTile(bullets[i].position.y);
    var nx = (bullets[i].position.x)%TILE; // true if player overlaps right
    var ny = (bullets[i].position.y)%TILE; // true if player overlaps below
    var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
    var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
    var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
    var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);
	
	
	if (bullets[i].velocity.x > 0) {
 if ((cellright && !cell) || (celldiag && !celldown && ny)) {
 // clamp the x position to avoid moving into the platform we just hit
 bullets[i].position.x = tileToPixel(tx);
 bullets[i].velocity.x = 0; // stop horizontal velocity
 bullets.splice(i, 1);
 }
}
else if (bullets[i].velocity.x < 0) {
 if ((cell && !cellright) || (celldown && !celldiag && ny)) {
// clamp the x position to avoid moving into the platform we just hit
bullets[i].position.x = tileToPixel(tx + 1);
bullets[i].velocity.x = 0; // stop horizontal velocity
bullets.splice(i, 1);
}
}
}
for(var i=0; i<bullets.length; i++){
	bullets[i].draw();
}



// end of bullet stuff

if(player.lives > 1)
{
for(var i=0; i<enemies.length; i++)
{
if (intersects (player.position.x, player.position.y, TILE, TILE,
                enemies[i].position.x, enemies[i].position.y, TILE, TILE) == true)
{
    player.lives -= 1;
	gameState = STATE_LIFELOST;
	player.position.set (0, 0);
	viewOffset.x = 0;
	hit = true;
	enemies.splice(j, 1);
} 
}
}
if(player.lives == 1)
{
for(var i=0; i<enemies.length; i++)
{
if (intersects (player.position.x, player.position.y, TILE, TILE,
                      enemies[i].position.x, enemies[i].position.y, TILE, TILE) == true)
{
	gameState = STATE_GAMEOVER;
} 
}
}


for(var i=0; i<boss.length; i++)
{
boss[i].update(deltaTime);
}

for(var i=0; i<boss.length; i++)
{
    boss[i].draw();
}


for(var i=0; i<enemies.length; i++)
{
enemies[i].update(deltaTime);
}

for(var i=0; i<enemies.length; i++)
{
    enemies[i].draw();
}
context.restore();

// update the frame counter
fpsTime += deltaTime;
fpsCount++;
if(fpsTime >= 1)
{
fpsTime -= 1;
fps = fpsCount;
fpsCount = 0;
}

// draw the FPS
context.fillStyle = "#FF0000";
context.font="14px Arial";
context.fillText("FPS: " + fps, 30, 20, 100);
context.fill();

if(player.position.y > SCREEN_HEIGHT && player.lives > 1){
	player.lives -= 1;
	gameState = STATE_LIFELOST;
	player.position.set (0, 0);
	viewOffset.x = 0;
}
else if(player.position.y > SCREEN_HEIGHT && player.lives == 1){
	gameState = STATE_GAMEOVER;
}
}

var win = false; 
var firstGameOver = true; 
var gotHighScore = false;
function runGameOver(){
	
	if(firstGameOver == true){
		firstGameOver = false; 
		if(score >= highscore){
			gotHighScore = true; 
			highscore = score;
			localStorage.setItem("highscore", score);
		}
		else {
			gotHighScore = false;
		}
	}
	if(win == false){
	context.font = "32px Franklin";
	context.textAling = "center"; 
	context.fillStyle = "Black";
	context.fillText("You seem to have lost. Nice work!", SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
	}
	if(score == 0 && win == false){
	context.font = "32px Franklin";
	context.textAling = "center"; 
	context.fillStyle = "Black";
	context.fillText("You literally scored 0, you suck, go home.", SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 50);
	}
	if(score > 0 && win == false){
	context.font = "32px Franklin";
	context.textAling = "center"; 
	context.fillStyle = "Black";
	context.fillText("You scored, " +score + ", nice job!", SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 50);
	}
	if(score >= 0 && win == true){
	context.font = "32px Franklin";
	context.textAling = "center"; 
	context.fillStyle = "Black";
	context.fillText("You won", SCREEN_WIDTH/2, SCREEN_HEIGHT/2); 
	}
	
	
	if(keyboard.isKeyDown(keyboard.KEY_R) == true){
	  player.lives = 3;
	  gameState = STATE_GAME;
	  player.position.set (0, 0);
	  viewOffset.x = 0;
	  player.sprite.setAnimation(ANIM_IDLE_RIGHT);
	  win = false;
	  enemies.length = 0;
	  initialize();
	  score = 0; 
	  bullets.length = 0; 
	  boss.length = 0;
	}
	
}

var splashTime = 3; 
function runSplash(deltaTime){
	splashTime -= deltaTime;
	if(splashTime <= 0){
		gameState = STATE_GAME;
	}
context.font="32px Franklin Gothic Medium Condensed";
context.textAlign = "center";
context.fillStyle = "Black";
context.fillText("Jumpman", SCREEN_WIDTH/2, SCREEN_HEIGHT/2 + 30);
}

var lifelosttime = 1;
function runLifeLost(deltaTime){
	lifelosttime -= deltaTime; 
	if(lifelosttime <= 0){
		gameState = STATE_GAME;
		lifelosttime = 1;
		player.position.set (0, 0);
		viewOffset.x = 0;
		bullets.length = 0;
	}

	context.fillStyle = "Black";
	context.font = "32px Franklin";
	context.textAling = "center"; 
	context.fillText("Try Again, But Be Better! xD", SCREEN_WIDTH/2, SCREEN_HEIGHT/2);
}

function music(){
	var musicBackground = new Howl(
{
urls: ["background.ogg"],
loop: true,
buffer: true,
volume: 0.1,
} );
musicBackground.play();
sfxFire = new Howl(
{
urls: ["fireEffect.ogg"],
buffer: true,
volume: 0.2,
onend: function() {
isSfxPlaying = false;
}
} );
}



initialize();


//-------------------- Don't modify anything below here


// This code will set up the framework so that the 'run' function is called 60 times per second.
// We have a some options to fall back on in case the browser doesn't support our preferred method.
(function() {
  var onEachFrame;
  if (window.requestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.requestAnimationFrame(_cb); }
      _cb();
    };
  } else if (window.mozRequestAnimationFrame) {
    onEachFrame = function(cb) {
      var _cb = function() { cb(); window.mozRequestAnimationFrame(_cb); }
      _cb();
    };
  } else {
    onEachFrame = function(cb) {
      setInterval(cb, 1000 / 60);
    }
  }
  
  window.onEachFrame = onEachFrame;
})();

window.onEachFrame(run);
