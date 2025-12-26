import React from 'react';
import type { NetworkName } from '@/lib/definitions';
import { cn } from '@/lib/utils';

interface NetworkLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
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
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg" alt="MTN" {...logoProps} />
      );
    case 'Telecel':
      return (
        <img src="https://telecelglobal.com/wp-content/uploads/2024/03/telecel-new-branding.jpg" alt="Telecel" {...logoProps} />
      );
    case 'AirtelTigo':
      return (
        <img src="https://www.at.com.gh/assets/img/at-logos/at-logo-sm.png" alt="AirtelTigo" {...logoProps} />
      );
    default:
      return null;
  }
}
