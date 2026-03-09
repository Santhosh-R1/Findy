import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton
} from '@mui/material';
import { FaSignOutAlt, FaTimes } from 'react-icons/fa';
import '../../Styles/LogoutModal.css';

const LogoutModal = ({ open, onClose, onConfirm }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                className: 'logout-dialog-paper'
            }}
            BackdropProps={{
                style: { backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }
            }}
        >
            <Box className="logout-modal-content">
                <IconButton
                    className="logout-close-btn"
                    onClick={onClose}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <FaTimes />
                </IconButton>

                <Box className="logout-icon-container">
                    <FaSignOutAlt />
                </Box>

                <DialogTitle className="logout-title">
                    Logout Confirmation
                </DialogTitle>

                <DialogContent>
                    <Typography className="logout-message">
                        Are you sure you want to log out? You will need to login again to access your dashboard.
                    </Typography>
                </DialogContent>

                <DialogActions className="logout-actions">
                    <Button
                        onClick={onClose}
                        className="logout-cancel-btn"
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="logout-confirm-btn"
                        variant="contained"
                        color="error"
                        startIcon={<FaSignOutAlt />}
                    >
                        Log Out
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default LogoutModal;
