import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  glow?: boolean;
}

export const Card = ({ className = '', hoverEffect = false, glow = false, children, ...props }: CardProps) => {
  return (
    <div
      className={`glass-card rounded-xl p-6 ${hoverEffect ? 'glass-card-hover' : ''} ${glow ? 'glow-border' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`mb-4 border-b border-white/5 pb-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-lg font-bold text-white tracking-wide ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-xs text-zinc-400 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

export default Card;
