import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Avatar, Box, Typography, Skeleton } from '@mui/material';
import {
    FaTachometerAlt,
    FaListUl,         // Correct icon for "My Found Items"
    FaBuilding,       // Kept for profile avatar fallback
    FaSignOutAlt,
    FaSearchPlus,
    FaSearch,         // Correct icon for "Lost Items"
    FaIdCard          // Correct icon for "View Profile"
} from 'react-icons/fa';
import axiosInstance from '../../api/baseUrl';
import '../../Styles/OrganisationSideMenu.css';

function OrganisationSidemenu() {
    const navigate = useNavigate();
    const [organisation, setOrganisation] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadOrganisationDataFromAPI = useCallback(async () => {
        setLoading(true);
        try {
            const storedOrganisationInfo = localStorage.getItem('organisationInfo');
            if (storedOrganisationInfo) {
                const parsedData = JSON.parse(storedOrganisationInfo);

                if (parsedData && parsedData.data && parsedData.data._id) {
                    const response = await axiosInstance.get(`/api/organaisation/get-by-id/${parsedData.data._id}`);
                    setOrganisation(response.data.data);
                } else {
                    console.error("Organisation ID not found in localStorage data.");
                    setOrganisation(null);
                }
            } else {
                setOrganisation(null);
            }
        } catch (error) {
            console.error("Failed to fetch organisation info from API", error);
            setOrganisation(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadOrganisationDataFromAPI();

        const handleProfileUpdate = () => {
            loadOrganisationDataFromAPI();
        };

        window.addEventListener('organisationProfileUpdated', handleProfileUpdate);

        return () => {
            window.removeEventListener('organisationProfileUpdated', handleProfileUpdate);
        };
    }, [loadOrganisationDataFromAPI]);

    const handleLogout = () => {
        localStorage.removeItem('organisationInfo');
        localStorage.removeItem('organisationToken');
        setOrganisation(null);
        navigate('/login/organisation');
    };

    const renderProfileSection = () => {
        if (loading) {
            return (
                <Box className="organisation-profile-section skeleton">
                    <Skeleton variant="circular" width={84} height={84} />
                    <Skeleton variant="text" sx={{ fontSize: '1.2rem', width: '80%', mt: 1 }} />
                </Box>
            );
        }
        if (organisation) {
            const logoUrl = organisation.organisationLogo
                ? `http://localhost:5001${organisation.organisationLogo.replace(/\\/g, '/')}`
                : '';
            return (
                <Link to="/organisation/profile" className="organisation-profile-link">
                    <Box className="organisation-profile-section">
                        <Avatar
                            alt={organisation.organisationName}
                            src={logoUrl}
                            sx={{ width: 84, height: 84, border: '3px solid var(--org-sidemenu-primary-color)' }}
                        >
                            {/* Fallback to building icon if no logo and no name */}
                            {organisation.organisationName ? organisation.organisationName.charAt(0).toUpperCase() : <FaBuilding />}
                        </Avatar>
                        <Typography variant="subtitle1" className="organisation-profile-name">
                            {organisation.organisationName}
                        </Typography>
                    </Box>
                </Link>
            );
        }
        return (
            <div className="organisation-sidemenu-header-placeholder">
                <h3>Organisation Portal</h3>
            </div>
        );
    };

    return (
        <aside className="organisation-sidemenu">
            {renderProfileSection()}
            <nav className="organisation-sidemenu-nav">
                <ul>
                    {/* --- ICONS CORRECTED BELOW --- */}
                    <li><NavLink to="/organisation/dashboard"><FaTachometerAlt className="organisation-sidemenu-icon" /><span>Dashboard</span></NavLink></li>
                    <li><NavLink to="/organisation/founts"><FaSearchPlus className="organisation-sidemenu-icon" /><span>Report Found Item</span></NavLink></li>
                    <li><NavLink to="/organisation/my-found-items"><FaListUl className="organisation-sidemenu-icon" /><span> My Found Items</span></NavLink></li>
                    <li><NavLink to="/organisation/lost-items-others"><FaSearch className="organisation-sidemenu-icon" /><span>Lost Items Network</span></NavLink></li>
                    <li><NavLink to="/organisation/profile"><FaIdCard className="organisation-sidemenu-icon" /><span>View Profile</span></NavLink></li>
                </ul>
            </nav>
            <div className="organisation-sidemenu-logout">
                <button onClick={handleLogout}>
                    <FaSignOutAlt className="organisation-sidemenu-icon" />
                    <span>Log Out</span>
                </button>
            </div>
        </aside>
    );
}

export default OrganisationSidemenu;