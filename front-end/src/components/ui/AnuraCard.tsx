// src/components/ui/AnuraCard.tsx
import { Card, CardBody } from '@wordpress/components';

interface AnuraCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const AnuraCard: React.FC<AnuraCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = '',
}) => {
  const hasHeader = !!(title || subtitle || icon);

  return (
    <Card className={`mb-6 ${className}`}>
      <CardBody>
        {hasHeader && (
          <header className="anura-card-header">
            <div className="anura-card-header-content">
              {icon && (
                <div className="anura-card-icon">
                  {icon}
                </div>
              )}
              
              {(title || subtitle) && (
                <div className="anura-card-text">
                  {title && (
                    <h3 className="anura-card-title">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="anura-card-subtitle">
                      {subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="anura-card-divider" />
          </header>
        )}
        
        <div className={`anura-card-content ${hasHeader ? 'has-header' : 'no-header'}`}>
          {children}
        </div>
      </CardBody>
    </Card>
  );
};