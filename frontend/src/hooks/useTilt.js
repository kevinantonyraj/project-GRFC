import { useEffect } from 'react';

const useTilt = () => {
  useEffect(() => {
    const cards = document.querySelectorAll('.tilt-card');

    const handleMove = (e) => {
      const card = e.currentTarget;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
    };

    const handleLeave = (e) => {
      e.currentTarget.style.transform =
        'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
    };

    cards.forEach((card) => {
      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleMove);
        card.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, []);
};

export default useTilt;
