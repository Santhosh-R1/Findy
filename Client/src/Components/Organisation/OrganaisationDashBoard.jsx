import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, Paper, CircularProgress, Alert, Button 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  FaClipboardList, FaCheckCircle, FaSearchPlus, FaHandshake, FaPlus 
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/OrganaisationDashBoard.css';

const StatCard = ({ title, value, icon, color }) => (
  <Paper className="org-stat-card" elevation={0}>
    <Box className="org-stat-icon-wrapper" sx={{ backgroundColor: color, boxShadow: `0 4px 10px ${color}66` }}>
      {icon}
    </Box>
    <Box className="org-stat-content">
      <Typography variant="h4" className="org-stat-value">{value}</Typography>
      <Typography variant="subtitle2" className="org-stat-title">{title}</Typography>
    </Box>
  </Paper>
);

function OrganaisationDashBoard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orgName, setOrgName] = useState('');
  
  const [stats, setStats] = useState({
    totalReported: 0,
    activeFound: 0,
    successfullyReturned: 0,
    activeMatches: 0
  });

  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storedInfo = localStorage.getItem('organisationInfo');
        if (!storedInfo) throw new Error("Please log in.");
        
        const parsed = JSON.parse(storedInfo);
        const orgId = parsed.data?._id || parsed._id;
        setOrgName(parsed.data?.organisationName || "Organization");

        const [itemsRes, matchesRes] = await Promise.all([
          axiosInstance.get(`/api/items/found/user/${orgId}`), 
          axiosInstance.get(`/api/items/my-matches/${orgId}`)
        ]);

        const myFoundItems = itemsRes.data.data || [];
        const myMatches = matchesRes.data.data || [];

        const total = myFoundItems.length;
        const returned = myFoundItems.filter(i => i.status === 'claimed' || i.status === 'returned').length;
        const active = myFoundItems.filter(i => i.status === 'found').length;
        
        const activeMatchCount = myMatches.filter(m => m.status !== 'resolved').length;

        setStats({
          totalReported: total,
          activeFound: active,
          successfullyReturned: returned,
          activeMatches: activeMatchCount
        });

        const catMap = {};
        myFoundItems.forEach(item => {
            const cat = item.mainCategory ? item.mainCategory.charAt(0).toUpperCase() + item.mainCategory.slice(1) : 'Other';
            catMap[cat] = (catMap[cat] || 0) + 1;
        });
        setCategoryData(Object.keys(catMap).map(k => ({ name: k, count: catMap[k] })));

        const statusMap = [
            { name: 'Active (Found)', value: active },
            { name: 'Returned/Claimed', value: returned },
            { name: 'Pending Review', value: myFoundItems.filter(i => i.status === 'pending_review').length } // If status exists on item
        ].filter(i => i.value > 0);
        setStatusData(statusMap);

      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

  if (loading) return <Box className="org-dash-loading"><CircularProgress /></Box>;
  if (error) return <Box className="org-dash-container"><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box className="org-dash-container">
      <Box className="org-dash-header">
        <Box>
          <Typography variant="h4" className="org-dash-title">Welcome, {orgName}</Typography>
          <Typography variant="subtitle1" className="org-dash-subtitle">Overview of items found and reported by your organization.</Typography>
        </Box>
        <Button 
            variant="contained" 
            startIcon={<FaPlus />} 
            className="org-header-btn"
            onClick={() => navigate('/organisation/founts')}
        >
            Report New Item
        </Button>
      </Box>

      <Grid container spacing={10} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Reported" value={stats.totalReported} icon={<FaClipboardList />} color="#3b82f6" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Currently Active" value={stats.activeFound} icon={<FaSearchPlus />} color="#f59e0b" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Successfully Returned" value={stats.successfullyReturned} icon={<FaCheckCircle />} color="#10b981" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Active Matches" value={stats.activeMatches} icon={<FaHandshake />} color="#8b5cf6" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        
        <Grid item xs={12} md={7}>
          <Paper className="org-chart-paper">
            <Typography variant="h6" className="org-chart-title">Found Items by Category</Typography>
            {categoryData.length > 0 ? (
                <ResponsiveContainer width={525} height={320}>
                <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E5F2" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A3AED0'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0'}} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
                </ResponsiveContainer>
            ) : (
                <Box className="org-no-data"><Typography>No data available yet.</Typography></Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper className="org-chart-paper">
            <Typography variant="h6" className="org-chart-title">Resolution Status</Typography>
            {statusData.length > 0 ? (
                <ResponsiveContainer width={525} height={320}>
                <PieChart>
                    <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    >
                    {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
                </ResponsiveContainer>
            ) : (
                <Box className="org-no-data"><Typography>No status data available.</Typography></Box>
            )}
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}

export default OrganaisationDashBoard;