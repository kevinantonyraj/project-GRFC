import { useEffect, useRef } from 'react';

const useScrollReveal = (deps = []) => {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
 
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            
            const delay = entry.target.dataset.delay || 100;
            setTimeout(() => entry.target.classList.add('revealed'), Number(delay));
          } else {
            entry.target.classList.remove('revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
 
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, deps);
};

export default useScrollReveal;
