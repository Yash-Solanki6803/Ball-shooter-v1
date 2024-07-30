import { Enemy, Player, Projectile, Particle } from "./classes/index.js";

//Canvas setup
const canvas = document.querySelector("canvas");
export const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
export const friction = 1;
let score = 0;
const scoreElement = document.querySelector("#score");
const playBtn = document.querySelector("#play-btn");
const modal = document.querySelector("#modal");
const finalScore = document.querySelector("#final-score");

let enemySpawnIntervalID;

//Mouse position
const mouse = {
  x: undefined,
  y: undefined,
};
addEventListener("mousemove", (event) => {
  mouse.x = event.x;
  mouse.y = event.y;
});

//Handle window resize
addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  init();
});

//Player setup
let x = innerWidth / 2;
let y = innerHeight / 2;
let player = new Player(x, y, 10, "white");

//Projectiles, Explosion particles and enemies
let projectiles = [];
let particles = [];
let enemies = [];

function init() {
  x = innerWidth / 2;
  y = innerHeight / 2;
  player = new Player(x, y, 10, "white");

  //Projectiles, Explosion particles and enemies
  projectiles = [];
  particles = [];
  enemies = [];
  score = 0;
  scoreElement.innerHTML = score;
  finalScore.innerHTML = score;

  if (enemySpawnIntervalID) clearInterval(enemySpawnIntervalID);
}

function spawnEnemies() {
  if (enemySpawnIntervalID) clearInterval(enemySpawnIntervalID);
  enemySpawnIntervalID = setInterval(() => {
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

//Animation loop
let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, innerWidth, innerHeight);

  player.update();

  //Update and draw projectiles
  for (let projectile of projectiles) {
    projectile.update();

    //Remove projectiles that go off screen
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

  //Update and draw particles
  for (let particle of particles) {
    particle.update();
    if (particle.alpha <= 0) {
      setTimeout(() => {
        particles.splice(particles.indexOf(particle), 1);
      }, 0);
    }
  }

  //Update and draw enemies
  for (let enemy of enemies) {
    enemy.update();

    //game over
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
    if (dist - enemy.radius - player.radius < 1) {
      modal.style.display = "flex";
      finalScore.innerHTML = score;
      cancelAnimationFrame(animationId);
    }

    //Check collision between projectiles and enemies
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
      if (dist - enemy.radius - projectile.radius < 1) {
        //Spawn particles explosion
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 8),
                y: (Math.random() - 0.5) * (Math.random() * 8),
              }
            )
          );
        }

        if (enemy.radius - 10 > 10) {
          //Update score
          score += 10;
          scoreElement.innerHTML = score;

          //Shrink enemy
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          //Update score
          score += 25;
          scoreElement.innerHTML = score;

          //Remove enemy
          setTimeout(() => {
            enemies.splice(enemies.indexOf(enemy), 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  }
}

//Add Projectile on click
addEventListener("click", (e) => {
  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  );

  const velocity = {
    x: Math.cos(angle) * 9,
    y: Math.sin(angle) * 9,
  };

  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, "white", velocity)
  );
});

playBtn.addEventListener("click", () => {
  init();
  animate();
  spawnEnemies();
  modal.style.display = "none";
});

// init();
// animate();
// spawnEnemies();
