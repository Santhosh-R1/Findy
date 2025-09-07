import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, IconButton, Badge, Popover, List, ListItem, ListItemText, Divider, Button } from '@mui/material';
import AdminSidemenu from './AdminSidemenu';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/AdminDashboard.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { Group, Inventory, Handshake, Business, Notifications, MailOutline } from '@mui/icons-material';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API_BASE_URL = 'http://localhost:5001';
const StatCard = ({ icon, value, label, color, colorLight }) => (
  <Paper className="stat-card">
    <Box className="stat-icon-wrapper" sx={{ background: `linear-gradient(45deg, ${color}, ${colorLight})` }}>
      {icon}
    </Box>
    <Box className="stat-info">
      <Typography className="stat-value">{value}</Typography>
      <Typography className="stat-label">{label}</Typography>
    </Box>
  </Paper>
);
const createGradient = (ctx, color1, color2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
};
const StatusBadge = ({ status }) => {
  let color = 'default';
  if (status === 'lost') color = 'error';
  if (status === 'found') color = 'success';
  if (status === 'registered') color = 'primary';
  return <Chip label={status} color={color} size="small" sx={{ textTransform: 'capitalize' }} />;
};

const RecentItemsTable = ({ items }) => (
  <Paper className="data-container">
    <Typography variant="h6" className="data-container-header">Recently Added Items</Typography>
    <TableContainer>
      <Table className="dashboard-table">
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(item => (
            <TableRow hover key={item._id}>
              <TableCell>
                <Box className="table-cell-content">
                  <Avatar variant="rounded" src={`${API_BASE_URL}/${item.itemImage.replace(/\\/g, '/')}`} />
                  <Typography variant="body2">{item.itemName}</Typography>
                </Box>
              </TableCell>
              <TableCell>{`${item.owner?.firstName || 'N/A'}`}</TableCell>
              <TableCell align="center"><StatusBadge status={item.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

const NewUsersTable = ({ users }) => (
  <Paper className="data-container">
    <Typography variant="h6" className="data-container-header">New User Signups</Typography>
    <TableContainer>
      <Table className="dashboard-table">
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Joined</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map(user => (
            <TableRow hover key={user._id}>
              <TableCell>
                <Box className="table-cell-content">
                  <Avatar src={`http://localhost:5001${user.profileImage ? user.profileImage.replace(/\\/g, '/') : ''}`} />
                  <Typography variant="body2">{`${user.firstName} ${user.lastName}`}</Typography>
                </Box>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);


function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, items: 0, moderators: 0, organizations: 0 });
  const [chartData, setChartData] = useState({ itemStatus: null, itemActivity: null, userActivity: null, overview: null });
  const [recentData, setRecentData] = useState({ items: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- State for Notifications ---
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, usersRes, modsRes, orgsRes, contactRes] = await Promise.all([
          axiosInstance.get('/api/items/allItems'),
          axiosInstance.get('/api/users'),
          axiosInstance.get('/api/moderator'),
          axiosInstance.get('/api/organaisation'),
          axiosInstance.get('/api/contact'),
        ]);
        const allItems = itemsRes.data.data;
        const allUsers = usersRes.data.data;
        console.log(allItems);

        const newStats = {
          users: allUsers.length,
          items: allItems.filter(item => item.status === 'registered' || item.status === 'lost').length,
          moderators: modsRes.data.data.length,
          organizations: orgsRes.data.data.length,
        };
        setStats(newStats);

        const statusCounts = allItems.reduce((acc, item) => { acc[item.status] = (acc[item.status] || 0) + 1; return acc; }, {});
        const itemMonthCounts = Array(12).fill(0);
        allItems.forEach(item => itemMonthCounts[new Date(item.createdAt).getMonth()]++);
        const userMonthCounts = Array(12).fill(0);
        allUsers.forEach(user => userMonthCounts[new Date(user.createdAt).getMonth()]++);

        setChartData({
          itemStatus: { labels: ['Lost', 'Found', 'Registered'], datasets: [{ data: [statusCounts.lost || 0, statusCounts.found || 0, statusCounts.registered || 0], backgroundColor: ['#ef4444', '#22c55e', '#3b82f6'], borderColor: '#f8f9fa', borderWidth: 4, hoverOffset: 4 }] },
          itemActivity: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: [{ label: 'Items Added', data: itemMonthCounts, fill: true, backgroundColor: (context) => createGradient(context.chart.ctx, 'rgba(75, 192, 192, 0.5)', 'rgba(75, 192, 192, 0)'), borderColor: 'rgb(75, 192, 192)', tension: 0.4 }] },
          userActivity: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: [{ label: 'Users Joined', data: userMonthCounts, fill: true, backgroundColor: (context) => createGradient(context.chart.ctx, 'rgba(153, 102, 255, 0.5)', 'rgba(153, 102, 255, 0)'), borderColor: 'rgb(153, 102, 255)', tension: 0.4 }] },
          overview: { labels: ['Users', 'Items', 'Moderators', 'Organizations'], datasets: [{ label: 'Total Count', data: [newStats.users, newStats.items, newStats.moderators, newStats.organizations], backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'], borderRadius: 4 }] }
        });

        setRecentData({
          items: allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
          users: allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
        });

        console.log(contactRes);

        if (contactRes.data?.data) {
          const newMessages = contactRes.data.data.contacts.filter(msg => msg.status === 'new');
          setNotifications(newMessages);
        }

      } catch (err) {
        console.error("Dashboard data fetching error:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.put(`/api/contact/${id}`, { status: 'read' });
      setNotifications(prev => prev.filter(msg => msg._id !== id));
    } catch (err) {
      console.error("Failed to mark message as read:", err);
    }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;
  const commonOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  const lineChartOptions = { ...commonOptions, scales: { y: { beginAtZero: true, grid: { drawBorder: false } }, x: { grid: { display: false } } } };
  const doughnutChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } } } };
  const barChartOptions = { ...commonOptions, indexAxis: 'y', scales: { x: { grid: { display: false, drawBorder: false } }, y: { grid: { display: false } } } };

  if (loading) return <Box className="center-screen"><CircularProgress size={60} /></Box>;
  if (error) return <Box className="center-screen"><Alert severity="error" sx={{ m: 4 }}>{error}</Alert></Box>;

  return (
    <Box className="dashboard-container">
      <AdminSidemenu />
      <Box component="main" className="dashboard-content">
        <Box className="dashboard-header">
          <Typography variant="h4" component="h1">Welcome back, Admin!</Typography>
          <Box>
            <IconButton color="default" aria-describedby={id} onClick={handleNotificationClick}>
              <Badge badgeContent={notifications.length} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Box>
        </Box>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ className: 'notification-popover' }}
        >
          <Box className="notification-header">
            <Typography variant="subtitle1">New Messages</Typography>
          </Box>
          <List sx={{ p: 0 }}>
            {notifications.length > 0 ? (
              notifications.map((msg, index) => (
                <React.Fragment key={msg._id}>
                  <ListItem alignItems="flex-start" className="notification-item">
                    <MailOutline sx={{ mt: 1, mr: 2, color: 'text.secondary' }} />
                    <ListItemText
                      primary={`${msg.name} (${msg.email})`}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block', mt: 1, mb: 1 }}>
                            {msg.message}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleMarkAsRead(msg._id)}
                            sx={{ mt: 1 }}
                          >
                            Mark as Read
                          </Button>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No new messages" sx={{ textAlign: 'center', color: 'text.secondary' }} />
              </ListItem>
            )}
          </List>
        </Popover>

        <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
          <Grid item sx={{ width: 250 }}><StatCard icon={<Group />} value={stats.users} label="Total Users" color="#3b82f6" colorLight="#60a5fa" /></Grid>
          <Grid item sx={{ width: 250 }}><StatCard icon={<Inventory />} value={stats.items} label="Total Items" color="#10b981" colorLight="#34d399" /></Grid>
          <Grid item sx={{ width: 250 }}><StatCard icon={<Handshake />} value={stats.moderators} label="Moderators" color="#f59e0b" colorLight="#fbbf24" /></Grid>
          <Grid item sx={{ width: 250 }}><StatCard icon={<Business />} value={stats.organizations} label="Organizations" color="#8b5cf6" colorLight="#a78bfa" /></Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item sx={{ width: 580 }}><Paper className="data-container"><Typography variant="h6" className="data-container-header">Monthly Item Activity</Typography><Box className="chart-wrapper">{chartData.itemActivity && <Line options={lineChartOptions} data={chartData.itemActivity} />}</Box></Paper></Grid>
          <Grid item sx={{ width: 580 }}><Paper className="data-container"><Typography variant="h6" className="data-container-header">Monthly User Signups</Typography><Box className="chart-wrapper">{chartData.userActivity && <Line options={lineChartOptions} data={chartData.userActivity} />}</Box></Paper></Grid>
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item sx={{ width: 580 }}><Paper className="data-container"><Typography variant="h6" className="data-container-header">Item Status Breakdown</Typography><Box className="chart-wrapper">{chartData.itemStatus && <Doughnut options={doughnutChartOptions} data={chartData.itemStatus} />}</Box></Paper></Grid>
          <Grid item sx={{ width: 580 }}><Paper className="data-container"><Typography variant="h6" className="data-container-header">Platform Totals Overview</Typography><Box className="chart-wrapper">{chartData.overview && <Bar options={barChartOptions} data={chartData.overview} />}</Box></Paper></Grid>
        </Grid>

        <Grid container spacing={3} justifyContent="center">
          <Grid item sx={{ width: '550px' }}><RecentItemsTable items={recentData.items} /></Grid>
          <Grid item sx={{ width: '550px' }}><NewUsersTable users={recentData.users} /></Grid>
        </Grid>

      </Box>
    </Box>
  );
}

export default AdminDashboard;