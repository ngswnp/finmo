'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface BrandHeaderProps {
  /** Nội dung chữ hiển thị (mặc định: 'FINMO') */
  text?: string;
  /** ClassName tùy biến thêm */
  className?: string;
  /** Độ dày nét viền (~2px đến 3px, mặc định: 2.5) */
  strokeWidth?: number;
  /** Màu bắt đầu gradient (mặc định: #00d2ff - xanh nước biển) */
  gradientFrom?: string;
  /** Màu kết thúc gradient (mặc định: #ff007f - hồng neon) */
  gradientTo?: string;
}

export function BrandHeader({
  text = 'FINMO',
  className,
  strokeWidth = 3,
  gradientFrom = '#00d2ff',
  gradientTo = '#ff007f',
}: BrandHeaderProps) {
  const gradientId = React.useId().replace(/:/g, '_');

  // Viết hoa toàn bộ và dùng khoảng trắng thay vì dấu chấm
  const baseText = (text || 'FINMO').toUpperCase();
  const repeatedText = Array(6).fill(baseText).join('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0');

  return (
    <div
      className={cn(
        'absolute top-[2vh] left-0 right-0 z-0 overflow-hidden pointer-events-none select-none',
        className
      )}
      role="banner"
      aria-hidden="true"
    >
      <div className="flex animate-marquee-slow w-max">
        {[1, 2].map((idx) => (
          <svg
            key={idx}
            className="w-auto h-[50vh] sm:h-[60vh] overflow-visible shrink-0"
            viewBox="0 0 12000 1000"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id={`${gradientId}-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={gradientFrom} />
                <stop offset="100%" stopColor={gradientTo} />
              </linearGradient>
            </defs>
            <text
              x="0"
              y="50%"
              dominantBaseline="central"
              fill="none"
              stroke={`url(#${gradientId}-${idx})`}
              strokeWidth={strokeWidth}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="uppercase font-brand"
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: '800px',
                fontWeight: 800,
                letterSpacing: '0.15em',
              }}
            >
              {repeatedText}
            </text>
          </svg>
        ))}
      </div>
    </div>
  );
}

export default BrandHeader;
