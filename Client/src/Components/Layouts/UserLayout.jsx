import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserNav from '../User/UserNav';
import UserSideMenu from '../User/UserSideMenu';
import LogoutModal from '../Common/LogoutModal';

const UserLayout = ({ children }) => {
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogoutConfirm = () => {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userToken');
        setLogoutModalOpen(false);
        navigate('/login/user');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <UserNav />
            {/* Note: UserSideMenu will need to be updated to accept onLogout click */}
            <UserSideMenu onLogoutClick={() => setLogoutModalOpen(true)} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    transition: 'margin 0.3s ease',
                    width: { sm: `calc(100% - 260px)` },
                    mt: '70px' // Height of the Nav
                }}
            >
                {children}
            </Box>
            <LogoutModal
                open={logoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={handleLogoutConfirm}
            />
        </Box>
    );
};

export default UserLayout;
