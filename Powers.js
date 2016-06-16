var Powers = function(x, y) {	
	this.sprite = new Sprite("powers.png");
	this.sprite.buildAnimation(1, 1, 70, 70, 0.2, [0]); 
    this.position = new Vector2(x, y);
};

Powers.prototype.update = function(deltaTime)
{

}


Powers.prototype.draw = function()
{
	this.sprite.draw(context,this.position.x, this.position.y);
}