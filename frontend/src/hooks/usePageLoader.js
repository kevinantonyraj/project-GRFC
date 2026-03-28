import { useEffect } from 'react';

const usePageLoader = () => {
  useEffect(() => {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;
    const timer = setTimeout(() => loader.classList.add('hidden'), 800);
    return () => clearTimeout(timer);
  }, []);
};

export default usePageLoader;
