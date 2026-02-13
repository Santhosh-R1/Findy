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
import UserSideMenu from './Components/User/UserSideMenu';
import UserDashBoard from './Components/User/UserDashBoard';
import AddItems from './Components/User/AddItems';
import UserViewProfile from './Components/User/UserViewProfile';
import UserNav from './Components/User/UserNav';
import UserLostItems from './Components/User/UserLostItems';
import OrganaisationDashBoard from './Components/Organisation/OrganaisationDashBoard'
import OrganaisationSidemenu from './Components/Organisation/OrganaisationSidemenu';
import OrganaisationFounds from './Components/Organisation/OrganaisationFounds';
import OrganaisationFinds from './Components/Organisation/OrganaisationFinds';
import OrganisationEdit from './Components/Organisation/OrganaisationEdit';
import ModeratorDashBoard from './Components/Moderator/ModeratorDashBoard';
import ModeratorSidemenu from './Components/Moderator/ModeratorSidemenu';
import ModeratorLost from './Components/Moderator/ModeratorLost';
import ModeratorsFound from './Components/Moderator/ModeratorsFound';
import ModeratorProfile from './Components/Moderator/ModeratorProfile';
import OrganaisationNav from './Components/Organisation/OrganisationNav';
import ModeratorNav from './Components/Moderator/ModeratorNav';


function App() {
  return (
    <Router>

      <Routes>
        <Route path="/" element={[<LandingNav />, <LandingPage />]} />
        <Route path="/about" element={[<LandingNav />, <About />]} />
        <Route path="/contact" element={[<LandingNav />, <Contact />]} />
        <Route path="/login/admin" element={[<LandingNav />, <AdminLogin />]} />
        <Route path="/login/user" element={[<LandingNav />, <UserLogin />]} />
        <Route path="/login/organisation" element={[<LandingNav />, <OrganisationLogin />]} />
        <Route path="/login/moderator" element={[<LandingNav />, <ModeratorLogin />]} />
        <Route path="/User/register" element={[<LandingNav />, <UserRegistration />]} />
        <Route path="/Organisation/register" element={[<LandingNav />, <OrganisationRegistration />]} />
        <Route path="/Organisation/Forgot-Password" element={[<LandingNav />, <OrganisationForgotPass />]} />
        <Route path="/User/Forgot-Password" element={[<LandingNav />, <UserForgotPass />]} />
        <Route path="/reset-password/:token" element={[<ResetPassword />]} />
        <Route path="/organisation/reset-password/:token" element={[<OrganisationResetPassword />]} />
        <Route path="/admin/dashBoard" element={[<AdminSidemenu />, <AdminDashboard />]} />
        <Route path="/admin/AddModerators" element={[<AdminSidemenu />, <AddModerators />]} />
        <Route path="/moderator/Forgot-Password" element={[<LandingNav />, <ModeratorForgotPass />]} />
        <Route path="/moderator/reset-password/:token" element={[<ModeratorResetPass />]} />
        <Route path="/user/dashboard" element={[<UserNav />, <UserSideMenu />, <UserDashBoard />]} />
        <Route path="/user/add-item" element={[<UserNav />, <UserSideMenu />, <AddItems />]} />
        <Route path="/user/profile" element={[<UserNav />, <UserSideMenu />, <UserViewProfile />]} />
        <Route path="/organisation/DashBoard" element={[<OrganaisationNav />, <OrganaisationSidemenu />, <OrganaisationDashBoard />]} />
        <Route path="/organisation/founts" element={[<OrganaisationNav />, <OrganaisationSidemenu />, <OrganaisationFounds />]} />
        <Route path="/organisation/my-found-items" element={[<OrganaisationNav />, <OrganaisationSidemenu />, <OrganaisationFinds />]} />
        <Route path="/organisation/lost-items-others" element={[<OrganaisationNav />, <OrganaisationSidemenu />, < UserLostItems />]} />
        <Route path="/organisation/profile" element={[<OrganaisationNav />, <OrganaisationSidemenu />, < OrganisationEdit />]} />
        <Route path="/moderator/DashBoard" element={[<ModeratorNav />, <ModeratorSidemenu />, < ModeratorDashBoard />]} />
        <Route path="/moderator/LostItems" element={[<ModeratorNav />, <ModeratorSidemenu />, < ModeratorLost />]} />
        <Route path="/moderator/FoundItems" element={[<ModeratorNav />, <ModeratorSidemenu />, < ModeratorsFound />]} />
        <Route path="/moderator/profile" element={[<ModeratorNav />, < ModeratorSidemenu />, < ModeratorProfile />]} />

      </Routes>
    </Router>
  );
}
export default App;
