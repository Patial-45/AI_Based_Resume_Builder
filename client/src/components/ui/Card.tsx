import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = '', hover = false, onClick }: CardProps) => {
  const hoverClasses = hover ? 'hover-lift cursor-pointer' : '';
  return (
    <div
      className={`card ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return <div className={`card-header ${className}`}>{children}</div>;
};

export const CardBody = ({ children, className = '' }: CardBodyProps) => {
  return <div className={`card-body ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return <div className={`card-footer ${className}`}>{children}</div>;
};


