import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip, IconButton, Badge, Popover, List, ListItem, ListItemText, Divider, Button 
} from '@mui/material';
import AdminSidemenu from './AdminSidemenu';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/AdminDashboard.css';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Group, Inventory, Handshake, Business, Notifications, MailOutline, CheckCircle 
} from '@mui/icons-material';

const StatCard = ({ icon, value, label, color }) => (
  <Paper className="stat-card" elevation={0}>
    <Box className="stat-icon-wrapper" sx={{ backgroundColor: color, boxShadow: `0 4px 10px ${color}66` }}>
      {icon}
    </Box>
    <Box className="stat-info">
      <Typography variant="h4" component="h2" className="stat-value">{value}</Typography>
      <Typography variant="subtitle2" className="stat-label">{label}</Typography>
    </Box>
  </Paper>
);

const StatusBadge = ({ status }) => {
  let color = 'default';
  if (status === 'lost') color = 'error';
  else if (status === 'found') color = 'success';
  else if (status === 'claimed' || status === 'finded') color = 'success';
  else if (status === 'registered') color = 'primary';
  
  return <Chip label={status} color={color} size="small" sx={{ textTransform: 'capitalize' }} />;
};

const RecentItemsTable = ({ items }) => (
  <Paper className="data-container">
    <Typography variant="h6" className="data-container-header">Recently Registered Items</Typography>
    <TableContainer sx={{ maxHeight: 400 }}>
      <Table stickyHeader className="dashboard-table">
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
                <Box className="table-cell-content" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar variant="rounded" src={`http://localhost:5001/${item.itemImage.replace(/\\/g, '/')}`} />
                  <Typography variant="body2" fontWeight="500">{item.itemName}</Typography>
                </Box>
              </TableCell>
              <TableCell>{item.owner ? `${item.owner.firstName}` : 'N/A'}</TableCell>
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
    <TableContainer sx={{ maxHeight: 400 }}>
      <Table stickyHeader className="dashboard-table">
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
                <Box className="table-cell-content" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={user.profileImage ? `http://localhost:5001${user.profileImage}` : ''} />
                  <Typography variant="body2" fontWeight="500">{`${user.firstName} ${user.lastName}`}</Typography>
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
  
  // Recharts Data States
  const [statusChartData, setStatusChartData] = useState([]);
  const [itemActivityData, setItemActivityData] = useState([]);
  const [userActivityData, setUserActivityData] = useState([]);
  
  const [recentData, setRecentData] = useState({ items: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Notifications
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

        const allItemsRaw = itemsRes.data.data; 
        const allUsers = usersRes.data.data;
        
        const registeredItemsOnly = allItemsRaw.filter(item => !item.finder);

        // Stats
        const newStats = {
          users: allUsers.length,
          items: registeredItemsOnly.length, 
          moderators: modsRes.data.data.length,
          organizations: orgsRes.data.data.length,
        };
        setStats(newStats);

       
        const statusCounts = registeredItemsOnly.reduce((acc, item) => { 
             let s = item.status;
             if(s === 'finded' || s === 'claimed') s = 'claimed';
             
             acc[s] = (acc[s] || 0) + 1; 
             return acc; 
        }, {});
        
        const pieData = Object.keys(statusCounts).map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: statusCounts[key]
        }));
        setStatusChartData(pieData);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const itemMonthCounts = Array(12).fill(0);
        registeredItemsOnly.forEach(item => itemMonthCounts[new Date(item.createdAt).getMonth()]++);
        
        const userMonthCounts = Array(12).fill(0);
        allUsers.forEach(user => userMonthCounts[new Date(user.createdAt).getMonth()]++);

        const activityData = months.map((month, index) => ({
            name: month,
            items: itemMonthCounts[index],
            users: userMonthCounts[index]
        }));
        setItemActivityData(activityData);


        setRecentData({
          items: registeredItemsOnly.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
          users: allUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)
        });

       
        if (contactRes.data?.data) {
          const newMessages = contactRes.data.data.contacts.filter(msg => msg.status === 'new');
          setNotifications(newMessages);
        }

      } catch (err) {
        console.error("Dashboard data fetching error:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNotificationClick = (event) => setAnchorEl(event.currentTarget);
  const handleNotificationClose = () => setAnchorEl(null);

  const handleMarkAsRead = async (id) => {
    try {
      await axiosInstance.put(`/api/contact/${id}`, { status: 'read' });
      setNotifications(prev => prev.filter(msg => msg._id !== id));
    } catch (err) { console.error(err); }
  };

  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;

  // Colors
  const PIE_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'];

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box className="dashboard-container">
      <AdminSidemenu />
      <Box component="main" className="dashboard-content">
        
        <Box className="dashboard-header" sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1" fontWeight="700" color="#1b2559">Admin Dashboard</Typography>
          <IconButton color="primary" onClick={handleNotificationClick} sx={{ backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <Badge badgeContent={notifications.length} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Box>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleNotificationClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { width: 320, maxHeight: 400, borderRadius: 2 } }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
            <Typography variant="subtitle1" fontWeight="bold">New Messages</Typography>
          </Box>
          <List sx={{ p: 0 }}>
            {notifications.length > 0 ? (
              notifications.map((msg, index) => (
                <React.Fragment key={msg._id}>
                  <ListItem alignItems="flex-start" sx={{ '&:hover': { bgcolor: '#f9f9f9' } }}>
                    <MailOutline sx={{ mt: 1, mr: 2, color: 'primary.main' }} />
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" fontWeight="600">{msg.name}</Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 0.5 }}>{msg.email}</Typography>
                          <Typography variant="body2" color="text.primary">{msg.message}</Typography>
                          <Button size="small" onClick={() => handleMarkAsRead(msg._id)} sx={{ mt: 1, textTransform: 'none' }}>Mark Read</Button>
                        </>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))
            ) : (
              <ListItem><ListItemText primary="No new messages" sx={{ textAlign: 'center', color: 'text.secondary' }} /></ListItem>
            )}
          </List>
        </Popover>

        <Grid container spacing={12} mb={4}>
          <Grid item xs={12} sm={12} md={3}  >
            <StatCard  icon={<Group sx={{ color: 'white' }} />} value={stats.users} label="Total Users" color="#4318FF" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<Inventory sx={{ color: 'white' }} />} value={stats.items} label="Registered Items" color="#05CD99" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<Handshake sx={{ color: 'white' }} />} value={stats.moderators} label="Moderators" color="#FFB547" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard icon={<Business sx={{ color: 'white' }} />} value={stats.organizations} label="Organizations" color="#868CFF" />
          </Grid>
        </Grid>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Paper className="data-container" sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>Monthly Item Registrations</Typography>
              <ResponsiveContainer width={520} height={300}>
                <AreaChart data={itemActivityData}>
                    <defs>
                        <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#05CD99" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#05CD99" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E5F2" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A3AED0'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0'}} />
                    <RechartsTooltip contentStyle={{ borderRadius: '10px', border: 'none' }} />
                    <Area type="monotone" dataKey="items" stroke="#05CD99" fillOpacity={1} fill="url(#colorItems)" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
             <Paper className="data-container" sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>Monthly User Signups</Typography>
              <ResponsiveContainer width={520} height={300}>
                <AreaChart data={itemActivityData}>
                    <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4318FF" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#4318FF" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E5F2" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A3AED0'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0'}} />
                    <RechartsTooltip contentStyle={{ borderRadius: '10px', border: 'none' }} />
                    <Area type="monotone" dataKey="users" stroke="#4318FF" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={5}>
            <Paper className="data-container" sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>Item Status Breakdown</Typography>
              <ResponsiveContainer width={520} height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend iconType="circle" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

           <Grid item xs={12} md={7}>
            <Paper className="data-container" sx={{ p: 3, borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
               <Typography variant="h6" fontWeight="bold" mb={2}>Platform Totals Overview</Typography>
               <ResponsiveContainer width={520} height={300}>
                 <BarChart data={[
                    { name: 'Users', count: stats.users },
                    { name: 'Items', count: stats.items },
                    { name: 'Mods', count: stats.moderators },
                    { name: 'Orgs', count: stats.organizations }
                 ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E5F2" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A3AED0'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0'}} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '10px' }}/>
                    <Bar dataKey="count" fill="#868CFF" radius={[10, 10, 0, 0]} barSize={50}>
                        { [stats.users, stats.items, stats.moderators, stats.organizations].map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </Paper>
          </Grid>
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