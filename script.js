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
class Random {
  constructor(seed = 88675123) {
    this.x = 123456789;
    this.y = 362436069;
    this.z = 521288629;
    this.w = seed;
  }
  
  // XorShift
  next() {
    let t;
    t = this.x ^ (this.x << 11);
    this.x = this.y; this.y = this.z; this.z = this.w;
    return this.w = (this.w ^ (this.w >>> 19)) ^ (t ^ (t >>> 8)); 
  }
  next_int(min = 0, max = 1) {
    const r = Math.abs(this.next());
    return min + (r % (max + 1 - min));
  }
}
class Player {
  constructor(args) {
    this.pos = args["pos"];
    this.motion = args["motion"];
    this.attribute = args["attribute"];
    this.on_ground = args["on_ground"];
    this.touching_left_wall = args["touching_left_wall"];
    this.touching_right_wall = args["touching_left_wall"];
  }
}
class EntityAttribute {
  constructor(attribute) {
    this.size = attribute["size"];
    this.move_speed = attribute["move_speed"];
    this.gravity_multiplier = attribute["gravity_multiplier"];
    this.resistance = attribute["resistance"];
    this.wall_resistance = attribute["wall_resistance"];
    this.jump_power = attribute["jump_power"];
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
    case "ArrowLeft": input_left = true; break;
    case "ArrowRight": input_right = true; break;
    case "ArrowUp": input_up = true;break;
    case "ArrowDown": input_down = true; break;
    case "Space": input_space = true; break;
  }
});
document.addEventListener('keyup', event => {
  switch (event.key) {
    case "ArrowLeft": input_left = false; break;
    case "ArrowRight": input_right = false; break;
    case "ArrowUp": input_up = false;start_input_up = false; break;
    case "ArrowDown": input_down = false; break;
    case "Space": input_space = false; break;
  }
});

// environment constant
const GRAVITY = -1;

// setting canvas
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// setting player
var player_attribute = new EntityAttribute({
  size: new Vector2(50, 50),
  move_speed: 1,
  gravity_multiplier: 1,
  jump_power: 20,
  resistance: 0.9,
  wall_resistance: 0.6,
});
var p = new Player({
  pos: new Vector2(100, 100),
  motion: Vector2.zero,
  attribute: player_attribute,
  on_ground: false,
  touching_left_wall: false,
  touching_right_wall: false
});

// setting terrain
var walls = [
  [0, 0, 800, 50,"grass"],
  [0, 590, 800, 10,"dirt"],
  [0, 0, 10, 600,"dirt"],
  [790, 0, 10, 600,"dirt"],

  [100, 150, 100, 50,"grass"],
  [350, 150, 100, 50,"grass"],
  [600, 150, 100, 50,"grass"],
  [225, 300, 100, 50,"grass"],
  [475, 300, 100, 50,"grass"]]

function tick() {
  logic();
  render();
}

function logic() {
  // move player
  if (input_right) {
    p.motion.x += p.attribute.move_speed;
    //if (p.touching_right_wall) {p.motion.y *= p.attribute.wall_resistance;}
  }
  if (input_left) {
    p.motion.x -= p.attribute.move_speed;
    //if (p.touching_left_wall) {p.motion.y *= p.attribute.wall_resistance;}
  }
  if (input_up) {
    if (p.on_ground) { p.motion.y += p.attribute.jump_power; }
    /*else {
      if (p.touching_left_wall) {
        p.motion.y = p.attribute.jump_power * 1;
        p.motion.x += p.attribute.jump_power * 1;
        p.touching_left_wall = false;
      }
      if (p.touching_right_wall) {
        p.motion.y = p.attribute.jump_power * 1;
        p.motion.x -= p.attribute.jump_power * 1;
        p.touching_right_wall = false;
      }
    }*/
  }
  if (input_down) { p.motion.y -= p.attribute.move_speed; }

  p.motion.x *= p.attribute.resistance;
  p.motion.y += GRAVITY * p.attribute.gravity_multiplier;
  if (Math.abs(p.motion.x) < 0.1) { p.motion.x = 0 }
  //if (Math.abs(p.motion.y) < 1) {p.motion.y = 0}

  move(4);
}

