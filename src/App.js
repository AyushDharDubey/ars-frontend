// App.js
import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import OAuthCallback from './pages/auth/OuathCallback';
import LogoutPage from './pages/auth/LogoutPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import AssignmentPage from './pages/AssignmentPage';
import TeamsPage from './pages/Team/TeamsPage';
import TeamChatPage from './pages/Team/TeamChatPage';
import ProfilePage from './pages/Profile/ProfilePage';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './store/userSlice';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const baseBackend = process.env.REACT_APP_BASE_BACKEND;
  const location = useLocation();
  const excludedPaths = ['/login', '/signup', '/logout', '/auth/oauth/channeli/callback'];
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const shouldExclude = excludedPaths.some(path => location.pathname.startsWith(path));

    if (!shouldExclude) {
      axios
        .get(baseBackend + `/auth/profile/`)
        .then(response => {
          dispatch(
            setUser({
              id: response.data.id,
              username: response.data.username,
              firstName: response.data.first_name,
              lastName: response.data.last_name,
              email: response.data.email,
              roles: response.data.roles,
            })
          );
        })
        .catch(err => {
          console.log("Error fetching user profile:", err);
          navigate('/login');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [location.pathname, dispatch, baseBackend]);


  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/oauth/channeli/callback" element={<OAuthCallback />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/logout" element={<LogoutPage />} />
        <Route
          path="/dashboard"
          element={user ? <DashboardPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/assignment/:assignmentId"
          element={user ? <AssignmentPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/teams"
          element={user ? <TeamsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/team/:teamId"
          element={user ? <TeamChatPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
