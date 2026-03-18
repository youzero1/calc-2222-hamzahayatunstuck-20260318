'use client';

import React from 'react';

interface DisplayProps {
  expression: string;
  current: string;
  hasError: boolean;
}

export default function Display({ expression, current, hasError }: DisplayProps) {
  const fontSize = current.length > 12 ? 'text-2xl' : current.length > 9 ? 'text-3xl' : 'text-4xl';

  return (
    <div className="bg-gray-900 rounded-2xl p-5 mb-4 min-h-[110px] flex flex-col justify-between">
      <div className="text-gray-400 text-sm text-right min-h-[20px] truncate">
        {expression || '\u00A0'}
      </div>
      <div
        className={`text-right font-light tracking-wide truncate ${
          hasError ? 'text-red-400 text-3xl' : `text-white ${fontSize}`
        }`}
      >
        {current || '0'}
      </div>
    </div>
  );
}
