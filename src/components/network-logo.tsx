import React from 'react';
import type { NetworkName } from '@/lib/definitions';
import { cn } from '@/lib/utils';

interface NetworkLogoProps extends React.SVGProps<SVGSVGElement> {
  network: NetworkName | null;
  size?: number;
}

export function NetworkLogo({ network, size = 24, className, ...props }: NetworkLogoProps) {
  const logoProps = {
    width: size,
    height: size,
    className: cn("transition-opacity duration-300", className),
    ...props
  };

  switch (network) {
    case 'MTN':
      return (
        <svg {...logoProps} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="4" fill="#FFCC00"/>
          <path d="M7.5 17V7H10.5L12 11L13.5 7H16.5V17H14.5V10L13 14H11L9.5 10V17H7.5Z" fill="#004B8D"/>
        </svg>
      );
    case 'Telecel':
      return (
        <svg {...logoProps} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="4" fill="#E60000"/>
          <path d="M7 8H17V10H13V16H11V10H7V8Z" fill="white"/>
        </svg>
      );
    case 'AirtelTigo':
      return (
        <svg {...logoProps} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="4" fill="#00AEEF"/>
          <path d="M8 8L12 12M12 12L16 8M12 12V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M6 16H18" stroke="#E6007E" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    default:
      return null;
  }
}
