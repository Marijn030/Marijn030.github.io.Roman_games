document.addEventListener('DOMContentLoaded', () => {
  const tableScene = document.getElementById('tableScene');
  const rollBtn = document.getElementById('rollBtn');
  const resetBtn = document.getElementById('resetBtn');
  const dieTrigger = document.getElementById('dieTrigger');
  const resultSummary = document.getElementById('resultSummary');
  const totalValue = document.getElementById('totalValue');
  const dieSlots = Array.from(document.querySelectorAll('.die-slot'));

  if (
    !tableScene ||
    !rollBtn ||
    !resetBtn ||
    !dieTrigger ||
    !resultSummary ||
    !totalValue ||
    dieSlots.length !== 5
  ) {
    console.error('Missing required dice game elements.');
    return;
  }

  let rolling = false;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function createRoll() {
    return Array.from({ length: 5 }, () => randomInt(1, 6));
  }

  function updateSummary(values) {
    const total = values.reduce((sum, value) => sum + value, 0);
    resultSummary.textContent = values.join(' - ');
    totalValue.textContent = String(total);
  }

  function hideResults() {
    dieSlots.forEach((slot) => {
      slot.classList.remove('visible', 'launching');
      slot.style.opacity = '0';
    });
  }

  function resetDieImages() {
    dieSlots.forEach((slot, index) => {
      const img = slot.querySelector('.result-die');
      if (img) {
        img.src = `dice${(index % 5) + 1}.png`;
        img.style.transform = 'translate(-50%, 0) rotate(0deg)';
      }
    });
  }

  function randomizeDicePositions() {
    const isPhone = window.innerWidth <= 640;

    const spots = isPhone
      ? [
          { left: 20, bottom: 24 },
          { left: 38, bottom: 10 },
          { left: 52, bottom: 27 },
          { left: 67, bottom: 13 },
          { left: 82, bottom: 23 }
        ]
      : [
          { left: 19, bottom: 20 },
          { left: 33, bottom: 11 },
          { left: 49, bottom: 23 },
          { left: 63, bottom: 13 },
          { left: 75, bottom: 19 }
        ];

    const shuffled = [...spots].sort(() => Math.random() - 0.5);

    dieSlots.forEach((slot, index) => {
      const img = slot.querySelector('.result-die');
      const pos = shuffled[index];

      const x = randomInt(-2, 2);
      const y = randomInt(-2, 2);
      const rot = randomInt(-16, 16);

      slot.style.left = `${pos.left + x}%`;
      slot.style.bottom = `${pos.bottom + y}%`;

      if (img) {
        img.style.transform = `translate(-50%, 0) rotate(${rot}deg)`;
      }
    });
  }

  function launchDiceFromTower(values) {
    randomizeDicePositions();

    dieSlots.forEach((slot, index) => {
      const img = slot.querySelector('.result-die');

      if (img) {
        img.src = `dice${values[index]}.png`;
      }

      slot.classList.remove('visible', 'launching');

      // start near tower exit
      slot.style.opacity = '0';
      slot.style.transform = 'translate(-50%, -180px) scale(0.45)';

      setTimeout(() => {
        slot.classList.add('launching');
      }, 60 * index);

      setTimeout(() => {
        slot.classList.remove('launching');
        slot.classList.add('visible');
        slot.style.opacity = '1';
        slot.style.transform = 'translate(-50%, 0) scale(1)';
      }, 220 + (90 * index));
    });

    updateSummary(values);
  }

  function rollDice() {
    if (rolling) return;

    rolling = true;
    tableScene.classList.add('rolling');
    hideResults();

    resultSummary.textContent = 'Dobbelstenen rollen...';
    totalValue.textContent = '...';

    const values = createRoll();

    setTimeout(() => {
      tableScene.classList.remove('rolling');
      launchDiceFromTower(values);
      rolling = false;
    }, 950);
  }

  function resetGame() {
    rolling = false;
    tableScene.classList.remove('rolling');
    hideResults();
    resetDieImages();
    randomizeDicePositions();
    resultSummary.textContent = 'Nog niet gegooid';
    totalValue.textContent = '0';
  }

  rollBtn.addEventListener('click', rollDice);
  resetBtn.addEventListener('click', resetGame);
  dieTrigger.addEventListener('click', rollDice);

  resetGame();
});
