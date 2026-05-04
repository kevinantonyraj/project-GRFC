import { useEffect } from 'react';

const useCounterAnimation = (deps = []) => {
  useEffect(() => {
    const counters = document.querySelectorAll('[data-count]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          const target = +el.dataset.count;
          const dur = 1800;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / dur, 1);
            const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
            el.textContent = Math.round(ease * target);
            if (p < 1) requestAnimationFrame(tick);
            else el.textContent = target;
          };
          requestAnimationFrame(tick);
          obs.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, deps);
};

export default useCounterAnimation;
