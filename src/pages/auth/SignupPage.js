import { useState } from "react";
import axios from "axios";
import image from '../../assets/image.png';
import { useNavigate, Link } from 'react-router-dom';

export default function SignupPage() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!firstName || !lastName || !username || !email || !password) {
            setErrors({ non_field_errors: ["All fields are required."] });
            return;
        }

        try {
            const response = await axios.post(
                `${baseBackend}/auth/signup/`,
                { first_name: firstName, last_name: lastName, username, email, password, role },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            );

            localStorage.clear();
            localStorage.setItem("access_token", response.data.access_token);
            localStorage.setItem("refresh_token", response.data.refresh_token);
            axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.access}`;
            window.location.href = "/dashboard";
        } catch (err) {
            if (err.response?.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrors({ non_field_errors: ["An error occurred. Please try again."] });
            }
        }
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
                            <Link to='/login'
                                className={`py-2 px-4 text-lg font-semibold focus:outline-none text-gray-400`}
                            >
                                Login
                            </Link>
                            <Link
                                className={`py-2 px-4 text-lg font-semibold focus:outline-none border-b-4 border-orange-500 text-black`}
                            >
                                Signup
                            </Link>
                        </div>

                        <form className="flex flex-col space-y-4 text-gray-600" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-semibold">First Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your First Name"
                                    className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold">Last Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter your Last Name"
                                    className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold">Username</label>
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold">Email</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold">Password</label>
                                <input
                                    type="password"
                                    placeholder="Create a password"
                                    className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold" htmlFor="roleSelect">Role</label>
                                <select
                                    id="roleSelect"
                                    className="w-full p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="" disabled selected>Select a role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Reviewer">Reviewer</option>
                                    <option value="Reviewee">Reviewee</option>
                                </select>
                            </div>

                            {errors.non_field_errors && (
                                <div className="text-red-500 text-sm">
                                    {errors.non_field_errors.map((error, index) => (
                                        <p key={index}>{error}</p>
                                    ))}
                                </div>
                            )}
                            <button className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600">
                                Signup
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
