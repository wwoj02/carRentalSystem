import { Loader, Stack, Text } from '@mantine/core';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner = ({ size = 'md', className, label }: SpinnerProps) => (
  <Stack align="center" justify="center" gap="sm" className={className}>
    <Loader size={size} color="gray" />
    {label && (
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    )}
  </Stack>
);
