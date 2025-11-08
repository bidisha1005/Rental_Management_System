
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import Owner from "./components/Owner";
import Property from "./components/Property";
import Room from "./components/Room";
import Tenant from "./components/Tenant";
import Staff from "./components/Staff";
import Payment from "./components/Payment";
import TenantDashboard from "./components/TenantDashboard";
import OwnerDashboard from "./components/Owner";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/Owner" element={<Owner />} />
        <Route path="/Property" element={<Property />} />
        <Route path="/Room" element={<Room />} />
        <Route path="/Tenant" element={<Tenant />} />
        <Route path="/Staff" element={<Staff />} />
        <Route path="/Payment" element={<Payment />} />
        <Route path="/tenant/:tenantID" element={<TenantDashboard />} />
        <Route path="/owner/:ownerID" element={<OwnerDashboard />} />
      </Routes>
    </Router>
  );
}

// New code with only Owner dashboard
// import React from "react";
// import Owner from "./components/Owner";
// import "./App.css";

// export default function App() {
//   return (
//     <div className="App">
//       <Owner />
//     </div>
//   );
// }
