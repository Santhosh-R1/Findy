import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Button,
  CircularProgress, Alert, Modal, IconButton, Divider,
  List, ListItem, ListItemIcon, ListItemText, Fade, Backdrop, Chip, Grid
} from '@mui/material';
import {
  Info, Close, Email, Phone, ArrowBack,
  CalendarToday, Palette, LocationOn, DocumentScanner as BarcodeIcon
} from '@mui/icons-material';
import axiosInstance from '../../api/baseUrl';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import '../../Styles/ViewUsers.css';

let DefaultIcon = L.icon({
    iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DetailRow = ({ icon, label, value }) => (
  <ListItem className="admin-view-users-detail-row">
    <ListItemIcon className="admin-view-users-detail-icon">{icon}</ListItemIcon>
    <ListItemText primary={label} secondary={value || 'N/A'} />
  </ListItem>
);

const MapDisplay = ({ coords }) => {
  if (!coords || !Array.isArray(coords) || coords.length !== 2) {
    return <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>Map data unavailable.</Typography>;
  }
  const position = [coords[1], coords[0]]; 
  return (
    <Box sx={{ height: 300, width: '100%', mt: 2, borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}><Popup>Approximate Location</Popup></Marker>
      </MapContainer>
    </Box>
  );
};


function ViewUsers() {
  const main = useRef();
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalView, setModalView] = useState('USER_DETAILS');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserItems, setSelectedUserItems] = useState([]);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState(null);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get('/api/items/allItems');
        const items = response.data.data;
        
        setAllItems(items);

        const userMap = new Map();
        items.forEach(item => {
          if (item.owner && item.owner._id) {
            userMap.set(item.owner._id, item.owner);
          }
        });
        setUniqueUsers(Array.from(userMap.values()));
      } catch (err) {
        setError('Failed to fetch user data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchAndProcessData();
  }, []);

  const handleOpenUserModal = (user) => {
    setSelectedUser(user);
    const itemsForUser = allItems.filter(item => item.owner?._id === user._id);
    setSelectedUserItems(itemsForUser);
    setModalView('USER_DETAILS');
    setModalOpen(true);
  };

  const handleViewItemDetails = (item) => {
    setSelectedItemForDetail(item);
    setModalView('ITEM_DETAILS');
  };

  const handleReturnToUserView = () => {
    setModalView('USER_DETAILS');
    setSelectedItemForDetail(null);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
    setTimeout(() => {
        setSelectedUser(null);
        setSelectedItemForDetail(null);
        setModalView('USER_DETAILS');
    }, 300);
  };


  const renderUserDetailsView = () => (
    <>
      <Box className="admin-view-users-modal-header">
        <Avatar src={`http://localhost:5001${selectedUser?.profileImage}`} className="admin-view-users-modal-avatar" />
        <Box>
          <Typography variant="h6" component="h2">{selectedUser?.firstName} {selectedUser?.lastName}</Typography>
          <Typography variant="body2" color="textSecondary">Joined: {new Date(selectedUser?.createdAt).toDateString()}</Typography>
        </Box>
      </Box>
      <Divider />
      <List className="admin-view-users-modal-list">
        <ListItem className="admin-view-users-modal-list-item"><ListItemIcon className="admin-view-users-modal-list-icon"><Email /></ListItemIcon><ListItemText primary="Email" secondary={selectedUser?.email} /></ListItem>
        <ListItem className="admin-view-users-modal-list-item"><ListItemIcon className="admin-view-users-modal-list-icon"><Phone /></ListItemIcon><ListItemText primary="Phone" secondary={selectedUser?.phone} /></ListItem>
      </List>
      <Divider />
      <Box sx={{ p: 2, maxHeight: '50vh', overflowY: 'auto' }}>
        <Typography variant="overline" className="admin-view-users-modal-items-header">User's Registered Items ({selectedUserItems.length})</Typography>
        {selectedUserItems.length > 0 ? (
          <List disablePadding>
            {selectedUserItems.map(item => (
              <ListItem key={item._id} button className="admin-view-users-modal-item" onClick={() => handleViewItemDetails(item)}>
                <ListItemIcon>
                  <Avatar variant="rounded" src={`http://localhost:5001/${item.itemImage.replace(/\\/g, '/')}`} className="admin-view-users-modal-item-avatar" />
                </ListItemIcon>
                <ListItemText 
                  primary={item.mainCategory === 'pets' ? item.petName : item.itemName}
                  secondary={`Category: ${item.subCategory}`}
                />
                <Chip label={item.status} size="small" className={`admin-view-users-status-chip admin-view-users-status-${item.status}`} />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No items found for this user.</Typography>
        )}
      </Box>
    </>
  );

  const renderItemDetailsView = () => {
    const isPet = selectedItemForDetail?.mainCategory === 'pets';

    return (
      <>
        <Box className="admin-view-users-modal-header admin-view-users-item-detail-header">
           <IconButton onClick={handleReturnToUserView} className="admin-view-users-modal-back-button"><ArrowBack /></IconButton>
          <Typography variant="h6" component="h2">{isPet ? 'Pet Details' : 'Item Details'}</Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 2, maxHeight: '70vh', overflowY: 'auto' }}>
          <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                  <Avatar variant="rounded" src={`http://localhost:5001/${selectedItemForDetail?.itemImage.replace(/\\/g, '/')}`} sx={{ width: '100%', height: 'auto', aspectRatio: '4/3' }}/>
              </Grid>
              <Grid item xs={12} md={7}>
                  <Typography variant="h5" fontWeight="600">
                    {isPet ? selectedItemForDetail?.petName : selectedItemForDetail?.itemName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {isPet ? `Breed: ${selectedItemForDetail?.subCategory}` : `Brand: ${selectedItemForDetail?.brand || "N/A"}`}
                  </Typography>
                  <Chip label={selectedItemForDetail?.status} size="small" className={`admin-view-users-status-chip admin-view-users-status-${selectedItemForDetail?.status}`} />
              </Grid>
          </Grid>
          <List dense>
              <DetailRow icon={<Palette />} label="Color/Markings" value={selectedItemForDetail?.color} />
              {!isPet && (
                <DetailRow icon={<BarcodeIcon />} label="Serial Number" value={selectedItemForDetail?.serialNumber} />
              )}
              <DetailRow icon={<Info />} label="Description" value={selectedItemForDetail?.description} />
              
              <Divider sx={{ my: 1 }}/>
              
              {selectedItemForDetail?.status === 'lost' && (
                  <>
                      <DetailRow icon={<CalendarToday />} label="Date Lost" value={new Date(selectedItemForDetail.lostDate).toLocaleDateString()} />
                      <DetailRow icon={<LocationOn />} label="Last Seen Location" value={selectedItemForDetail.lostLocationAddress} />
                      <MapDisplay coords={selectedItemForDetail.lostLocation?.coordinates} />
                  </>
              )}
              {selectedItemForDetail?.status === 'found' && (
                  <>
                      <DetailRow icon={<CalendarToday />} label="Date Found" value={new Date(selectedItemForDetail.foundDate).toLocaleDateString()} />
                      <DetailRow icon={<LocationOn />} label="Found Location" value={selectedItemForDetail.foundLocationAddress} />
                      <MapDisplay coords={selectedItemForDetail.foundLocation?.coordinates} />
                  </>
              )}
              {(selectedItemForDetail?.status === 'finded' || selectedItemForDetail?.status === 'claimed') && (
                  <>
                    {selectedItemForDetail.lostLocationAddress && (
                        <DetailRow icon={<LocationOn />} label="Last Seen Location" value={selectedItemForDetail.lostLocationAddress} />
                    )}
                    {selectedItemForDetail.foundLocationAddress && (
                        <DetailRow icon={<LocationOn />} label="Recovery Location" value={selectedItemForDetail.foundLocationAddress} />
                    )}
                  </>
              )}
          </List>
        </Box>
      </>
    );
  };

  return (
    <Box className="admin-view-users-container" ref={main}>
      <Box className="admin-view-users-header">
        <Typography variant="h4" component="h1" gutterBottom>View All Users</Typography>
      </Box>
      
      {loading ? <CircularProgress /> : error ? <Alert severity="error">{error}</Alert> :
      <TableContainer component={Paper} className="admin-view-users-table-container">
        <Table>
          <TableHead>
            <TableRow className="admin-view-users-table-header">
              <TableCell>User</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Joined On</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uniqueUsers.map((user) => (
              <TableRow key={user._id} hover className="admin-view-users-table-row">
                <TableCell>
                  <Box className="admin-view-users-info-cell">
                    <Avatar src={`http://localhost:5001${user.profileImage}`} className="admin-view-users-avatar" />
                    <Box><Typography variant="body1" fontWeight="bold">{user.firstName} {user.lastName}</Typography></Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{user.email}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.phone}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{new Date(user.createdAt).toLocaleDateString()}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Button variant="outlined" color="info" size="small" startIcon={<Info />} onClick={() => handleOpenUserModal(user)}>Details</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      }

      <Modal open={modalOpen} onClose={handleCloseModal} closeAfterTransition slots={{ backdrop: Backdrop }} slotProps={{ backdrop: { timeout: 500, className: "admin-view-users-modal-backdrop" }}}>
        <Fade in={modalOpen}>
          <Box className="admin-view-users-details-modal">
            <IconButton onClick={handleCloseModal} className="admin-view-users-modal-close-button"><Close /></IconButton>
            
            {modalView === 'USER_DETAILS' && selectedUser && renderUserDetailsView()}
            {modalView === 'ITEM_DETAILS' && selectedItemForDetail && renderItemDetailsView()}

          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}

export default ViewUsers;