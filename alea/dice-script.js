import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.158/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer, controls;
let dice = [];
let spinning = false;
let rolling = false;

init();

function init() {
  const container = document.getElementById("scene");

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 4, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 5);
  scene.add(light);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  createDice();

  document.getElementById("spinBtn").addEventListener("click", startSpin);
  document.getElementById("dropBtn").addEventListener("click", dropDice);

  animate();
}

function createDice() {
  for (let i = 0; i < 5; i++) {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const cube = new THREE.Mesh(geo, mat);

    cube.position.set(i - 2, 2 + Math.random(), 0);
    scene.add(cube);

    dice.push({
      mesh: cube,
      velocity: new THREE.Vector3(),
      rotationSpeed: new THREE.Vector3(
        Math.random() * 0.2,
        Math.random() * 0.2,
        Math.random() * 0.2
      ),
      result: null
    });
  }
}

function startSpin() {
  spinning = true;
  rolling = false;
}

function dropDice() {
  spinning = false;
  rolling = true;

  dice.forEach(d => {
    d.velocity.set(
      (Math.random() - 0.5) * 0.1,
      -0.2 - Math.random() * 0.1,
      (Math.random() - 0.5) * 0.1
    );
  });

  setTimeout(() => {
    calculateResults();
  }, 2000);
}

function calculateResults() {
  dice.forEach(d => {
    const up = new THREE.Vector3(0, 1, 0);
    const axes = [
      { dir: new THREE.Vector3(1, 0, 0), val: 3 },
      { dir: new THREE.Vector3(-1, 0, 0), val: 4 },
      { dir: new THREE.Vector3(0, 1, 0), val: 1 },
      { dir: new THREE.Vector3(0, -1, 0), val: 6 },
      { dir: new THREE.Vector3(0, 0, 1), val: 2 },
      { dir: new THREE.Vector3(0, 0, -1), val: 5 }
    ];

    let best = 0;
    let bestDot = -Infinity;

    axes.forEach(a => {
      const worldDir = a.dir.clone().applyQuaternion(d.mesh.quaternion);
      const dot = worldDir.dot(up);

      if (dot > bestDot) {
        bestDot = dot;
        best = a.val;
      }
    });

    d.result = best;
  });

  const resultsDiv = document.getElementById("results");
  const values = dice.map(d => d.result);
  const total = values.reduce((a, b) => a + b, 0);

  resultsDiv.textContent = `Result: ${values.join(", ")} | Total: ${total}`;
}

function animate() {
  requestAnimationFrame(animate);

  dice.forEach(d => {
    if (spinning) {
      d.mesh.rotation.x += d.rotationSpeed.x;
      d.mesh.rotation.y += d.rotationSpeed.y;
      d.mesh.rotation.z += d.rotationSpeed.z;

      d.mesh.position.y = 2 + Math.sin(Date.now() * 0.002 + d.mesh.position.x);
    }

    if (rolling) {
      d.mesh.position.add(d.velocity);
      d.velocity.y -= 0.01;

      if (d.mesh.position.y < 0.5) {
        d.mesh.position.y = 0.5;
        d.velocity.y *= -0.3;

        if (Math.abs(d.velocity.y) < 0.02) {
          d.velocity.y = 0;
        }
      }

      d.mesh.rotation.x += d.rotationSpeed.x * 2;
      d.mesh.rotation.y += d.rotationSpeed.y * 2;
    }
  });

  controls.update();
  renderer.render(scene, camera);
}
