import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingNav from './Components/Common/LandingNav';
import LandingPage from './Components/Common/LandingPage';
import About from './Components/Common/About';
import Contact from './Components/Common/Contact';
import AdminLogin from './Components/Admin/AdminLogin';
import UserLogin from './Components/User/UserLogin';
import OrganisationLogin from './Components/Organisation/OrganisationLogin';
import ModeratorLogin from './Components/Moderator/ModeratorLogin';
import UserRegistration from './Components/User/UserRegistration';
import OrganisationRegistration from './Components/Organisation/OrganisationRegistration';
import OrganisationForgotPass from './Components/Organisation/OrganaisationForgotPass';
import UserForgotPass from './Components/User/ForgotPass';
import ResetPassword from './Components/User/ResetPassword';
import OrganisationResetPassword from './Components/Organisation/OrganisationResetPassword';
import AdminDashboard from './Components/Admin/AdminDashboard';
import AdminSidemenu from './Components/Admin/AdminSidemenu';
import AddModerators from './Components/Admin/AddModerarors';
import ModeratorForgotPass from './Components/Moderator/ModeratorForgotPass';
import ModeratorResetPass from './Components/Moderator/ModeratorResetPass';
import ManageModerators from './Components/Admin/ManageModerators';
import ManageOrganaisation from './Components/Admin/ManageOrganaisation';
function App() {
  return (
    <Router>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login/admin" element={[<LandingNav />, <AdminLogin />]} />
        <Route path="/login/user" element={[<LandingNav />, <UserLogin />]} />
        <Route path="/login/organisation" element={[<LandingNav />, <OrganisationLogin />]} />
        <Route path="/login/moderator" element={[<LandingNav />, <ModeratorLogin />]} />
        <Route path="/User/register" element={[<LandingNav />, <UserRegistration />]} />
        <Route path="/Organisation/register" element={[<LandingNav />, <OrganisationRegistration />]} />
        <Route path="/Organisation/Forgot-Password" element={[<LandingNav />, <OrganisationForgotPass />]} />
        <Route path="/User/Forgot-Password" element={[<LandingNav />, <UserForgotPass />]} />
        <Route path="/reset-password/:token" element={[<LandingNav />, <ResetPassword />]} />
        <Route path="/organisation/reset-password/:token" element={[<LandingNav/>,<OrganisationResetPassword />]} />
        <Route path="/admin/dashBoard" element={[<AdminSidemenu/>,<AdminDashboard />]} />
        <Route path="/admin/AddModerators" element={[<AdminSidemenu/>,<AddModerators />]} />
        <Route path="/moderator/Forgot-Password" element={[<LandingNav />, <ModeratorForgotPass />]} />
        <Route path="/moderator/reset-password/:token" element={[<LandingNav/>,<ModeratorResetPass />]} />
        <Route path="/admin/manage-moderators" element={[<AdminSidemenu/>,<ManageModerators />]} />
        <Route path="/admin/manage-organisation" element={[<AdminSidemenu/>,<ManageOrganaisation />]} />

      </Routes>
    </Router>
  );
}

export default App;