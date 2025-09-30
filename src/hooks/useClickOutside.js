import { useEffect, useRef } from 'react';

/**
 * Hook cho phép xử lý sự kiện click ra ngoài một element.
 * @param {Function} handler - Hàm callback khi click ra ngoài.
 * @returns {React.RefObject} ref để gán vào element cần theo dõi.
 */
const useClickOutside = (handler) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [handler]);

  return ref;
};

export default useClickOutside;
