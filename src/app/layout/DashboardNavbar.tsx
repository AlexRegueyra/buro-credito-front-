import { useState } from 'react';

import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { useAuth, LogoutButton } from '@features/auth';
import { config } from '@lib/config';

interface DashboardNavbarProps {
  onToggleSidebar: () => void;
  drawerWidth: number;
}

export function DashboardNavbar({ onToggleSidebar, drawerWidth: _drawerWidth }: DashboardNavbarProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    void navigate('/profile');
    handleCloseMenu();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: 'primary.dark',
        color: '#fff',
        boxShadow: theme.shadows[8],
        zIndex: theme.zIndex.drawer + 1,
        width: '100%',        // 🔥 Barra completa
        height: { xs: 64, lg: 84 },
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 64, lg: 84 },
          px: { xs: 1, sm: 2, lg: 3 },
          justifyContent: 'space-between',
        }}
      >
        {/* Left Section: Menu Button + Logo */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            onClick={onToggleSidebar}
            sx={{
              color: '#fff',
              display: { lg: 'none' }, // solo en mobile
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            component="img"
            src={`${import.meta.env.BASE_URL}images/icons/fn_logo.svg`}
            alt="Logo NAFIN"
            sx={{ height: 40, objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </Stack>

        {/* Center Section: Logo */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Box
            component="img"
            src={`${import.meta.env.BASE_URL}images/logos/porta_6.png`}
            alt={config.appName}
            sx={{ height: { xs: 36, lg: 50 }, objectFit: 'contain', display: { xs: 'none', sm: 'block' } }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </Box>

        {/* Right Section: User Info + Actions */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {!isMobile && (
            <Typography variant="body2" color="#fff" sx={{ mr: 1 }}>
              {user?.usrNombre}
            </Typography>
          )}

          <IconButton
            onClick={handleOpenMenu}
            sx={{
              p: 0.5,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
              }}
            >
              {user?.usrNombre.charAt(0).toUpperCase() ?? 'U'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            onClick={handleCloseMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                elevation: 8,
                sx: {
                  mt: 1.5,
                  minWidth: 220,
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.5,
                  },
                },
              },
            }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <List dense>
                <ListItem>
                  <ListItemText primary="Nombre" secondary={user?.usrNombre} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Email" secondary={user?.usrEmail} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Rol" secondary={user?.rolId} />
                </ListItem>
              </List>
            </Box>

            <Divider />

            {/* Menu Items */}
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Mi Perfil
            </MenuItem>


            <Divider />

            <MenuItem>
              <LogoutButton
                variant="text"
                fullWidth
                startIcon={<LogoutIcon />}
                sx={{
                  justifyContent: 'flex-start',
                  color: 'error.main',
                  textTransform: 'none',
                  fontWeight: 400,
                }}
              >
                Cerrar Sesión
              </LogoutButton>
            </MenuItem>
          </Menu>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
