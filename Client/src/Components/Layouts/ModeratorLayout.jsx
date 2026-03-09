import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ModeratorNav from '../Moderator/ModeratorNav';
import ModeratorSidemenu from '../Moderator/ModeratorSidemenu';
import LogoutModal from '../Common/LogoutModal';

const ModeratorLayout = ({ children }) => {
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogoutConfirm = () => {
        localStorage.removeItem('moderatorInfo');
        localStorage.removeItem('moderatorToken');
        setLogoutModalOpen(false);
        navigate('/login/moderator');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <ModeratorNav />
            <ModeratorSidemenu onLogoutClick={() => setLogoutModalOpen(true)} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    transition: 'margin 0.3s ease',
                    width: { sm: `calc(100% - 260px)` },
                    mt: '70px',
                    minHeight: 'calc(100vh - 70px)',
                    backgroundColor: '#f8f9fa'
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

export default ModeratorLayout;
