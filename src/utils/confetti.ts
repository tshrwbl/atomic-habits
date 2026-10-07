import confetti from 'canvas-confetti';

export function triggerCompletionConfetti() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
    disableForReducedMotion: true,
  });
}

export function triggerStreakMilestoneConfetti() {
  const duration = 2.5 * 1000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#f59e0b', '#10b981', '#6366f1'],
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#f59e0b', '#10b981', '#ec4899'],
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  frame();
}
