import { Button, type ButtonProps } from '@mui/material';

import { useAuth } from '../hooks';

interface LoginButtonProps extends Omit<ButtonProps, 'onClick'> {
  children?: React.ReactNode;
}

export function LoginButton({ children = 'Iniciar Sesión', ...props }: LoginButtonProps) {
  const { login, isLoading } = useAuth();

  return (
    <Button onClick={() => { login(); }} disabled={isLoading} {...props}>
      {children}
    </Button>
  );
}
