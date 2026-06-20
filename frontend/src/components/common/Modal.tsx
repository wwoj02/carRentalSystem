import type { ReactNode } from 'react';
import { Modal as MantineModal, Divider, Box } from '@mantine/core';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'md', md: 'lg', lg: 'xl' } as const;

export const Modal = ({ open, onClose, title, children, footer, size = 'md' }: ModalProps) => (
  <MantineModal
    opened={open}
    onClose={onClose}
    title={title}
    size={sizeMap[size]}
    centered
    radius="lg"
    overlayProps={{ backgroundOpacity: 0.6, blur: 3 }}
  >
    {children}
    {footer && (
      <>
        <Divider my="md" />
        <Box>{footer}</Box>
      </>
    )}
  </MantineModal>
);
