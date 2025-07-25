// ScrollToTop.jsx with customizable animation options
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component that scrolls the window to the top when the route changes
 * With customizable animation settings
 * 
 * @param {Object} props - Component props
 * @param {string} props.behavior - Scroll behavior ('auto', 'smooth', or 'instant')
 * @param {number} props.delay - Optional delay before scrolling (in milliseconds)
 */
function ScrollToTop({ behavior = 'smooth', delay = 0 }) {
  const { pathname } = useLocation();

  useEffect(() => {
    // Optional delay before scrolling
    const scrollTimer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: behavior // Use the behavior prop ('smooth' by default)
      });
    }, delay);

    // Clean up the timer if the component unmounts or route changes again
    return () => clearTimeout(scrollTimer);
  }, [pathname, behavior, delay]);

  return null; // This component doesn't render anything
}

export default ScrollToTop;
