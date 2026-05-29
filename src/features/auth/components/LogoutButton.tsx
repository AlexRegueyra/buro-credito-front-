import { Button, type ButtonProps } from '@mui/material';

import { useAuth } from '../hooks';

interface LogoutButtonProps extends Omit<ButtonProps, 'onClick'> {
  children?: React.ReactNode;
}

export function LogoutButton({ children = 'Cerrar Sesión', ...props }: LogoutButtonProps) {
  const { logout, isLoading } = useAuth();

  return (
    <Button onClick={() => { void logout(); }} disabled={isLoading} {...props}>
      {children}
    </Button>
  );
}
