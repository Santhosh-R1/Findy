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
        <Route path="/admin/dashBoard" element={[<AdminSidemenu />, <AdminDashboard />]} />
        <Route path="/admin/AddModerators" element={[<AdminSidemenu />, <AddModerators />]} />
        <Route path="/moderator/Forgot-Password" element={[<LandingNav />, <ModeratorForgotPass />]} />
        <Route path="/moderator/reset-password/:token" element={[<ModeratorResetPass />]} />
        <Route path="/admin/manage-moderators" element={[<AdminSidemenu />, <ManageModerators />]} />
        <Route path="/admin/manage-organisation" element={[<AdminSidemenu />, <ManageOrganaisation />]} />
        <Route path="/admin/view-users" element={[<AdminSidemenu />, <ViewUsers />]} />
        <Route path="/user/dashboard" element={[<UserNav />, <UserSideMenu />, <UserDashBoard />]} />
        <Route path="/user/add-item" element={[<UserNav />, <UserSideMenu />, <AddItems />]} />
        <Route path="/user/view-items" element={[<UserNav />, <UserSideMenu />, <ViewItems />]} />
        <Route path="/user/edit-item/:itemId" element={[<UserNav />, <UserSideMenu />, <EditItem />]} />
        <Route path="/user/profile" element={[<UserNav />, <UserSideMenu />, <UserViewProfile />]} />
        {/* <Route path="/user/lost-items" element={[<UserNav/>,<UserSideMenu/>,<LostItem />]} /> */}
        <Route path="/user/found-items" element={[<UserNav />, <UserSideMenu />, <FoundItem />]} />
        <Route path="/user/my-found-items" element={[<UserNav />, <UserSideMenu />, <UserFounds />]} />
        <Route path="/user/lost-items-others" element={[<UserNav />, <UserSideMenu />, <UserLostItems />]} />
        <Route path="/admin/view-all-lost" element={[<AdminSidemenu />, <AdminViewAllLost />]} />
        <Route path="/organisation/DashBoard" element={[<OrganaisationSidemenu />, <OrganaisationDashBoard />]} />
        <Route path="/organisation/founts" element={[<OrganaisationSidemenu />, <OrganaisationFounds />]} />
        <Route path="/organisation/my-found-items" element={[<OrganaisationSidemenu />, <OrganaisationFinds />]} />
        <Route path="/organisation/lost-items-others" element={[<OrganaisationSidemenu />, < UserLostItems />]} />
        <Route path="/organisation/profile" element={[<OrganaisationSidemenu />, < OrganisationEdit />]} />
        <Route path="/moderator/DashBoard" element={[<ModeratorSidemenu />, < ModeratorDashBoard />]} />
        <Route path="/moderator/LostItems" element={[<ModeratorSidemenu />, < ModeratorLost />]} />
        <Route path="/moderator/FoundItems" element={[<ModeratorSidemenu />, < ModeratorsFound />]} />
        <Route path="/match-review" element={<MatchReviewPage />} />
                <Route path="/moderator/manage-claims" element={[<ModeratorSidemenu />, < ManageClaim />]} />
                <Route path="/user/HelpDesk" element={[<UserSideMenu />, < UserHelpDesk />]} />

      </Routes>
    </Router>
  );
}
export default App;
