'use client';

import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'number' | 'operator' | 'function' | 'equals';
  wide?: boolean;
  className?: string;
}

export default function Button({
  label,
  onClick,
  variant = 'number',
  wide = false,
  className = '',
}: ButtonProps) {
  const variantClasses = {
    number: 'btn-number',
    operator: 'btn-operator',
    function: 'btn-function',
    equals: 'btn-equals',
  };

  return (
    <button
      onClick={onClick}
      className={`calculator-btn ${variantClasses[variant]} ${wide ? 'btn-zero' : ''} ${className}`}
      aria-label={label}
    >
      {label}
    </button>
  );
}
