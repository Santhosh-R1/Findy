import React, { useState, useEffect } from 'react';
import { 
  Box, Grid, Typography, Paper, CircularProgress, Alert 
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { 
  FaUsers, FaBuilding, FaBoxOpen, FaSearch, FaCheckDouble, FaClipboardList 
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/ModeratorDashboard.css';

const StatCard = ({ title, value, icon, color }) => (
  <Paper className="mod-stat-card" elevation={0}>
    <Box className="mod-stat-icon-box" sx={{ backgroundColor: color, boxShadow: `0 4px 10px ${color}66` }}>
      {icon}
    </Box>
    <Box className="mod-stat-content">
      <Typography variant="subtitle2" component="h4">{title}</Typography>
      <Typography variant="h4" component="h2">{value}</Typography>
    </Box>
  </Paper>
);

function ModeratorDashBoard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [counts, setCounts] = useState({
    users: 0,
    orgs: 0,
    allItems: 0,
    lostItems: 0,
    foundItems: 0,
    matches: 0
  });

  const [categoryData, setCategoryData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [matchStatusData, setMatchStatusData] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        const [
          usersRes, 
          orgsRes, 
          allItemsRes, 
          lostRes, 
          foundRes, 
          matchesRes
        ] = await Promise.all([
          axiosInstance.get('/api/users/'),
          axiosInstance.get('/api/organaisation'),
          axiosInstance.get('/api/items/allItems'),
          axiosInstance.get('/api/items/status/lost'),
          axiosInstance.get('/api/items/status/found'),
          axiosInstance.get('/api/items/matches/all') 
        ]);

        const userCount = usersRes.data?.data?.length || 0;
        const orgCount = orgsRes.data?.data?.length || 0;
        const allItemsList = allItemsRes.data?.data || []; 
        const matchList = matchesRes.data?.data || [];

        const validRegisteredItems = allItemsList.filter(item => !item.finder);

        setCounts({
          users: userCount,
          orgs: orgCount,
          allItems: validRegisteredItems.length, 
          lostItems: lostRes.data?.data?.length || 0,
          foundItems: foundRes.data?.data?.length || 0,
          matches: matchList.length
        });

        const catMap = {};
        allItemsList.forEach(item => {
          const cat = item.mainCategory ? item.mainCategory.charAt(0).toUpperCase() + item.mainCategory.slice(1) : 'Uncategorized';
          catMap[cat] = (catMap[cat] || 0) + 1;
        });
        const processedCatData = Object.keys(catMap).map(key => ({ name: key, count: catMap[key] }));
        setCategoryData(processedCatData);
        const statusMap = { 'Lost': 0, 'Claimed': 0, 'Registered': 0 };
        
        validRegisteredItems.forEach(item => {
            const s = item.status.toLowerCase();
            
            if (s === 'claimed' || s === 'finded' || s === 'resolved') {
                statusMap['Claimed']++;
            } 
            else if (s === 'lost') {
                statusMap['Lost']++;
            } 
            else {
                statusMap['Registered']++;
            }
        });

        const processedStatusData = Object.keys(statusMap)
            .map(key => ({ name: key, value: statusMap[key] }))
            .filter(item => item.value > 0);
        setStatusData(processedStatusData);

        const matchMap = {};
        matchList.forEach(m => {
            const status = m.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); 
            matchMap[status] = (matchMap[status] || 0) + 1;
        });
        const processedMatchData = Object.keys(matchMap).map(key => ({ name: key, count: matchMap[key] }));
        setMatchStatusData(processedMatchData);

      } catch (err) {
        console.error("Dashboard Data Fetch Error:", err);
        setError("Failed to load dashboard analytics.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const COLORS = ['#4318FF', '#05CD99', '#EFF4FB', '#FF5757', '#FFAF10'];
  const BAR_COLORS = ['#4318FF', '#868CFF', '#05CD99', '#FFB547'];

  if (loading) return (
    <Box className="mod-dashboard-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box className="mod-dashboard-container">
        <Alert severity="error">{error}</Alert>
    </Box>
  );

  return (
    <Box className="mod-dashboard-container">
      <Box className="mod-dashboard-header">
        <Typography variant="h4" className="mod-dashboard-title">Moderator Overview</Typography>
        <Typography variant="subtitle1" className="mod-dashboard-subtitle">
            Real-time insights into platform activity and item resolution.
        </Typography>
      </Box>

      <Grid container spacing={2} mb={4}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Total Users" value={counts.users} icon={<FaUsers />} color="#4318FF" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Organizations" value={counts.orgs} icon={<FaBuilding />} color="#6AD2FF" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Total Items" value={counts.allItems} icon={<FaClipboardList />} color="#FFB547" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Lost Reports" value={counts.lostItems} icon={<FaBoxOpen />} color="#FF5757" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Found Reports" value={counts.foundItems} icon={<FaSearch />} color="#05CD99" />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard title="Matches Generated" value={counts.matches} icon={<FaCheckDouble />} color="#868CFF" />
        </Grid>
      </Grid>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} lg={8}>
          <Paper className="mod-chart-paper">
            <Typography variant="h6" className="mod-chart-title">Items by Category (All)</Typography>
            <ResponsiveContainer width={525} height={450}>                 
              <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E5F2" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A3AED0'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0'}} />
                <RechartsTooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#4318FF" radius={[10, 10, 0, 0]} barSize={50}>
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper className="mod-chart-paper">
            <Typography variant="h6" className="mod-chart-title">Status Distribution (Registered)</Typography>
            <ResponsiveContainer width={525} height={450}>                 
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className="mod-chart-paper">
            <Typography variant="h6" className="mod-chart-title">Match & Resolution Status (Wave Analysis)</Typography>
            <ResponsiveContainer width={1120} height={400}>                 
                <AreaChart data={matchStatusData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4318FF" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4318FF" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#A3AED0'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#A3AED0'}} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E5F2" />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Area 
                        type="natural" 
                        dataKey="count" 
                        stroke="#4318FF" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorWave)" 
                    />
                </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ModeratorDashBoard;