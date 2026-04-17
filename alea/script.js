document.addEventListener('DOMContentLoaded', () => {
  const dieTrigger = document.getElementById('dieTrigger');
  const dieSlots = Array.from(document.querySelectorAll('.die-slot'));

  let rolling = false;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function rollDice() {
    if (rolling) return;
    rolling = true;

    // hide dice first
    dieSlots.forEach(slot => {
      slot.style.opacity = 0;
    });

    setTimeout(() => {
      dieSlots.forEach((slot) => {
        const img = slot.querySelector('.result-die');

        const value = randomInt(1, 6);
        img.src = `dice${value}.png`;

        // RANDOM POSITION under tower
        const x = randomInt(-40, 40);   // left/right spread
        const y = randomInt(0, 60);     // vertical spread

        slot.style.left = `calc(50% + ${x}px)`;
        slot.style.bottom = `${y}px`;

        slot.style.opacity = 1;
      });

      rolling = false;
    }, 800);
  }

  dieTrigger.addEventListener('click', rollDice);
});
