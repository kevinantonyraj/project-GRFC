import { useEffect } from 'react';

const useProgressBar = () => {
  useEffect(() => {
    const bars = document.querySelectorAll('.progress-fill[data-width]');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.style.width = e.target.dataset.width + '%';
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.5 }
    );
    bars.forEach((b) => obs.observe(b));
    return () => obs.disconnect();
  }, []);
};

export default useProgressBar;
