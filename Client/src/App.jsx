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
import ViewUsers from './Components/Admin/ViewUsers';
import UserSideMenu from './Components/User/UserSideMenu';
import UserDashBoard from './Components/User/UserDashBoard';
import AddItems from './Components/User/AddItems';
import ViewItems from './Components/User/ViewItems';
import EditItem from './Components/User/EditItem';
import UserViewProfile from './Components/User/UserViewProfile';
import UserNav from './Components/User/UserNav';
import LostItem from './Components/User/LostItem';
import FoundItem from './Components/User/FoundItem';
import UserFounds from './Components/User/UserFounds';
import UserLostItems from './Components/User/UserLostItems';
import AdminViewAllLost from './Components/Admin/AdminViewAllLost';
import OrganaisationDashBoard from './Components/Organisation/OrganaisationDashBoard'
import OrganaisationSidemenu from './Components/Organisation/OrganaisationSidemenu';
import OrganaisationFounds from './Components/Organisation/OrganaisationFounds';
import OrganaisationFinds from './Components/Organisation/OrganaisationFinds';
import OrganisationEdit from './Components/Organisation/OrganaisationEdit';
import ModeratorDashBoard from './Components/Moderator/ModeratorDashBoard';
import ModeratorSidemenu from './Components/Moderator/ModeratorSidemenu';
import ModeratorLost from './Components/Moderator/ModeratorLost';
import ModeratorsFound from './Components/Moderator/ModeratorsFound';
import MatchReviewPage from './Components/User/MatchReviewPage';
import ManageClaim from './Components/Moderator/ManageClaim';
import UserHelpDesk from './Components/User/HelpDesk';
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
        
        <Route path="/moderator/Forgot-Password" element={[<LandingNav />, <ModeratorForgotPass />]} />
        <Route path="/moderator/reset-password/:token" element={[<ModeratorResetPass />]} />
       

      </Routes>
    </Router>
  );
}
export default App;
