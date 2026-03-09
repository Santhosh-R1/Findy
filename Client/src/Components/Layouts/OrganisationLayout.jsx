import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OrganaisationNav from '../Organisation/OrganisationNav';
import OrganisationSidemenu from '../Organisation/OrganaisationSidemenu';
import LogoutModal from '../Common/LogoutModal';

const OrganisationLayout = ({ children }) => {
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogoutConfirm = () => {
        localStorage.removeItem('organisationInfo');
        localStorage.removeItem('organisationToken');
        setLogoutModalOpen(false);
        navigate('/login/organisation');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <OrganaisationNav />
            <OrganisationSidemenu onLogoutClick={() => setLogoutModalOpen(true)} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    transition: 'margin 0.3s ease',
                    width: { sm: `calc(100% - 260px)` },
                    mt: '70px',
                    minHeight: 'calc(100vh - 70px)',
                    backgroundColor: '#f1f3f5'
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

export default OrganisationLayout;
