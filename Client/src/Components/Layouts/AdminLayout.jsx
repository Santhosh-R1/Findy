import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminSidemenu from '../Admin/AdminSidemenu';
import LogoutModal from '../Common/LogoutModal';

const AdminLayout = ({ children }) => {
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogoutConfirm = () => {
        localStorage.removeItem('adminToken');
        setLogoutModalOpen(false);
        navigate('/login/admin');
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AdminSidemenu onLogoutClick={() => setLogoutModalOpen(true)} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    transition: 'margin 0.3s ease',
                    width: { sm: `calc(100% - 260px)` },
                    minHeight: '100vh',
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

export default AdminLayout;
