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
import ModeratorForgotPass from './Components/Moderator/ModeratorForgotPass';
import ModeratorResetPass from './Components/Moderator/ModeratorResetPass';
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
