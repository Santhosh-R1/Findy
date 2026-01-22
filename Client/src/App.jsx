import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingNav from './Components/Common/LandingNav';
import LandingPage from './Components/Common/LandingPage';
import About from './Components/Common/About';
import Contact from './Components/Common/Contact';
import AdminLogin from './Components/Admin/AdminLogin';



function App() {
  return (
    <Router>

      <Routes>
        <Route path="/" element={[<LandingNav />, <LandingPage />]} />
        <Route path="/about" element={[<LandingNav />, <About />]} />
        <Route path="/contact" element={[<LandingNav />, <Contact />]} />
        <Route path="/login/admin" element={[<LandingNav />, <AdminLogin />]} />
       
      </Routes>
    </Router>
  );
}
export default App;
