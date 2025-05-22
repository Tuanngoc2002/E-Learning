import React from 'react';
import { twMerge } from 'tailwind-merge';
import Tilt from 'react-parallax-tilt';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  withTilt?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className,
  onClick,
  withTilt = false
}) => {
  const cardContent = (
    <div
      className={twMerge(
        'bg-white rounded-lg overflow-hidden cursor-pointer',
        onClick && 'hover:shadow-lg transition-shadow duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );

  return withTilt ? (
    <Tilt>
      {cardContent}
    </Tilt>
  ) : (
    cardContent
  );
};

export default Card; 