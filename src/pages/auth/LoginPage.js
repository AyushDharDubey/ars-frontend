import { useState } from "react";
import axios from "axios";
import image from '../../assets/image.png';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const baseBackend = process.env.REACT_APP_BASE_BACKEND;

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setErrors({ non_field_errors: ["Both username and password are required."] });
      return;
    }

    await axios.post(
      `${baseBackend}/auth/login/`,
      { username, password },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    ).then(response => {
      localStorage.clear();
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
      navigate('/dashboard');
    }).catch(err => {
      if (err.response?.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({ non_field_errors: ["An error occurred. Please try again."] });
      }
    });
  };

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="flex flex-row items-center">
        <div className="bg-orange-500 p-6 rounded-lg shadow-lg m-10 mt-20">
          <img className="w-64 h-auto" src={image} alt="Login" />
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-white text-4xl font-bold mb-2">ARS</h1>
          <div className="bg-white w-96 pb-1"></div>
          <p className="text-white text-lg mb-8">Streamline assignment reviews with ease!</p>

          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <div className="flex justify-between mb-6 border-b-2 border-gray-200">
              <Link className={`py-2 px-4 text-lg font-semibold focus:outline-none border-b-4 border-orange-500 text-black`}>
                Login
              </Link>
              <Link to='/signup'
                className={`py-2 px-4 text-lg font-semibold focus:outline-none text-gray-400`}>
                Signup
              </Link>
            </div>

            <form className="flex flex-col text-gray-600 space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block text-sm font-semibold">Username</label>
                <input
                  type="text"
                  placeholder="Enter your username or email"
                  className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-600">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className='error'>
                {errors.non_field_errors && errors.non_field_errors.map((message, index) => (
                  <p key={index} className="error-message text-red-500 text-sm">{message}</p>
                ))}
              </div>
              <button className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}