import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { FiLoader } from 'react-icons/fi';


interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) => {
  const baseClasses = 'btn';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    success: 'btn-success',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  };
  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      type={type}
      aria-busy={isLoading || undefined}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <FiLoader className="animate-spin mr-2" />
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
