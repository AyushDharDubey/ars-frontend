import { useSelector } from 'react-redux';
import { LeftSidebar, RightSidebar } from '../Sidebar';
import { useMediaQuery, Drawer, Box, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState, useEffect } from 'react';
import axios from "axios";


export default function ProfilePage() {
    const [assignments, setAssignments] = useState([]);
    const user = useSelector((state) => state.user);
    const [menuOpen, setMenuOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)');
    const toggleMenu = () => setMenuOpen((prev) => !prev);
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAssignments: 0,
        statusCount: {},
        totalSubtasks: 0,
        assignmentsWithFiles: 0,
        overdueAssignments: 0,
        dueSoonAssignments: 0,
    });


    const calculateStats = (assignments) => {
        const stats = {
            totalAssignments: assignments.length,
            statusCount: {},
            totalSubtasks: 0,
            assignmentsWithFiles: 0,
            overdueAssignments: 0,
            dueSoonAssignments: 0,
        }
        const now = new Date();

        assignments.forEach((assignment) => {
            stats.statusCount[assignment.status] = (stats.statusCount[assignment.status] || 0) + 1;

            stats.totalSubtasks += assignment.subtasks.length;

            if (assignment.files.length > 0) {
                stats.assignmentsWithFiles += 1;
            }

            const dueDate = new Date(assignment.due_date);
            if (dueDate < now) {
                stats.overdueAssignments += 1;
            } else if ((dueDate - now) / (1000 * 60 * 60 * 24) <= 7) {
                stats.dueSoonAssignments += 1;
            }
        });
        console.log(stats);
        return stats;
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

    useEffect(() => {
        setStats(calculateStats(assignments));
    }, [assignments]);

    return (
        <div className="h-screen flex bg-black text-white">
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
                        Profile Page
                    </h1>
                </div>
                <main className="p-6 min-h-full">
                    <Box className="bg-gray-800 p-4 rounded-md mb-4">
                        <Typography variant="h5" className="mb-2">
                            Welcome, {user?.name}
                        </Typography>
                        <Typography variant="body1">
                            Email: {user?.email}
                        </Typography>
                        <Typography variant="body1">
                            Roles: {user?.roles.join(", ")}
                        </Typography>
                    </Box>

                    {user?.roles.includes("Reviewee") && (
                        <Box className="bg-gray-800 p-4 rounded-md mb-4">
                            <Typography variant="h6" className="mb-4">Reviewee Stats</Typography>
                            <List>
                                <ListItem>
                                    <ListItemText
                                        primary="Total Assignments"
                                        secondary={stats.totalAssignments}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Overdue Assignments"
                                        secondary={stats.overdueAssignments}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Assignments Due Soon"
                                        secondary={stats.dueSoonAssignments}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Assignments with Files"
                                        secondary={stats.assignmentsWithFiles}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Total Subtasks"
                                        secondary={stats.totalSubtasks}
                                    />
                                </ListItem>
                            </List>
                        </Box>
                    )}

                    <Box className="bg-gray-800 p-4 rounded-md">
                        <Typography variant="h6" className="mb-4">Overall Status Count</Typography>
                        <List>
                            {Object.entries(stats.statusCount).map(([status, count]) => (
                                <ListItem key={status}>
                                    <ListItemText
                                        primary={status}
                                        secondary={count}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </main>

            </div>

            {isDesktop && <RightSidebar />}
        </div>
    );
}
