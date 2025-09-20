import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { FaBox, FaSearch, FaExclamationTriangle, FaCheckCircle, FaPlus } from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/UserDashBoard.css';

const StatCard = ({ title, value, icon, color, delay }) => (
  <Paper
    className="stat-card"
    elevation={0}
    variant="outlined"
    style={{ animationDelay: delay }} 
  >
    <Box className="stat-icon-wrapper" sx={{ backgroundColor: color }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h5" component="p" className="stat-value">{value}</Typography>
      <Typography variant="body2" className="stat-title">{title}</Typography>
    </Box>
  </Paper>
);

function UserDashBoard() {
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalLost: 0,
    totalFound: 0,
    totalReturned: 0,
  });
  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        console.log(userInfo);
        if (!userInfo || !userInfo._id) {
          throw new Error("Authentication error. Please log in again.");
        }
        setUserName(userInfo.name || 'User');

        const [registeredResponse, foundResponse] = await Promise.all([
          axiosInstance.get(`/api/items/user/${userInfo._id}`),
          axiosInstance.get(`/api/items/found/user/${userInfo._id}`)
        ]);

        const registeredItems = registeredResponse.data.data;
        const foundItems = foundResponse.data.data;
        console.log("Registered Items:", registeredItems);
        console.log("Found Items:", foundItems);

        const totalRegistered = registeredItems.length;
        const totalLost = registeredItems.filter(item => item.status === 'lost').length;
        const totalFound = foundItems.length;
                const myItemsReturned = registeredItems.filter(item => item.status === 'claimed' || item.status === 'returned').length;
        const itemsIFoundReturned = foundItems.filter(item => item.status === 'claimed' || item.status === 'returned').length;
        const totalReturned = myItemsReturned + itemsIFoundReturned;

        setStats({ totalRegistered, totalLost, totalFound, totalReturned });

        const allUserItems = registeredItems; 

        const categoryCounts = allUserItems.reduce((acc, item) => {
          const category = item.mainCategory.charAt(0).toUpperCase() + item.mainCategory.slice(1);
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});
        setCategoryData(Object.keys(categoryCounts).map(key => ({ name: key, value: categoryCounts[key] })));

        const statusCounts = allUserItems.reduce((acc, item) => {
            const status = item.status.charAt(0).toUpperCase() + item.status.slice(1);
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        setStatusData(Object.keys(statusCounts).map(key => ({ name: key, count: statusCounts[key] })));

        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError(err.response?.data?.message || "Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const PIE_COLORS = ['#20c997', '#6f42c1', '#fd7e14', '#0dcaf0', '#d63384'];
  const BAR_CHART_COLORS = ['#0d6efd', '#dc3545', '#198754', '#ffc107', '#6f42c1', '#0dcaf0', '#6610f2'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; 
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="14px" fontWeight="600">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return (
      <Box className="dashboard-content-area status-container">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="dashboard-content-area status-container">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const hasData = stats.totalRegistered > 0;

  return (
    <Box className="dashboard-content-area">
      <Box className="dashboard-inner-content">
        <Box className="dashboard-header">
          <Box>
            <Typography variant="h4" component="h1" className="welcome-header">Welcome back, {userInfo?.firstName} !</Typography>
            <Typography variant="subtitle1" className="welcome-subheader">Here's a summary of your inventory and activity.</Typography>
          </Box>
          <Box className="header-actions">
            <Button variant="contained" startIcon={<FaPlus />} onClick={() => navigate('/user/add-item')} className="header-button register-btn">
              Register Item
            </Button>
            <Button variant="outlined" startIcon={<FaSearch />} onClick={() => navigate('/user/found-items')} className="header-button found-btn">
              Report Found
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4} className="stats-grid">
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Items Registered" value={stats.totalRegistered} icon={<FaBox />} color="#0d6efd" delay="100ms" />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Reported Lost" value={stats.totalLost} icon={<FaExclamationTriangle />} color="#dc3545" delay="200ms" />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Items Found by You" value={stats.totalFound} icon={<FaSearch />} color="#fd7e14" delay="300ms" />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Successfully Returned" value={stats.totalReturned} icon={<FaCheckCircle />} color="#198754" delay="400ms" />
          </Grid>
        </Grid>

        {hasData ? (
          <Grid container spacing={4} className="charts-grid">
            <Grid item xs={12} lg={5}>
              <Paper className="chart-paper" elevation={0} variant="outlined" style={{ animationDelay: '500ms' }}>
                <Typography variant="h6" className="chart-title">Items by Category</Typography>
                <ResponsiveContainer width={500} height={380}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={130}
                      fill="#8884d8"
                      labelLine={false}
                      label={renderCustomizedLabel}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={7}>
              <Paper className="chart-paper" elevation={0} variant="outlined" style={{ animationDelay: '600ms' }}>
                <Typography variant="h6" className="chart-title">Overview by Status</Typography>
                <ResponsiveContainer width={500} height={380}>
                  <BarChart data={statusData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--clean-border-color)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--clean-text-secondary)' }} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: 'var(--clean-text-secondary)' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(32, 201, 151, 0.1)' }}
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid var(--clean-border-color)',
                        borderRadius: '12px',
                        boxShadow: 'var(--clean-shadow-md)'
                      }}
                    />
                    <Bar dataKey="count" name="Item Count" barSize={40} radius={[8, 8, 0, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_CHART_COLORS[index % BAR_CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Paper className="no-data-paper" elevation={0} variant="outlined">
            <FaBox className="no-data-icon" />
            <Typography variant="h6">Your dashboard is waiting for data</Typography>
            <Typography color="text.secondary">Register your first item or report a found one to see your stats here.</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

export default UserDashBoard;