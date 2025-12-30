// src/hooks/useCountdown.js
import { useState, useEffect } from 'react';

/**
 * Một custom hook để quản lý việc đếm ngược.
 * @param {number} initialSeconds - Số giây bắt đầu đếm ngược.
 * @param {function} onComplete - Hàm callback sẽ được gọi khi đếm ngược kết thúc.
 * @returns {{minutes: number, seconds: number}} - Object chứa số phút và giây còn lại.
 */
export default function useCountdown(initialSeconds, onComplete) {
  // --- STATE ---
  // Chúng ta lưu tổng số giây còn lại, việc này dễ quản lý hơn là phút và giây riêng lẻ.
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);

  // --- EFFECT CHÍNH ĐỂ CHẠY TIMER ---
  useEffect(() => {
    // Nếu đã hết giờ, không làm gì cả.
    if (totalSeconds <= 0) {
      return;
    }

    // Thiết lập một bộ đếm thời gian (interval) chạy mỗi 1 giây.
    const intervalId = setInterval(() => {
      // Dùng functional update để đảm bảo luôn lấy giá trị state mới nhất.
      setTotalSeconds((prevSeconds) => {
        // Nếu đây là giây cuối cùng
        if (prevSeconds <= 1) {
          clearInterval(intervalId); // Dừng bộ đếm
          if (onComplete) {
            onComplete(); // Gọi hàm callback khi kết thúc
          }
          return 0;
        }
        // Giảm đi 1 giây
        return prevSeconds - 1;
      });
    }, 1000);

    // --- CLEANUP FUNCTION (CỰC KỲ QUAN TRỌNG) ---
    // Hàm này sẽ được gọi khi component sử dụng hook này bị unmount (ví dụ: người dùng rời khỏi trang).
    // Nó đảm bảo rằng bộ đếm thời gian sẽ được dọn dẹp, tránh rò rỉ bộ nhớ (memory leak).
    return () => {
      clearInterval(intervalId);
    };
  }, [totalSeconds, onComplete]); // Effect này phụ thuộc vào totalSeconds và onComplete.

  // --- TÍNH TOÁN GIÁ TRỊ ĐỂ TRẢ VỀ ---
  // Đây là "derived state" - state được tính toán từ state gốc.
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  // Hook trả về một object chứa phút và giây đã được định dạng.
  return { minutes, seconds };
}
