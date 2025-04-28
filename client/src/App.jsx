import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch, useLocation } from "wouter";
import { fetchCurrentUser } from "./features/Authentication/authSlice";

// Page Components
import Dashboard from "./pages/Dashboard";
import Login from "./features/Authentication/Login/Login";
import Register from "./features/Authentication/Register/Register";
import CustomerList from "./features/Customers/CustomerList/CustomerList";
import CustomerDetails from "./features/Customers/CustomerDetails/CustomerDetails";
import DealList from "./features/Sales/DealList/DealList";
import SalesDashboard from "./features/Sales/SalesDashboard/SalesDashboard";
import "./App.css";

/**
 * Main App Component
 * Handles routing and authentication state
 */
const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const [location, setLocation] = useLocation();
  
  // Fetch current user on app load
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && location !== "/login" && location !== "/register") {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, location, setLocation]);
  
  // Show loading screen while authentication state is being determined
  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="app">
      <Switch>
        {/* Public Routes */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        {/* Protected Routes */}
        <Route path="/" component={Dashboard} />
        <Route path="/customers" component={CustomerList} />
        <Route path="/customers/:id" component={CustomerDetails} />
        <Route path="/sales" component={SalesDashboard} />
        <Route path="/deals" component={DealList} />
        
        {/* 404 Route */}
        <Route>
          <div className="not-found-page">
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist.</p>
          </div>
        </Route>
      </Switch>
    </div>
  );
};

export default App;