import React, { useState, useEffect } from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Typography,
  MenuItem, Menu, Avatar
} from '@mui/material';
import { Person as PersonIcon, Logout as LogoutIcon, Search as SearchIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import '../../Styles/UserNav.css'; 

const sidebarWidth = 260;

function UserNav() {
  const [user, setUser] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();

  const loadAndListenForUserUpdates = () => {
    try {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUser(JSON.parse(storedUserInfo));
      }
    } catch (error) {
      console.error("Failed to parse user info from localStorage", error);
    }
  };

  useEffect(() => {
    loadAndListenForUserUpdates();
    window.addEventListener('profileUpdated', loadAndListenForUserUpdates);
    return () => {
      window.removeEventListener('profileUpdated', loadAndListenForUserUpdates);
    };
  }, []);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
    navigate('/'); 
    handleCloseUserMenu();
  };
  
  const handleProfileNavigation = () => {
    navigate('/user/profile'); 
    handleCloseUserMenu();
  };

  const userInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : '';
  const userProfileImage = user?.profileImage
    ? `http://localhost:5001${user.profileImage.replace(/\\/g, '/')}`
    : null;

  return (
    <AppBar
      position="fixed"
      className="user-nav-app-bar"
      sx={{
        width: { sm: `calc(100% - ${sidebarWidth}px)` },
        ml: { sm: `${sidebarWidth}px` },
      }}
    >
      <Toolbar>
        <Link to="/user/dashboard" className="user-nav-logo-link">
          <SearchIcon sx={{ mr: 1, color: '#19a47a' }} />
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 700,
              letterSpacing: '.2rem',
              color: 'inherit',
            }}
          >
            FINDY
          </Typography>
        </Link>

        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar alt={user?.firstName || 'User'} src={userProfileImage}>
                {!userProfileImage && userInitial}
            </Avatar>
          </IconButton>
          <Menu
            className="user-nav-menu"
            anchorEl={anchorElUser}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
                <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                    {user?.email}
                </Typography>
            </Box>
            <Box sx={{ p: 1 }}>
                <MenuItem onClick={handleProfileNavigation}>
                    <PersonIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: '1.25rem' }}/>
                    My Profile
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <LogoutIcon sx={{ mr: 1.5, fontSize: '1.25rem' }}/>
                    Logout
                </MenuItem>
            </Box>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default UserNav;