function move(accuracy) {
  if (!is_colliding(p.pos.x + p.motion.x, p.pos.y)) {
    p.pos.x += p.motion.x;
    p.touching_left_wall = false;
    p.touching_right_wall = false;
  } else {
    let length = Math.floor(Math.abs(p.motion.x)) + 1;
    for (let i = 1; i <= length; i++) {
      if (p.motion.x < 0) {
        if (is_colliding(p.pos.x - i, p.pos.y)) {
          p.pos.x -= i;
          p.pos.x++;
          p.touching_left_wall = true;
          break;
        }
      } else {
        if (is_colliding(p.pos.x + i, p.pos.y)) {
          p.pos.x += i;
          p.pos.x--;
          p.touching_right_wall = true;
          break;
        }
      }
    }
    p.motion.x = 0;
  }
  if (!is_colliding(p.pos.x, p.pos.y + p.motion.y)) {
    p.pos.y += p.motion.y;
    p.on_ground = false;
  } else {
    let length = Math.floor(Math.abs(p.motion.y)) + 1;
    for (let i = 1; i <= length; i++) {
      if (p.motion.y < 0) {
        if (is_colliding(p.pos.x, p.pos.y - i)) {
          p.pos.y -= i;
          p.pos.y++;
          break;
        }
      } else {
        if (is_colliding(p.pos.x, p.pos.y + i)) {
          p.pos.y += i;
          p.pos.y--;
          break;
        }
      }
    }
    if (p.motion.y < 0) {
      p.on_ground = true;
    }
    p.motion.y = 0;
  }
}

function intersect_rect(al, au, ar, ad, bl, bu, br, bd) {
  return !(ar < bl || br < al || au < bd || bu < ad)
}

function is_colliding(px, py) {
  let flag = false;
  for (i = 0; i < walls.length; i++) {
    if (intersect_rect(
      px - p.attribute.size.x / 2,
      py + p.attribute.size.y,
      px + p.attribute.size.x / 2,
      py,
      walls[i][0],
      walls[i][1] + walls[i][3],
      walls[i][0] + walls[i][2],
      walls[i][1],
    )) { flag = true; break; }
  }
  return flag;
}

function render() {
  // background
  ctx.fillStyle = "#adf";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // player
  ctx.fillStyle = "#334";
  ctx.fillRect(p.pos.x - p.attribute.size.x / 2, p.pos.y, p.attribute.size.x, p.attribute.size.y);

  // walls
  const r1 = new Random(100);
  for (i = 0; i < walls.length; i++) {
    switch (walls[i][4]) {
      case "grass":
        ctx.fillStyle = "#66482b";
        ctx.fillRect(walls[i][0], walls[i][1], walls[i][2], walls[i][3]);
        ctx.fillStyle = "#3d944f";
        
        ctx.beginPath();
        ctx.moveTo(walls[i][0] + walls[i][2], walls[i][1] + walls[i][3] - 20);
        ctx.lineTo(walls[i][0] + walls[i][2], walls[i][1] + walls[i][3]);
        ctx.lineTo(walls[i][0], walls[i][1] + walls[i][3]);
        ctx.lineTo(walls[i][0], walls[i][1] + walls[i][3] - 20);
        
        for (let r = 0;r < walls[i][2];r+=0) {
          r += r1.next_int(0,1000) / 1000 * 80;
          if (walls[i][2] <= r) {r = walls[i][2]}
          ctx.lineTo(walls[i][0] + r, walls[i][1] + walls[i][3] - 20 + r1.next_int(-1000,1000) / 1000 * 5);
        }
        ctx.fill();
        ctx.fillStyle = "#49b861";
        ctx.beginPath();
        ctx.moveTo(walls[i][0] + walls[i][2], walls[i][1] + walls[i][3] - 10);
        ctx.lineTo(walls[i][0] + walls[i][2], walls[i][1] + walls[i][3]);
        ctx.lineTo(walls[i][0], walls[i][1] + walls[i][3]);
        ctx.lineTo(walls[i][0], walls[i][1] + walls[i][3] - 10);
        for (let r = 0;r < walls[i][2];r+=0) {
          r += r1.next_int(0,1000) / 1000 * 80;
          if (walls[i][2] <= r) {r = walls[i][2]}
          ctx.lineTo(walls[i][0] + r, walls[i][1] + walls[i][3] - 10 + r1.next_int(-1000,1000) / 1000 * 5);
        }
        ctx.fill();
        break;
      case "dirt":
        ctx.fillStyle = "#66482b";
        ctx.fillRect(walls[i][0], walls[i][1], walls[i][2], walls[i][3]);
        break;
    }
    
  }
}

// tick
setInterval(tick, 1000 / 60);
