import { TextInput } from '@mantine/core';
import type { TextInputProps } from '@mantine/core';

interface InputProps extends Omit<TextInputProps, 'error'> {
  error?: string;
}

export const Input = ({ error, ...rest }: InputProps) => (
  <TextInput error={error} {...rest} />
);
