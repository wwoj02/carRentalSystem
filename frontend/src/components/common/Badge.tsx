import type { ReactNode } from 'react';
import { Badge as MantineBadge } from '@mantine/core';
import type { MantineColor } from '@mantine/core';

interface BadgeProps {
  children: ReactNode;
  color?: MantineColor;
  variant?: string;
}

export const Badge = ({ children, color = 'gray', variant = 'light' }: BadgeProps) => (
  <MantineBadge color={color} variant={variant} radius="xl">
    {children}
  </MantineBadge>
);
