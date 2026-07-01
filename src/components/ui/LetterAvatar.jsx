import React, { useMemo, useState } from 'react';

export default function LetterAvatar({
  name,
  className = 'h-10 w-10 text-base',
}) {
  const [imgError, setImgError] = useState(false);

  const imageUrl = useMemo(() => {
    if (!name) return '';

    const safeName = encodeURIComponent(name.trim().toLowerCase());

    return `https://picsum.photos/seed/${safeName}/150/150`;
  }, [name]);

  // 2. Logic Fallback: Lấy chữ cái đầu (Dùng khi ảnh lỗi)
  const initial = useMemo(() => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  }, [name]);

  // 3. Logic Fallback: Lấy màu nền theo tên (Dùng khi ảnh lỗi)
  const backgroundColor = useMemo(() => {
    if (!name) return '#cbd5e1';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 65%, 45%)`;
  }, [name]);

  // KẾT QUẢ RENDER:
  // Nếu không có tên, hoặc ảnh bị lỗi tải -> Hiển thị avatar chữ cái nền màu
  if (!name || imgError) {
    return (
      <div
        className={`flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
        style={{ backgroundColor }}
        title={name}
      >
        {initial}
      </div>
    );
  }

  // Nếu bình thường -> Trả ra thẻ <img> với ảnh tròn
  return (
    <img
      src={imageUrl}
      alt={name || 'Avatar'}
      title={name}
      // Bắt sự kiện lỗi (VD: user dùng trình chặn quảng cáo chặn ảnh, rớt mạng...)
      onError={() => setImgError(true)}
      className={`flex-shrink-0 rounded-full object-cover ${className}`}
    />
  );
}
