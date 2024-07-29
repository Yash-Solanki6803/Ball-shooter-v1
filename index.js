import { Enemy, Player, Projectile } from "./classes/index.js";

const canvas = document.querySelector("canvas");

export const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const mouse = {
  x: undefined,
  y: undefined,
};

addEventListener("mousemove", (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
});

addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

const x = innerWidth / 2;
const y = innerHeight / 2;
const player = new Player(x, y, 10, "white");

const projectiles = [];
const enemies = [];

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * (30 - 10) + 10;
    let x;
    let y;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x);
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle),
    };
    enemies.push(new Enemy(x, y, radius, color, velocity));
  }, 800);
}
let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, innerWidth, innerHeight);
  player.update();
  for (let projectile of projectiles) {
    projectile.update();

    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(projectiles.indexOf(projectile), 1);
      }, 0);
    }
  }
  for (let enemy of enemies) {
    enemy.update();

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist - enemy.radius - projectile.radius < 1) {
        setTimeout(() => {
          enemies.splice(enemies.indexOf(enemy), 1);
          projectiles.splice(projectileIndex, 1);
        }, 0);
      }
    });
  }
}

addEventListener("click", (e) => {
  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );

  const velocity = {
    x: Math.cos(angle) * 20,
    y: Math.sin(angle) * 20,
  };

  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
  );
});

// init();
animate();
spawnEnemies();
