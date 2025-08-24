import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Button,
  CircularProgress, Alert, Modal, IconButton, Divider,
  List, ListItem, ListItemIcon, ListItemText, Fade, Backdrop
} from '@mui/material';
import {
  Info, Close, Email, Phone, Home, Wc
} from '@mui/icons-material';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/ViewUsers.css';

function ViewUsers() {
  const main = useRef();
  const modalContentRef = useRef();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useLayoutEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        gsap.timeline({ delay: 0.2 })
          .from(".view-users-header", { opacity: 0, y: -50, duration: 0.8, ease: 'power3.out' })
          .from(".view-users-table-container, .error-container", { opacity: 0, y: 50, duration: 1, ease: 'expo.out' }, "-=0.6")
          .from(".user-table-row", { opacity: 0, y: 30, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, "-=0.7");
      }, main);
      return () => ctx.revert();
    }
  }, [loading]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('adminToken');
        const response = await axiosInstance.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data.data);
      } catch (err) {
        setError('Failed to fetch users. Please try again later.');
        console.error("Fetch Users Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
    setTimeout(() => {
      gsap.from(modalContentRef.current.querySelectorAll('.modal-header, .modal-list-item'), {
        opacity: 0,
        y: 25,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out'
      });
    }, 10);
  };

  const handleCloseModal = () => setModalOpen(false);

  const userDetails = selectedUser ? [
    { icon: <Email />, label: 'Email Address', value: selectedUser.email },
    { icon: <Phone />, label: 'Phone Number', value: selectedUser.phone },
    { icon: <Home />, label: 'Address', value: selectedUser.address },
    { icon: <Wc />, label: 'Gender', value: selectedUser.gender, cap: true },
  ] : [];

  const renderContent = () => {
    if (loading) {
      return (
        <Box className="loading-container">
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>Loading Users...</Typography>
        </Box>
      );
    }
    if (error) {
      return <Alert severity="error" className="error-container">{error}</Alert>;
    }
    if (users.length === 0) {
      return <Alert severity="info" className="error-container">No users found.</Alert>;
    }
    return (
      <TableContainer component={Paper} className="view-users-table-container">
        <Table sx={{ minWidth: 750 }} aria-label="users table">
          <TableHead>
            <TableRow className="user-table-header">
              <TableCell>User</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Joined On</TableCell>
              <TableCell align="center">View Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id} hover className="user-table-row">
                <TableCell>
                  <Box className="user-info-cell">
                    <Avatar src={`http://localhost:5001${user.profileImage}`} alt={`${user.firstName} ${user.lastName}`} className="user-avatar" />
                    <Box>
                      <Typography variant="body1" fontWeight="bold">{user.firstName} {user.lastName}</Typography>
                      <Typography variant="body2" color="text.secondary">ID: {user._id}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{user.email}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.phone}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{user.address}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{new Date(user.createdAt).toLocaleDateString()}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Button variant="outlined" color="info" size="small" startIcon={<Info />} onClick={() => handleOpenModal(user)}>
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box className="view-users-container" ref={main}>
      <Box className="view-users-header">
        <Typography variant="h4" component="h1" gutterBottom>View All Users</Typography>
      </Box>
      
      {renderContent()}

      <Modal open={modalOpen} onClose={handleCloseModal} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500, className: "modal-backdrop" }}}>
        <Fade in={modalOpen}>
          <Box className="user-details-modal" ref={modalContentRef}>
            <IconButton onClick={handleCloseModal} className="modal-close-button"><Close /></IconButton>
            {selectedUser && (
              <>
                <Box className="modal-header">
                  <Avatar src={`http://localhost:5001${selectedUser.profileImage}`} className="modal-avatar" />
                  <Box>
                    <Typography variant="h6" component="h2">{selectedUser.firstName} {selectedUser.lastName}</Typography>
                    <Typography variant="body2" color="textSecondary">Joined: {new Date(selectedUser.createdAt).toDateString()}</Typography>
                  </Box>
                </Box>
                <Divider />
                <List className="modal-list">
                  {userDetails.map((item, index) => (
                    <ListItem key={index} className="modal-list-item">
                      <ListItemIcon className="modal-list-icon">{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.value}
                        primaryTypographyProps={{ fontWeight: '600' }}
                        className={item.cap ? 'capitalize' : ''}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}

export default ViewUsers;