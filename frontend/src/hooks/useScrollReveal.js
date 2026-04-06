// ── useScrollReveal ──────────────────────────────────────────
import { useEffect, useRef } from 'react';

const useScrollReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
 
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Scrolled into view — animate in
            const delay = entry.target.dataset.delay || 100;
            setTimeout(() => entry.target.classList.add('revealed'), Number(delay));
          } else {
            // Scrolled out of view — reset so it can animate again
            entry.target.classList.remove('revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
 
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

export default useScrollReveal;
