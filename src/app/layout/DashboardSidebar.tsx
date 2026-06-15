import { Icon } from '@iconify/react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Typography,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import SimpleBar from 'simplebar-react';

import 'simplebar-react/dist/simplebar.min.css';
import { BuroLogo } from '@shared/components/BuroLogo';

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
  isDesktop: boolean;
  drawerWidth: number;
}

const NAV_ITEMS = [
  { label: 'Consultar Buró', icon: 'eva:search-fill', path: '/consulta' },
  { label: 'Historial de Consultas', icon: 'eva:clock-fill', path: '/historial' },
] as const;

function NavContent({ onNavigate }: { onNavigate: (path: string) => void }) {
  const theme = useTheme();
  const { pathname } = useLocation();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        onClick={() => onNavigate('/consulta')}
        sx={{
          px: 2, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          minHeight: { xs: 64, lg: 84 },
        }}
      >
        <BuroLogo height={38} />
      </Box>

      <Divider />

      <SimpleBar style={{ maxHeight: '100%', flexGrow: 1 }}>
        <List sx={{ px: 0, py: 1 }}>
          {NAV_ITEMS.map(({ label, icon, path }) => {
            const isActive = pathname === path;
            return (
              <ListItemButton
                key={path}
                selected={isActive}
                onClick={() => onNavigate(path)}
                sx={{
                  pl: 2, py: 1.5, mb: 0.5, borderRadius: 1.5, mx: 1,
                  '&.Mui-selected': {
                    bgcolor: `${theme.palette.primary.main}15`,
                    color: 'primary.main',
                    '&:hover': { bgcolor: `${theme.palette.primary.main}25` },
                  },
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary' }}>
                  <Icon icon={icon} width={22} height={22} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
                  slotProps={{ primary: { fontSize: 14, fontWeight: isActive ? 600 : 400 } }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </SimpleBar>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block" align="center">
          Buró de Crédito API v1.0
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" align="center">
          © 2026
        </Typography>
      </Box>
    </Box>
  );
}

export function DashboardSidebar({ open, onClose, isDesktop, drawerWidth }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleNavigate = (path: string) => {
    void navigate(path);
    if (!isDesktop) onClose();
  };

  const paperSx = {
    width: drawerWidth,
    bgcolor: 'rgba(255,255,255,0.85)',
    borderRight: `1px solid ${theme.palette.divider}`,
  };

  return (
    <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
      {!isDesktop && (
        <Drawer
          variant="temporary" open={open} onClose={onClose}
          ModalProps={{ keepMounted: true }}
          slotProps={{ paper: { sx: paperSx } }}
        >
          <NavContent onNavigate={handleNavigate} />
        </Drawer>
      )}
      {isDesktop && (
        <Drawer variant="permanent" open slotProps={{ paper: { sx: paperSx } }}>
          <NavContent onNavigate={handleNavigate} />
        </Drawer>
      )}
    </Box>
  );
}
