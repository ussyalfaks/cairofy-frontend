import React from 'react';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  onClick?: () => void;
  size?: 'sm' | 'lg';
  type?: 'default' | 'outline';
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  size = 'sm',
  type = 'default',
  className = '',
  children,
  disabled = false,
  ...props
}) => {
  return (
    <button
      className={`relative rounded-lg cursor-pointer transition-all duration-200 bg-primary text-white
        ${size === 'sm' ? 'px-4 py-3 text-sm' : 'px-8 py-5 text-base'}
        ${className}
      `}
      onClick={onClick}
      {...props}
      disabled={disabled}
      style={{
        borderRadius: '10px',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
    >
      {children}
    </button>
  );
};

export default Button;