import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
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

export const Card = ({ children, className = '', hover = false, onClick, style }: CardProps) => {
  const hoverClasses = hover ? 'hover-lift cursor-pointer' : '';
  return (
    <div
      className={`card ${hoverClasses} ${className}`}
      onClick={onClick}
      style={style}
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


