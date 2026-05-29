import { useState } from 'react';

import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';

import { SessionTimer } from '@features/auth';

import { DashboardNavbar } from './DashboardNavbar';
import { DashboardSidebar } from './DashboardSidebar';

const DRAWER_WIDTH = 280;
const NAVBAR_HEIGHT = { mobile: 64, desktop: 84 };

export function DashboardLayout() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: 'background.default',
      backgroundImage: `url(${import.meta.env.BASE_URL}images/illustrations/textura.svg)`,
      backgroundPosition: 'bottom left',
      backgroundRepeat: 'no-repeat',
      backgroundSize: '50%',
    }}>
      {/* Navbar */}
      <DashboardNavbar
        onToggleSidebar={handleToggleSidebar}
        drawerWidth={isDesktop ? DRAWER_WIDTH : 0}
      />

      {/* Sidebar */}
      <DashboardSidebar
        open={sidebarOpen}
        onClose={handleCloseSidebar}
        isDesktop={isDesktop}
        drawerWidth={DRAWER_WIDTH}
      />

      {/* Main Content - Optimizado para mejor uso del espacio */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          pt: {
            xs: `${String(NAVBAR_HEIGHT.mobile)}px`,
            lg: `${String(NAVBAR_HEIGHT.desktop)}px`,
          },
          px: { xs: 2, sm: 2.5, lg: 3 }, // Reducido: 2,3,4 -> 2,2.5,3
          pb: 2, // Reducido: 3 -> 2
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flexGrow: 1, width: '100%', maxWidth: '100%' }}>
          <Outlet />
        </Box>
      </Box>
      {/* Session Timer */}
      <SessionTimer inactivityTimeout={15} warningBeforeTimeout={2} />
    </Box>
  );
}
