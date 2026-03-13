import React, { useState, useEffect } from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Typography,
  MenuItem, Menu, Avatar
} from '@mui/material';
import { AdminPanelSettings as ModIcon, Logout as LogoutIcon, Search as SearchIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import '../../Styles/ModeratorNav.css';

const sidebarWidth = 260; 
const sidebarWidthCollapsed = 80;

function ModeratorNav() {
  const [moderator, setModerator] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();

  const loadAndListenForModUpdates = () => {
    try {
      const storedModInfo = localStorage.getItem('moderatorInfo');
      if (storedModInfo) {
        setModerator(JSON.parse(storedModInfo));
      }
    } catch (error) {
      console.error("Failed to parse moderator info", error);
    }
  };

  useEffect(() => {
    loadAndListenForModUpdates();
    window.addEventListener('moderatorProfileUpdated', loadAndListenForModUpdates);
    return () => {
      window.removeEventListener('moderatorProfileUpdated', loadAndListenForModUpdates);
    };
  }, []);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    localStorage.removeItem('moderatorInfo');
    localStorage.removeItem('moderatorToken');
    navigate('/login/moderator');
    handleCloseUserMenu();
  };

  const handleProfileNavigation = () => {
    navigate('/moderator/profile');
    handleCloseUserMenu();
  };

  const modInitial = moderator?.firstName ? moderator.firstName.charAt(0).toUpperCase() : 'M';
  const modProfileImage = moderator?.profileImage
    ? `http://localhost:5001${moderator.profileImage.replace(/\\/g, '/')}`
    : null;

  return (
    <AppBar
      position="fixed"
      className="mod-nav-app-bar"
      sx={{
        width: { 
            xs: `calc(100% - ${sidebarWidthCollapsed}px)`,
            md: `calc(100% - ${sidebarWidth}px)` 
        },
        ml: { 
            xs: `${sidebarWidthCollapsed}px`,
            md: `${sidebarWidth}px` 
        },
        transition: 'width 0.3s ease, margin-left 0.3s ease'
      }}
    >
      <Toolbar>
        <Link to="/moderator/dashboard" className="mod-nav-logo-link">
          <SearchIcon sx={{ mr: 1, color: '#fd7e14' }} /> {/* Orange for Mods */}
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'inherit',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Findmate <Typography component="span" variant="caption" sx={{ opacity: 0.7, ml: 1, color: '#fd7e14' }}>MODERATOR</Typography>
          </Typography>
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar 
                alt={moderator?.firstName || 'Mod'} 
                src={modProfileImage}
                sx={{ 
                    width: 40, 
                    height: 40,
                    border: '2px solid rgba(255,255,255,0.2)',
                    bgcolor: '#fd7e14' 
                }}
            >
                {!modProfileImage && modInitial}
            </Avatar>
          </IconButton>
          <Menu
            className="mod-nav-menu"
            anchorEl={anchorElUser}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {moderator ? `${moderator.firstName} ${moderator.lastName || ''}` : 'Moderator'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {moderator?.email}
              </Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              <MenuItem onClick={handleProfileNavigation}>
                <ModIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: '1.25rem' }} />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <LogoutIcon sx={{ mr: 1.5, fontSize: '1.25rem' }} />
                Logout
              </MenuItem>
            </Box>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default ModeratorNav;