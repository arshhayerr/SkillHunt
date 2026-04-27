import React, { useState } from 'react';

// Backend-served assets (uploads) are referenced with relative paths like
// "/uploads/xxx.jpg". Resolve those against the API host.
const ASSET_BASE_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

const SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-14 h-14 text-lg',
};

const resolveSrc = (src) => {
  if (!src) return '';
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
    return src;
  }
  return `${ASSET_BASE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
};

const Avatar = ({ name = '', src = '', size = 'md', className = '' }) => {
  const initial = (name || '?').charAt(0).toUpperCase();
  const sizeClass = SIZES[size] || SIZES.md;
  const [failed, setFailed] = useState(false);

  const resolved = resolveSrc(src);
  const showImage = Boolean(resolved) && !failed;

  if (showImage) {
    return (
      <img
        src={resolved}
        alt={name}
        onError={() => setFailed(true)}
        className={`${sizeClass} rounded-xl object-cover border border-gray-200 flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm flex-shrink-0 ${className}`}
    >
      <span className="text-white font-bold">{initial}</span>
    </div>
  );
};

export default Avatar;
