import React, { useState, useEffect } from 'react';
import {
  AppBar, Box, Toolbar, IconButton, Typography,
  MenuItem, Menu, Avatar
} from '@mui/material';
import { Business as BusinessIcon, Logout as LogoutIcon, Search as SearchIcon, Menu as MenuIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import '../../Styles/OrganisationNav.css';

const sidebarWidth = 260; 
const sidebarWidthCollapsed = 80;

function OrganisationNav() {
  const [org, setOrg] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();

  const loadAndListenForOrgUpdates = () => {
    try {
      const storedOrgInfo = localStorage.getItem('organisationInfo');
      if (storedOrgInfo) {
        const parsed = JSON.parse(storedOrgInfo);
        setOrg(parsed.data || parsed);
      }
    } catch (error) {
      console.error("Failed to parse organisation info from localStorage", error);
    }
  };

  useEffect(() => {
    loadAndListenForOrgUpdates();
    window.addEventListener('organisationProfileUpdated', loadAndListenForOrgUpdates);
    return () => {
      window.removeEventListener('organisationProfileUpdated', loadAndListenForOrgUpdates);
    };
  }, []);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = () => {
    localStorage.removeItem('organisationInfo');
    localStorage.removeItem('organisationToken');
    navigate('/login/organisation');
    handleCloseUserMenu();
  };

  const handleProfileNavigation = () => {
    navigate('/organisation/profile');
    handleCloseUserMenu();
  };

  const orgInitial = org?.organisationName ? org.organisationName.charAt(0).toUpperCase() : 'O';
  const orgLogo = org?.organisationLogo
    ? `http://localhost:5001${org.organisationLogo.replace(/\\/g, '/')}`
    : null;

  return (
    <AppBar
      position="fixed"
      className="org-nav-app-bar"
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
        
        <Link to="/organisation/dashboard" className="org-nav-logo-link">
          <SearchIcon sx={{ mr: 1, color: '#20c997' }} />
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
            FINDY <Typography component="span" variant="caption" sx={{ opacity: 0.7, ml: 1 }}>ORG PORTAL</Typography>
          </Typography>
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar 
                alt={org?.organisationName || 'Org'} 
                src={orgLogo}
                sx={{ 
                    width: 40, 
                    height: 40,
                    border: '2px solid rgba(255,255,255,0.2)',
                    bgcolor: '#20c997' // Fallback color
                }}
            >
                {!orgLogo && orgInitial}
            </Avatar>
          </IconButton>
          <Menu
            className="org-nav-menu"
            anchorEl={anchorElUser}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {org?.organisationName || 'Organization'}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {org?.email}
              </Typography>
            </Box>
            <Box sx={{ p: 1 }}>
              <MenuItem onClick={handleProfileNavigation}>
                <BusinessIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: '1.25rem' }} />
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

export default OrganisationNav;