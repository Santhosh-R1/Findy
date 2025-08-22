import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaBoxOpen, 
  FaUserPlus, 
  FaUsersCog, 
  FaBuilding, 
  FaUsers, 
  FaSignOutAlt 
} from 'react-icons/fa';
import '../../Styles/AdminSidemenu.css';

function AdminSidemenu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login/admin');
  };

  return (
    <aside className="admin-sidemenu">
      <div className="admin-sidemenu-header">
        <h3>Findy Admin</h3>
      </div>
      <nav className="admin-sidemenu-nav">
        <ul>
          <li>
            <NavLink to="/admin/dashboard">
              <FaTachometerAlt className="admin-sidemenu-icon" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/lost-items">
              <FaBoxOpen className="admin-sidemenu-icon" />
              <span>View Lost Items</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/AddModerators">
              <FaUserPlus className="admin-sidemenu-icon" />
              <span>Add Moderator</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/manage-moderators">
              <FaUsersCog className="admin-sidemenu-icon" />
              <span>Manage Moderators</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/manage-organisation">
              <FaBuilding className="admin-sidemenu-icon" />
              <span>Manage Organisation</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/view-users">
              <FaUsers className="admin-sidemenu-icon" />
              <span>View Users</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      <div className="admin-sidemenu-logout">
        <button onClick={handleLogout}>
          <FaSignOutAlt className="admin-sidemenu-icon" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidemenu;