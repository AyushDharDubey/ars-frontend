import { Link, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Button, Grid, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';

export function LeftSidebar({ toggleMenu }) {
    const user = useSelector((state) => state.user);

    const handleClick = () => {
        if (toggleMenu) toggleMenu();
    };

    return (
        <aside className="w-64 h-screen bg-gray-900 text-white flex flex-col flex-shrink-0">
            <div className="mb-8 p-6 flex flex-row justify-around">
                <div>
                    <h2 className="text-lg font-semibold">{user.username}</h2>
                    <p className="text-gray-400">{user.firstName}</p>
                </div>
            </div>

            <nav className="flex-1 overflow-auto p-6">
                <Link to="/dashboard" onClick={handleClick} className="block py-2 px-4 text-sm hover:bg-gray-700 rounded-lg">
                    Dashboard
                </Link>
                <Link to="/teams" onClick={handleClick} className="block py-2 px-4 text-sm hover:bg-gray-700 rounded-lg">
                    Teams
                </Link>
                <Link to="/profile" onClick={handleClick} className="block py-2 px-4 text-sm hover:bg-gray-700 rounded-lg">
                    Profile
                </Link>
                <Link to="#" onClick={handleClick} className="block py-2 px-4 text-sm hover:bg-gray-700 rounded-lg">
                    Submissions
                </Link>
            </nav>

            <div className="mt-auto">
                <Link to="/profile" onClick={handleClick} className="block py-2 px-4 text-sm hover:bg-gray-700 rounded-lg">
                    {user.username}
                </Link>
                <Link to="/logout" onClick={handleClick} className="block py-2 px-4 text-sm hover:bg-gray-700 rounded-lg">
                    Log Out {user.username}
                </Link>
            </div>
        </aside>
    );
}

LeftSidebar.defaultProps = {
    toggleMenu: null,
};


export function RightSidebar() {
    return (
        <aside className="w-80 h-screen bg-gray-900 p-6 text-white flex-shrink-0 overflow-auto">
            <div className="mb-6">
                <h3 className="text-lg font-semibold">Recent Submissions</h3>
                <Assignment title="Title" due_date="due date" status="pending" />
            </div>
        </aside>
    );
}


function Assignment({ title, due_date, status }) {
    return (
        <a href="#">
            <Card className='mt-4'>
                <CardContent className="bg-gray-800 rounded-lg shadow-md hover:bg-gray-700">
                    <p className="font-semibold">{title}</p>
                    <p className="text-gray-400 text-sm">{due_date}</p>
                    <p className="text-gray-500 text-sm">Status: {status}</p>
                </CardContent>
            </Card>
        </a>
    )
}