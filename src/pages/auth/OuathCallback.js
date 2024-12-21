import axios from "axios";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CircularProgress } from '@mui/material';


export default function OAuthCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const baseBackend = process.env.REACT_APP_BASE_BACKEND;

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    const callback = async () => {
      await axios.get(`${baseBackend}/auth/oauth/channeli/callback/?code=${code}&state=${state}`, {
        headers: {
          "Content-Type": "application/json",
        },
      }).then(response => {
        if (response?.data?.access_token) {
          localStorage.clear();
          localStorage.setItem("access_token", response.data.access_token);
          localStorage.setItem("refresh_token", response.data.refresh_token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
          navigate('/dashboard');
        } else {
          console.log(response?.data?.access_token)
          console.error("Failed to obtain tokens:", response?.data);
        }
      }).catch(err => {
        if (err.response?.data.errors) {
          console.log(err.response.data.errors);
        } else {
          console.log({ non_field_errors: ["Error during OAuth callback."] });
        }
      });
    };


    if (code) {
      callback();
    }
  }, [navigate, dispatch]);

  return (
    <div className="flex justify-center items-center h-screen"><CircularProgress /></div>
  );
};
