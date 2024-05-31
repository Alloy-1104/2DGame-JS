class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  clone() {
    return new Vector2(this.x, this.y);
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }
  times(num) {
    this.x *= num;
    this.y *= num;
    return this;
  }
  get inverse() {
    return this.clone().times(-1);
  }
  get magnitude() {
    const { x, y } = this;
    return Math.sqrt(x ** 2 + y ** 2);
  }
  get normalized() {
    const { x, y, magnitude } = this;
    return new Vector2(x / magnitude, y / magnitude);
  }
  static add(v1, v2) {
    return v1.clone().add(v2);
  }
  static sub(v1, v2) {
    return v1.clone().sub(v2);
  }
  static times(v1, num) {
    return v1.clone().times(num);
  }
  static dot(v1, v2) {
    return (v1.x * v2.x + v1.y * v2.y);
  }
  static cross(v1, v2) {
    return (v1.x * v2.y - v1.y * v2.x);
  }
  static distance(v1, v2) {
    return Vector2.sub(v1, v2).magnitude;
  }
  static isParallel(v1, v2) {
    return (Vector2.cross(v1, v2) === 0);
  }
  static isVertical(v1, v2) {
    return (Vector2.dot(v1, v2) === 0);
  }
  static get zero() {
    return new Vector2(0, 0);
  }

  static get one() {
    return new Vector2(1, 1);
  }

  static get right() {
    return new Vector2(1, 0);
  }

  static get left() {
    return new Vector2(-1, 0);
  }

  static get up() {
    return new Vector2(0, 1);
  }

  static get down() {
    return new Vector2(0, -1);
  }
}
class Player {
  constructor(
    pos = new Vector2.zero,
    size = new Vector2(10,10),
    motion = new Vector2.zero,
    attribute = new EntityAttribute()) {
    this.pos = pos;
    this.size = size;
    this.motion = motion;
    this.attribute = attribute;
  }
}
class EntityAttribute {
  constructor(
    move_speed = 1.0,
    gravity_multiplier = 1.0,
    resistance = 0.9
  ) {
    this.move_speed = move_speed;
    this.gravity_multiplier = gravity_multiplier;
    this.resistance = resistance;
  }
}
// key input
var input_left = false;
var input_right = false;
var input_up = false;
var input_down = false;
var input_space = false;
document.addEventListener('keydown', event => {
  switch (event.key) {
    case "ArrowLeft":input_left = true;break;
    case "ArrowRight":input_right = true;break;
    case "ArrowUp":input_up = true;break;
    case "ArrowDown":input_down = true;break;
    case "Space":input_space = true;break;
  }
});
document.addEventListener('keyup', event => {
  switch (event.key) {
    case "ArrowLeft":input_left = false;break;
    case "ArrowRight":input_right = false;break;
    case "ArrowUp":input_up = false;break;
    case "ArrowDown":input_down = false;break;
    case "Space":input_space = false;break;
  }
});


// setting canvas
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// setting player
var player_attribute = new EntityAttribute(5,1,0.6)
var p = new Player(new Vector2(100,100), new Vector2(50,50), Vector2.zero, player_attribute);

// setting terrain
var walls = [[300,400,100,100]]

function tick() {
  logic();
  render();
}

function logic() {
  // move player
  if (input_right) {p.motion.x += p.attribute.move_speed;}
  if (input_left) {p.motion.x -= p.attribute.move_speed;}
  if (input_up) {p.motion.y += p.attribute.move_speed;}
  if (input_down) {p.motion.y -= p.attribute.move_speed;}
  
  p.motion.times(p.attribute.resistance);
  if (Math.abs(p.motion.x) < 1) {p.motion.x = 0}
  if (Math.abs(p.motion.y) < 1) {p.motion.y = 0}

  move();
}

function move() {
  if (is_colliding(p.pos.x + p.motion.x, p.pos.y)) {
    //
  } else {p.pos.x += p.motion.x;}
  if (is_colliding(p.pos.x, p.pos.y + p.motion.y)) {
    //
  } else {p.pos.y += p.motion.y;}
}

function intersect_rect(al,au,ar,ad,bl,bu,br,bd) {
  return !(ar<bl||br<al||au<bd||bu<ad)
}

function is_colliding(px,py) {
  let flag = false;
  for (i = 0;i < walls.length; i++) {
    if (intersect_rect(
      px-p.size.x/2,
      py+p.size.y,
      px+p.size.x/2,
      py,
      walls[i][0],
      walls[i][1]+walls[i][3],
      walls[i][0]+walls[i][2],
      walls[i][1],
    )) {flag = true;break;}
  }
  return flag;
}

function render() {
  // background
  ctx.fillStyle = "#adf";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  
  // player
  ctx.fillStyle = "#334";
  ctx.fillRect(p.pos.x - p.size.x / 2, p.pos.y, p.size.x, p.size.y);

  // walls
  for (i = 0;i < walls.length; i++) {
    ctx.fillStyle = "#112";
    ctx.fillRect(walls[i][0],walls[i][1],walls[i][2],walls[i][3]);
  }
}

// tick
setInterval(tick, 1000/60);
