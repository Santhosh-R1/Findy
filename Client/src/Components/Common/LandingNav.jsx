import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Link, useNavigate } from 'react-router-dom';

import '../../Styles/LandingNav.css';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const loginOptions = [
  { name: 'Admin', path: '/login/admin' },
  { name: 'User', path: '/login/user' },
  { name: 'Organisation', path: '/login/organisation' },
  { name: 'Moderator', path: '/login/moderator' },
];

function LandingNav() {
  const [anchorElLogin, setAnchorElLogin] = React.useState(null);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleOpenLoginMenu = (event) => {
    setAnchorElLogin(event.currentTarget);
  };

  const handleCloseLoginMenu = () => {
    setAnchorElLogin(null);
  };

  const handleLoginRedirect = (path) => {
    handleCloseLoginMenu();
    navigate(path);
  };

  return (
    <AppBar position="fixed" className={`landingNav-app-bar ${isScrolled ? 'scrolled' : ''}`}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Link to="/" className="landingNav-logo-link">
            <SearchIcon sx={{ display: 'flex', mr: 1, color: 'var(--primary-color)' }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 2,
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'inherit',
              }}
            >
              FINDY
            </Typography>
          </Link>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.name}
                  component={Link}
                  to={page.path}
                  className="landingNav-nav-link-button"
                >
                  {page.name}
                </Button>
              ))}
            </Box>

            <Box sx={{ ml: 2 }}>
              <Button
                aria-controls="login-menu"
                aria-haspopup="true"
                onClick={handleOpenLoginMenu}
                className="landingNav-nav-link-button landingNav-login-button"
                endIcon={<ArrowDropDownIcon />}
              >
                Login
              </Button>
              <Menu
                id="login-menu"
                anchorEl={anchorElLogin}
                open={Boolean(anchorElLogin)}
                onClose={handleCloseLoginMenu}
                MenuListProps={{
                  'aria-labelledby': 'login-button',
                }}
                sx={{
                  '& .MuiPaper-root': {
                    backgroundColor: 'var(--dark-color)',
                    color: 'white',
                    borderRadius: '8px',
                    marginTop: '8px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                  },
                }}
              >
                {loginOptions.map((option) => (
                  <MenuItem
                    key={option.name}
                    onClick={() => handleLoginRedirect(option.path)}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <Typography textAlign="center">{option.name}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default LandingNav;