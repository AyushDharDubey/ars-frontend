import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, CircularProgress, useMediaQuery, IconButton, Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { LeftSidebar, RightSidebar } from './Sidebar';
import { useSelector } from 'react-redux';
import CreateAssignmentModal from './Reviewer/CreateAssignment';


export default function DashboardPage() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;
    const user = useSelector((state) => state.user);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);
    const toggleMenu = () => setMenuOpen((prev) => !prev);

    const handleSubmitAssignment = async (formData) => {
        await axios.post(`${baseBackend}/reviewer/create_assignment/`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        }).then((response) => {
            setAssignments((prevAssignments) => [...prevAssignments, response.data]);
        });
    };

    useEffect(() => {
        if (user) {
            (async () => {
                try {
                    let allAssignments = [];

                    if (user?.roles?.includes('Reviewee')) {
                        const response = await axios.get(`${baseBackend}/reviewee/assignments/`);
                        allAssignments = [...allAssignments, ...response.data];
                    }

                    if (user?.roles?.includes('Reviewer')) {
                        const response = await axios.get(`${baseBackend}/reviewer/assignments/`);
                        allAssignments = [...allAssignments, ...response.data];
                    }

                    setAssignments(allAssignments);
                } catch (err) {
                    console.error('Error fetching assignments:', err);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [user, baseBackend]);

    return (
        <div className={`h-screen flex bg-black text-white ${modalOpen ? "backdrop-blur" : ""}`}>
            {isDesktop && <LeftSidebar />}

            <Drawer
                anchor="left"
                open={menuOpen}
                onClose={toggleMenu}
                classes={{ paper: "bg-gray-900 text-white w-64" }}
            >
                <div className="h-full flex flex-col">
                    <LeftSidebar toggleMenu={toggleMenu} />
                </div>
            </Drawer>

            <div className="flex-1 overflow-auto">
                <div className="flex bg-gray-900 justify-between items-center mb-6 p-4">
                    <h1 className="text-2xl font-bold ">
                        {!isDesktop && (
                            <span className="pr-4">
                                <IconButton onClick={toggleMenu} color="inherit">
                                    <MenuIcon />
                                </IconButton>
                            </span>
                        )}
                        Dashboard
                    </h1>
                    {
                        user?.roles?.includes('Reviewer') &&
                        <button
                            onClick={openModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                        >
                            Create Assignment
                        </button>
                    }
                </div>
                <main className="p-6 min-h-full">
                    {loading ? (
                        <div className="flex justify-center">
                            <CircularProgress />
                        </div>
                    ) : (
                        <>
                            {assignments.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {assignments.map((assignment) => (
                                        <Link to={`/assignment/${assignment.id}`} key={assignment.id}>
                                            <CardComponent
                                                title={assignment.title}
                                                description={assignment.description}
                                                status="To be implemented"
                                            />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <Typography>No assignments found</Typography>
                            )}
                        </>
                    )}
                </main>
            </div>

            {isDesktop && <RightSidebar />}

            {user?.roles?.includes('Reviewer') && (
                <CreateAssignmentModal
                    open={modalOpen}
                    onClose={closeModal}
                    onSubmit={handleSubmitAssignment}
                />
            )}
        </div>
    );
}

function CardComponent({ title, description, status, progress }) {
    return (
        <Card>
            <CardContent className="h-full bg-gray-800 p-6 shadow-md hover:bg-gray-700">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-gray-400">{description}</p>
                <div className="mt-2 text-sm text-gray-500">{status}</div>

                {progress && (
                    <div className="relative w-full h-2 bg-gray-700 rounded-lg mt-2">
                        <div
                            className="absolute top-0 left-0 h-2 bg-orange-500 rounded-lg"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
