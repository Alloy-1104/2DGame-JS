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

class Camera {
  constructor(args) {
    this.pos = args["pos"];
    this.focus_object = args["focus_object"];
    this.offset = args["offset"];
    this.smoothness = args["smoothness"];
  }
  smooth_focus() {
    this.pos = Vector2.times(Vector2.add(this.focus_object.pos, Vector2.times(this.pos, this.smoothness)), 1 / (this.smoothness + 1));
  }
}

class Player {
  constructor(args) {
    this.pos = args["pos"];
    this.motion = args["motion"];
    this.attribute = args["attribute"];
    this.on_ground = args["on_ground"];
    this.touching_wall = args["touching_wall"];
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
    case "ArrowUp": input_up = true; break;
    case "ArrowDown": input_down = true; break;
    case "Space": input_space = true; break;
  }
});
document.addEventListener('keyup', event => {
  switch (event.key) {
    case "ArrowLeft": input_left = false; break;
    case "ArrowRight": input_right = false; break;
    case "ArrowUp": input_up = false; start_input_up = false; break;
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
player_attribute = {
  size: new Vector2(50, 50),
  move_speed: 1,
  gravity_multiplier: 1,
  jump_power: 20,
  resistance: 0.9,
  wall_resistance: 0.6,
};

const p = new Player({
  pos: new Vector2(100, 100),
  motion: Vector2.zero,
  attribute: player_attribute,
  on_ground: false,
  touching_wall: { up: false, down: false, right: false, left: false }
});

// setting camera
const camera = new Camera({
  pos: new Vector2(0, 0),
  focus_object: p,
  offset: new Vector2(400, 300),
  smoothness: 10
});

// setting terrain
var walls = [
  { rect: [0, 0, 800, 50], material: "grass" },
  { rect: [0, 590, 800, 10], material: "dirt" },
  { rect: [0, 0, 10, 600], material: "dirt" },
  { rect: [790, 0, 10, 600], material: "dirt" },
  { rect: [100, 150, 100, 50], material: "grass" },
  { rect: [350, 150, 100, 50], material: "grass" },
  { rect: [225, 300, 100, 50], material: "grass" },
  { rect: [600, 200, 100, 50], material: "grass", animation: f => { return new Vector2(0, Math.sin(f / 50) * 50) } },
]


// tick
var game_frame = 0;
function tick() {
  logic();
  render();
  game_frame++;
  game_frame %= 1000000;
}

function logic() {
  // move player
  if (input_right) {
    p.motion.x += p.attribute.move_speed;
  }
  if (input_left) {
    p.motion.x -= p.attribute.move_speed;
  }
  if (input_up) {
    if (p.on_ground) { p.motion.y += p.attribute.jump_power; }
  }
  if (input_down) { p.motion.y -= p.attribute.move_speed; }

  // calculation
  p.motion.x *= p.attribute.resistance;
  p.motion.y += GRAVITY * p.attribute.gravity_multiplier;
  if (Math.abs(p.motion.x) < 0.1) { p.motion.x = 0 }
  move();

  // touching and sinking
  if (is_colliding(p.pos.x, p.pos.y + 1)) { p.touching_wall.up = true; } else { p.touching_wall.up = false; }
  if (is_colliding(p.pos.x, p.pos.y - 1)) { p.touching_wall.down = true; } else { p.touching_wall.down = false; }
  if (is_colliding(p.pos.x + 1, p.pos.y)) { p.touching_wall.right = true; } else { p.touching_wall.right = false; }
  if (is_colliding(p.pos.x - 1, p.pos.y)) { p.touching_wall.left = true; } else { p.touching_wall.left = false; }
}

function move() {
  if (!is_colliding(p.pos.x + p.motion.x, p.pos.y)) {
    p.pos.x += p.motion.x;
  } else {
    let length = Math.floor(Math.abs(p.motion.x)) + 1;
    for (let i = 1; i <= length; i++) {
      if (p.motion.x < 0) {
        if (is_colliding(p.pos.x - i, p.pos.y)) {
          p.pos.x -= i;
          p.pos.x++;
          break;
        }
      } else {
        if (is_colliding(p.pos.x + i, p.pos.y)) {
          p.pos.x += i;
          p.pos.x--;
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
      walls[i].rect[0],
      walls[i].rect[1] + walls[i].rect[3],
      walls[i].rect[0] + walls[i].rect[2],
      walls[i].rect[1],
    )) { flag = true; break; }
  }
  return flag;
}

function render() {
  // background
  ctx.fillStyle = "#adf";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // camera
  camera.smooth_focus();

  // player
  render_rect([p.pos.x - p.attribute.size.x / 2, p.pos.y, p.attribute.size.x, p.attribute.size.y], "#334", camera);

  // walls
  for (const wall_data of walls) {
    // animation
    var animation_offset = Vector2.zero;
    if (wall_data.animation) { animation_offset = wall_data.animation(game_frame); }

    // sparete with material
    switch (wall_data["material"]) {
      case "grass":
        render_rect(wall_data.rect, "#66482b", camera, animation_offset);
        render_rect([wall_data.rect[0], wall_data.rect[1] + wall_data.rect[3] - 20, wall_data.rect[2], 20], "#3d944f", camera, animation_offset);
        render_rect([wall_data.rect[0], wall_data.rect[1] + wall_data.rect[3] - 10, wall_data.rect[2], 10], "#49b861", camera, animation_offset);
        break;
      case "dirt":
        render_rect(wall_data.rect, "#66482b", camera, animation_offset);
        break;
    }

  }
}

function render_rect(rect_data, color, camera_object, offset = Vector2.zero) {
  ctx.fillStyle = color;
  ctx.fillRect(
    rect_data[0] - camera_object.pos.x + camera_object.offset.x + offset.x,
    rect_data[1] - camera_object.pos.y + camera_object.offset.y + offset.y,
    rect_data[2],
    rect_data[3]
  );
}

// tick
setInterval(tick, 1000 / 60);
