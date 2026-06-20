import type { ReactNode } from 'react';
import { Button as MantineButton } from '@mantine/core';
import type { ButtonProps as MantineButtonProps } from '@mantine/core';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'pill';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<MantineButtonProps, 'variant' | 'size' | 'color'> {
  variant?: Variant;
  size?: Size;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  children: ReactNode;
}

// Maps our semantic variants onto Mantine's variant/color/radius props.
const variantMap: Record<Variant, Pick<MantineButtonProps, 'variant' | 'color' | 'radius'>> = {
  primary: { variant: 'filled', color: 'dark' },
  secondary: { variant: 'light', color: 'gray' },
  outline: { variant: 'outline', color: 'gray' },
  ghost: { variant: 'subtle', color: 'gray' },
  danger: { variant: 'filled', color: 'red' },
  pill: { variant: 'filled', color: 'dark', radius: 'xl' },
};

const sizeMap: Record<Size, string> = { sm: 'sm', md: 'md', lg: 'lg' };

export const Button = ({ variant = 'primary', size = 'md', children, ...rest }: ButtonProps) => (
  <MantineButton {...variantMap[variant]} size={sizeMap[size]} {...rest}>
    {children}
  </MantineButton>
);
