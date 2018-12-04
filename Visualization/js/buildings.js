
var canvas;
var ctx;
var fps;
var W;
var H;
var buildingsActive;
var raf;

function randint(n) { return floor(n*random()); }

/*---------------------------------------------------------------------------*/

function loop_buildings(t) {
  if (buildingsActive) raf(loop_buildings);
  buildings_update();
  buildings_draw();
}



/*---------------------------------------------------------------------------*/

function Side(x, y, sign, death, length) {
  this.x = x;
  this.y = y;
  this.sign = sign;
  this.length = length;
  this.age = 0;
  this.death = death;
}

Object.defineProperty(Side.prototype, 'dead', {
  get: function() { return this.age >= this.death; }
});

Side.prototype.buildings_update = function() {
  if (this.dead) return;
  this.age++;
};

Side.prototype.buildings_draw = function() {
  if (this.dead) return;
  var x = this.x;
  var y = this.y - this.age;
  var len = this.length;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + this.sign*dx*Unit*len, y - dy*Unit*len);
  ctx.closePath();
  ctx.strokeStyle = this.sign > 0 ? 'rgb(123, 123, 123)' : 'rgb(55, 55, 55)';
  ctx.stroke();
};

function buildings_drawTop(a, b) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y-a.age);
  ctx.lineTo(a.x + a.sign*dx*Unit*a.length, a.y-a.age-dy*Unit*a.length);
  ctx.lineTo(b.x + a.sign*dx*Unit*a.length+b.sign*dx*Unit*b.length, a.y-a.age-dy*Unit*(a.length+b.length));
  ctx.lineTo(b.x + b.sign*dx*Unit*b.length, b.y-a.age-dy*Unit*b.length);
  ctx.closePath();
  ctx.fillStyle = 'rgb(198,198,198)';
  ctx.fill();
}

/*---------------------------------------------------------------------------*/

var Unit = 2;
var dx = 8;
var dy = 4;
var S = 2600;
var MaxHeight = 200;
var sides = [];

function buildings_reset() {
  ctx.clearRect(0, 0, W, H);
  sides = [];
  for (var i = 0; i < S; i += 2) {
    var x = random()*W;
    var y = random()*(H + 100);
    x -= x%20;
    y -= y%5;
    var death = randint(MaxHeight);
    sides[i] = new Side(x, y, 1, death, 1+randint(3));
    sides[i+1] = new Side(x, y, -1, death, 1+randint(3));
  }
}

function buildings_update() {
  for (var i = 0; i < S; i++) sides[i].buildings_update();
}

function buildings_draw() {
  var alldead = true;
  for (var i = 0; i < S; i += 2) {
    var a = sides[i];
    var b = sides[i+1];

    if (!a.dead || !b.dead) alldead = false;

    if (!a.dead) buildings_drawTop(a, b);
    a.buildings_draw();
    b.buildings_draw();
  }
  if (alldead) buildingsActive = false;
}

/*---------------------------------------------------------------------------*/

function createBuildings(){

	canvas = document.getElementById('canvas-city');
	ctx = canvas.getContext('2d');
	fps = document.getElementById('fps');

	W = canvas.width = innerWidth;
	H = canvas.height = innerHeight;

	raf = requestAnimationFrame;

	'floor|random|round|abs|sqrt|PI|atan2|sin|cos|pow'
	  .split('|')
	  .forEach(function(p) { this[p] = Math[p]; });

	buildingsActive = true;
	buildings_reset();
	raf(loop_buildings);
}

function destroyBuildings(){
	buildingsActive = false;
}
