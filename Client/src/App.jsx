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
import ModeratorProfile from './Components/Moderator/ModeratorProfile';
import OrganisationSidemenu from './Components/Organisation/OrganaisationSidemenu';
import OrganisationHelpDesk from './Components/Organisation/OrganisationHelpDesk';
import OrganisationNav from './Components/Organisation/OrganisationNav';
import ModeratorNav from './Components/Moderator/ModeratorNav';
import UserLayout from './Components/Layouts/UserLayout';
import AdminLayout from './Components/Layouts/AdminLayout';
import ModeratorLayout from './Components/Layouts/ModeratorLayout';
import OrganisationLayout from './Components/Layouts/OrganisationLayout';


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
        <Route path="/admin/dashBoard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/AddModerators" element={<AdminLayout><AddModerators /></AdminLayout>} />
        <Route path="/moderator/Forgot-Password" element={[<LandingNav />, <ModeratorForgotPass />]} />
        <Route path="/moderator/reset-password/:token" element={[<ModeratorResetPass />]} />
        <Route path="/admin/manage-moderators" element={<AdminLayout><ManageModerators /></AdminLayout>} />
        <Route path="/admin/manage-organisation" element={<AdminLayout><ManageOrganaisation /></AdminLayout>} />
        <Route path="/admin/view-users" element={<AdminLayout><ViewUsers /></AdminLayout>} />
        <Route path="/user/dashboard" element={<UserLayout><UserDashBoard /></UserLayout>} />
        <Route path="/user/add-item" element={<UserLayout><AddItems /></UserLayout>} />
        <Route path="/user/view-items" element={<UserLayout><ViewItems /></UserLayout>} />
        <Route path="/user/edit-item/:itemId" element={<UserLayout><EditItem /></UserLayout>} />
        <Route path="/user/profile" element={<UserLayout><UserViewProfile /></UserLayout>} />
        <Route path="/user/found-items" element={<UserLayout><FoundItem /></UserLayout>} />
        <Route path="/user/my-found-items" element={<UserLayout><UserFounds /></UserLayout>} />
        <Route path="/user/lost-items-others" element={<UserLayout><UserLostItems /></UserLayout>} />
        <Route path="/admin/view-all-lost" element={<AdminLayout><AdminViewAllLost /></AdminLayout>} />
        <Route path="/organisation/DashBoard" element={<OrganisationLayout><OrganaisationDashBoard /></OrganisationLayout>} />
        <Route path="/organisation/founts" element={<OrganisationLayout><OrganaisationFounds /></OrganisationLayout>} />
        <Route path="/organisation/my-found-items" element={<OrganisationLayout><OrganaisationFinds /></OrganisationLayout>} />
        <Route path="/organisation/lost-items-others" element={<OrganisationLayout><UserLostItems /></OrganisationLayout>} />
        <Route path="/organisation/profile" element={<OrganisationLayout><OrganisationEdit /></OrganisationLayout>} />
        <Route path="/moderator/DashBoard" element={<ModeratorLayout><ModeratorDashBoard /></ModeratorLayout>} />
        <Route path="/moderator/LostItems" element={<ModeratorLayout><ModeratorLost /></ModeratorLayout>} />
        <Route path="/moderator/FoundItems" element={<ModeratorLayout><ModeratorsFound /></ModeratorLayout>} />
        <Route path="/match-review" element={<UserLayout><MatchReviewPage /></UserLayout>} />
        <Route path="/moderator/manage-claims" element={<ModeratorLayout><ManageClaim /></ModeratorLayout>} />
        <Route path="/user/HelpDesk" element={<UserLayout><UserHelpDesk /></UserLayout>} />
        <Route path="/moderator/profile" element={<ModeratorLayout><ModeratorProfile /></ModeratorLayout>} />
        <Route path="/Organisation/Help-Desk" element={<OrganisationLayout><OrganisationHelpDesk /></OrganisationLayout>} />

      </Routes>
    </Router>
  );
}
export default App;