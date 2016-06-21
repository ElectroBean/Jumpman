var Player = function() {	
	this.sprite = new Sprite("sanholo.png");
this.sprite.buildAnimation(8, 1, 32, 32, 0.1,[0, 1, 2, 3, 4, 5, 6, 7]);
this.sprite.buildAnimation(8, 1, 32, 32, 0.1,[15, 14, 13, 12, 11, 10, 9, 8,]);
this.sprite.buildAnimation(8, 1, 32, 32, 0.1,[0]);
this.sprite.buildAnimation(8, 1, 32, 32, 0.1,[15]);
this.sprite.buildAnimation(8, 1, 32, 32, 0.1,[16, 17, 18, 19, 20, 21, 22, 23]);
for(var i=0; i<ANIM_MAX; i++)
{
this.sprite.setAnimationOffset(i, 0, 4);
}

this.offset = new Vector2();
	this.position = new Vector2();
	this.width = 32;
	this.height = 32;
	this.velocity = new Vector2();
	this.falling = true; 
	this.jumping = false;
	this.direction = RIGHT; 
	this.shoot = false;
	this.lives = 3;
	this.sprite.setAnimation(ANIM_IDLE_RIGHT);
	this.shootTimer = 0;
	this.cooldownTimer = 0;
	this.climbing = false; 
	this.wasJumping = false;
};

var LEFT = 0;
var RIGHT = 1;
var ANIM_WALK_RIGHT = 0;
var ANIM_WALK_LEFT = 1;
var ANIM_IDLE_RIGHT = 2; 
var ANIM_IDLE_LEFT = 3;
var ANIM_CLIMB = 4;
var ANIM_MAX = 5;
var jumps = 2;

