import React from "react";
import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import AgencyManagement from "./components/Adjustments";
import { Outlet } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import AgencyList from "./components/AgencyList";
import HajjiList from "./components/HajjiList";
import PaymentAllocation from "./components/PaymentIAllocation";
import Adjustments from "./components/Adjustments";
import Reports from "./components/Reports";
import AgencyProfile from "./components/AgencyProfile";
import AddAgency from "./components/AddAgency";
import AddHajji from "./components/AddHajji";
import NotificationSounds from "./components/NotificationSounds";

//About page
const About = () => {
  return (
    <Layout>
      <>
        <div>
          <h1>
            This is Hajji Management System. About page content goes here.
          </h1>
        </div>
      </>
    </Layout>
  );
};

const Header = () => {
  return (
    <header>
      <nav className="nav">
        <NavLink to="/" className="nav-link">
          Agency Management
        </NavLink>

        <NavLink to="/dashboard" className="nav-link">
          Dashboard
        </NavLink>

        <NavLink to="/agency-list" className="nav-link">
          Agency
        </NavLink>
        <NavLink to="/hajji" className="nav-link">
          Hajji
        </NavLink>

        <NavLink to="/payment-allocation" className="nav-link">
          Payment Allocation
        </NavLink>

        <NavLink to="/adjustments" className="nav-link">
          Adjustments
        </NavLink>
        <NavLink to="/reports" className="nav-link">
          Reports
        </NavLink>
      </nav>
    </header>
  );
};

//Footer component

const Footer = () => {
  return (
    <footer className="footer">
      <h1>
        Mashum Air Travells <br />
        All Rights Reserved © 2025
      </h1>
    </footer>
  );
};

//Layout component
export const Layout = ({ children }) => {
  return (
    <div>
      <NotificationSounds />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

//App component
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/about" element={<About />} />
          {/* <Route path="/register" element={<Register />} /> */}
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/fogot-password" element={<ForgotPassword />} /> */}
          {/* <Route path="/make-nid" element={<MakeNid />} /> */}
          <Route path="/" element={<AgencyManagement />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agency-list" element={<AgencyList />} />
          <Route path="/agency/:id" element={<AgencyProfile />} />

          <Route path="/agencies/new" element={<AddAgency />} />
          <Route path="/agencies/:id/edit" element={<AddAgency />} />
          <Route path="/agencies/:id" element={<AgencyProfile />} />
          <Route path="/hajji" element={<HajjiList />} />
          <Route path="/hajji/:id" element={<AddHajji />} />

          <Route path="/hajji/new" element={<AddHajji />} />
          <Route path="/payment-allocation" element={<PaymentAllocation />} />

          <Route path="/reports" element={<Reports />} />
          <Route path="/adjustments" element={<Adjustments />} />
          <Route path="*" element={<h1>404 Page not found</h1>} />
        </Route>
      </Routes>
    </>
  );
};
export default App;
