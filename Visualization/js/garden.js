var canvas_garden;
var c_garden;
var w_garden;
var h_garden;

var particles_garden = {};
var particleIndex = 0;
var particleNum = 30;



function particle_garden() {
  this.x = Math.random() * canvas_garden.width;
  this.y = Math.random() * canvas_garden.height;
  this.vx = 1;
  this.vy = 1;
  this.gravity = 0.3;
  particleIndex++;
  particles_garden[particleIndex] = this;
  this.id = particleIndex;
  this.life = 0;
  this.maxLife = Math.random() * 200;
  this.shadeR = Math.floor(Math.random() * 90+60);
  this.shadeG = Math.floor(Math.random() * 100+150);
  this.shadeB = Math.floor(Math.random() * 60+10);
 this.alp = Math.random()*1;
  this.color = 'hsla(' + this.shadeR + ',100%,' + this.shadeB + '%,' + this.alp + ')';
  this.size = Math.random() *20;
  this.rad = Math.round(Math.random()*(20)-(10));
}
particle_garden.prototype.draw = function() {
  this.x += (this.vx/this.rad)*Math.sin(this.vx);
  this.y += (this.vy/this.rad)*Math.cos(this.vy);

  this.vx += this.rad/10;
  this.vy += this.rad/10;



  this.life++;
  if (this.life >= this.maxLife) {
    delete particles_garden[this.id];
  }

  c_garden.beginPath();
  c_garden.moveTo(this.x, this.y);
  c_garden.lineTo(this.x-(this.vx/this.rad)*Math.sin(this.vx), this.y-(this.vy/this.rad)*Math.cos(this.vy));
  c_garden.strokeStyle = this.color;
  c_garden.lineWidth = 1;
  c_garden.stroke();
};

function drawParticle_garden() {
  c_garden.fillStyle = "rgba(0,0,0,0)";
  c_garden.fillRect(0, 0, w_garden, h_garden);
  for (var i = 0; i < particleNum; i++) {
    new particle_garden();
  }
  for (var i in particles_garden) {
    particles_garden[i].draw();
  }
}


function loop_garden() {

  window.requestAnimFrame(loop_garden);

  drawParticle_garden();
}


function createGarden(){

	canvas_garden = document.getElementById("canvas-garden");
	c_garden = canvas_garden.getContext("2d");
	w_garden = canvas_garden.width = window.innerWidth*2;
	h_garden = canvas_garden.height = window.innerHeight*2;

	window.requestAnimFrame = (function() {
	  return window.requestAnimationFrame ||
	    window.webkitRequestAnimationFrame ||
	    window.mozRequestAnimationFrame ||
	    window.oRequestAnimationFrame ||
	    window.msRequestAnimationFrame ||
	    function(callback) {
	      window.setTimeout(callback, 1000 / 60);
	    };
	})();

	loop_garden();
}

function destroyGarden(){
	window.cancelAnimationFrame(window.requestAnimFrame);
}