Player.prototype.update = function(deltaTime)
{
	this.sprite.update(deltaTime);
 var left = false;
 var right = false;
 var jump = false;

 // check keypress events
 if(keyboard.isKeyDown(keyboard.KEY_LEFT) == true) {
 left = true;
 this.direction = LEFT;
 if(this.sprite.currentAnimation != ANIM_WALK_LEFT && this.jumping == false && this.shoot == false)
	 this.sprite.setAnimation(ANIM_WALK_LEFT);
 }
 else if(keyboard.isKeyDown(keyboard.KEY_RIGHT) == true) {
 right = true;
 this.direction = RIGHT; 
 if(this.sprite.currentAnimation != ANIM_WALK_RIGHT && this.jumping == false && this.shoot == false)
	 this.sprite.setAnimation(ANIM_WALK_RIGHT);
 }
 else{
	 if(this.jumping == false && this.falling == false){
		 if(this.direction == LEFT){
			 if(this.sprite.currentAnimation != ANIM_IDLE_LEFT && this.shoot == false && this.climbing == false)
				 this.sprite.setAnimation(ANIM_IDLE_LEFT);
		 }
		 else{
			 if(this.sprite.currentAnimation != ANIM_IDLE_RIGHT && this.shoot == false && this.climbing == false)
				 this.sprite.setAnimation(ANIM_IDLE_RIGHT);
		 }
	 }
 }
 
 if(keyboard.isKeyDown(keyboard.KEY_UP) == true){
	 jump = true; 
	 this.jumping = true; 
	
 }
 
 if(jump == true && this.direction == LEFT && this.sprite.currentAnimation != ANIM_WALK_LEFT){
	 this.sprite.setAnimation(ANIM_WALK_LEFT);
 }
 
 if(jump == true && this.direction == RIGHT && this.sprite.currentAnimatoin != ANIM_WALK_RIGHT){
	 this.sprite.setAnimation(ANIM_WALK_RIGHT);
 }
 
 if(keyboard.isKeyDown(keyboard.KEY_1) == true){
	 level = 1;
	 initialize();
	 player.position.set (0, 0);
	
 }
 
 if(keyboard.isKeyDown(keyboard.KEY_2) == true){
	 level = 2;
	 initialize();
	 player.position.set (0, 0);
 }
 
 if(keyboard.isKeyDown(keyboard.KEY_3) == true){
	 level = 3;
	 initialize();
	 player.position.set (0, 0);
 }
 
 if(keyboard.isKeyDown(keyboard.KEY_4) == true){
	 level = 4;
	 initialize();
	 player.position.set (0, 0);
 }
 
 if(keyboard.isKeyDown(keyboard.KEY_5) == true){
	 level = 5;
	 initialize();
	 player.position.set (0, 0);
 }

 var wasleft = this.velocity.x < 0;
 var wasright = this.velocity.x > 0;
 var falling = this.falling;
 var ddx = 0; // acceleration
 var ddy = GRAVITY;
	
if (left)
ddx = ddx - ACCEL; // player wants to go left   
else if (wasleft)
ddx = ddx + FRICTION; // player was going left, but not any more
if (right)
ddx = ddx + ACCEL; // player wants to go right
else if (wasright)
ddx = ddx - FRICTION; // player was going right, but not any more
 
if (jump == true && jumps > 0 && this.wasJumping == false)
{
	ddy = ddy - JUMP;
	this.jumping = true;
	jumps -= 1;

}

this.position.y = Math.round(this.position.y + (deltaTime * this.velocity.y));
this.position.x = Math.round(this.position.x + (deltaTime * this.velocity.x));
this.velocity.x = bound(this.velocity.x + (deltaTime * ddx), -MAXDX, MAXDX);
this.velocity.y = bound(this.velocity.y + (deltaTime * ddy), -MAXDY, MAXDY);

if ((wasleft && (this.velocity.x > 0)) || (wasright && (this.velocity.x < 0))) {

this.velocity.x = 0;
}

	var position = this.position.copy();
	position.add(this.offset);
	
	var tx = pixelToTile(position.x);
	var ty = pixelToTile(position.y);
	var platformsLayer = 1;
	
	if(this.velocity.y < 0)
	{
		var tx = pixelToTile(this.position.x + this.offset.x);
		var ty = pixelToTile(this.position.y + (this.offset.y));
		if(cellAtTileCoord(platformsLayer, tx, ty))
		{
			this.velocity.y = 0;
			this.position.y = ty * TILE - this.offset.y;
		}
	}
	else if(this.velocity.y > 0)
	{
		var tx = pixelToTile(this.position.x + this.offset.x);
		var ty = pixelToTile(this.position.y + (this.offset.y) + TILE);
		if(cellAtTileCoord(platformsLayer, tx, ty))
		{
			this.jumping = false;
			this.falling = false;
			this.velocity.y = 0;
			this.position.y = ty * TILE - TILE - 1 - this.offset.y;
			jumps = 2;
		}
	}
	if(this.velocity.x < 0)
	{
		var tx = pixelToTile(this.position.x + (this.offset.x) - TILE);
		var ty = pixelToTile(this.position.y + this.offset.y);
		if(cellAtTileCoord(platformsLayer, tx, ty))
		{
			this.velocity.x = 0;
			this.position.x = tx * TILE + TILE - this.offset.x;
		}
	}
	else if(this.velocity.x > 0)
	{
		var tx = pixelToTile(this.position.x + (this.offset.x));
		var ty = pixelToTile(this.position.y + this.offset.y);
		if(cellAtTileCoord(platformsLayer, tx, ty))
		{
			this.velocity.x = 0;
			this.position.x = tx * TILE - 1 - this.offset.x;
		}
	}
	
/////////////////////////////////////////////////////////////////////

var tx = pixelToTile(this.position.x);
var ty = pixelToTile(this.position.y);
var nx = (this.position.x)%TILE; 
var ny = (this.position.y)%TILE; 
var cell = cellAtTileCoord(LAYER_DEATHONTOUCH, tx, ty);
var cellright = cellAtTileCoord(LAYER_DEATHONTOUCH, tx + 1, ty);
var celldown = cellAtTileCoord(LAYER_DEATHONTOUCH, tx, ty + 1);
var celldiag = cellAtTileCoord(LAYER_DEATHONTOUCH, tx + 1, ty + 1);

 if (this.velocity.y > 0) {
if ((celldown && !cell) || (celldiag && !cellright && nx)) {
 this.position.y = tileToPixel(ty);
 this.velocity.y = 0;
 this.lives -= 1;
 gameState = STATE_LIFELOST;
 ny = 0; 
}
 }
 else if (this.velocity.y < 0) {
if ((cell && !celldown) || (cellright && !celldiag && nx)) {
 this.position.y = tileToPixel(ty + 1);
 this.velocity.y = 0;
 cell = celldown;
 cellright = celldiag; 
  this.lives -= 1;
 gameState = STATE_LIFELOST;
 ny = 0; 
}
}
if (this.velocity.x > 0) {
 if ((cellright && !cell) || (celldiag && !celldown && ny)) {
 this.position.x = tileToPixel(tx);
 this.velocity.x = 0; 
  this.lives -= 1;
 gameState = STATE_LIFELOST;
 }
}
else if (this.velocity.x < 0) {
 if ((cell && !cellright) || (celldown && !celldiag && ny)) {
this.position.x = tileToPixel(tx + 1);
this.velocity.x = 0; 
 this.lives -= 1;
 gameState = STATE_LIFELOST;
}
}
this.wasJumping = jump;

//////////////////////////////////////////////////////

var tx = pixelToTile(this.position.x);
var ty = pixelToTile(this.position.y);
var nx = (this.position.x)%TILE; 
var ny = (this.position.y)%TILE; 
var cell = cellAtTileCoord(LAYER_LADDERS, tx, ty);
var cellright = cellAtTileCoord(LAYER_LADDERS, tx + 1, ty);
var celldown = cellAtTileCoord(LAYER_LADDERS, tx, ty + 1);
var celldiag = cellAtTileCoord(LAYER_LADDERS, tx + 1, ty + 1);

if (keyboard.isKeyDown(keyboard.KEY_SHIFT) == true) {
 if ((cellright && !cell) || (celldiag && !celldown && ny)) {
	this.velocity.x = 0; 
	this.velocity.y = -3
	this.position.y -= 5;
	this.climbing = true; 
	if(this.sprite.currentAnimation != ANIM_CLIMB){
	this.sprite.setAnimation(ANIM_CLIMB);
	}
 }
}
else if (keyboard.isKeyDown(keyboard.KEY_SHIFT) == true) {
 if ((cell && !cellright) || (celldown && !celldiag && ny)) {
	this.velocity.x = 0;
	this.velocity.y = -3
	this.position.y -= 5;
	this.climbing = true; 
	if(this.sprite.currentAnimation != ANIM_CLIMB){
	this.sprite.setAnimation(ANIM_CLIMB);
		}
	}
}
 if(keyboard.isKeyDown(keyboard.KEY_SHIFT) == false){
	this.climbing = false;
} 
///////////////////////////////////////////////////////////////////////
var tx = pixelToTile(this.position.x);
var ty = pixelToTile(this.position.y);
var nx = (this.position.x)%TILE; 
var ny = (this.position.y)%TILE; 
var cell = cellAtTileCoord(LAYER_POWERS, tx, ty);
var cellright = cellAtTileCoord(LAYER_POWERS, tx + 1, ty);
var celldown = cellAtTileCoord(LAYER_POWERS, tx, ty + 1);
var celldiag = cellAtTileCoord(LAYER_POWERS, tx + 1, ty + 1);

if ((celldown && !cell) || (celldiag && !cellright && nx)) {
jumps += 1;

}

if ((cell && !celldown) || (cellright && !celldiag && nx)) {
jumps += 1;

}


 if ((cellright && !cell) || (celldiag && !celldown && ny)) {
jumps += 1;

 }


 if ((cell && !cellright) || (celldown && !celldiag && ny)) {
jumps += 1;

}

///////////////////////////////////////////////////////////////////////
if(triggerAtTileCoord(LAYER_TRIGGERS, tx, ty) == true && level == 1)
{
level = 2;
initialize();
player.position.set (0, 0);
}
else if(triggerAtTileCoord(LAYER_TRIGGERS, tx, ty) == true && level == 2){
	level = 3;
	initialize(); 
	player.position.set (0, 0);
}
else if(triggerAtTileCoord(LAYER_TRIGGERS, tx, ty) == true && level == 3){
	level = 4;
	initialize(); 
	player.position.set (0, 0);
}

}

Player.prototype.draw = function()
{
	this.sprite.draw(context, this.position.x, this.position.y)
}


