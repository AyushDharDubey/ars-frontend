import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { LeftSidebar, RightSidebar } from "../Sidebar";
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    useMediaQuery,
    Drawer,
    IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import CreateTeamModal from "./CreateTeam";

export default function TeamsPage() {
    const [loading, setLoading] = useState(true);
    const user = useSelector((state) => state.user);
    const [modalOpen, setModalOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [teams, setTeams] = useState([]);
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;
    const isDesktop = useMediaQuery("(min-width: 1024px)");

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);
    const toggleMenu = () => setMenuOpen((prev) => !prev);

    useEffect(() => {
        if (user) {
            (async () => {
                try {
                    const response = await axios.get(`${baseBackend}/api/list_teams/`);
                    setTeams(response.data);
                } catch (error) {
                    console.error("Error fetching teams:", error);
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
                        Teams
                    </h1>
                    {user?.roles?.includes("Admin") && (
                        <button
                            onClick={openModal}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                        >
                            Create Team
                        </button>
                    )}
                </div>
                <main className="p-6 min-h-full">
                    {loading ? (
                        <div className="flex justify-center">
                            <CircularProgress />
                        </div>
                    ) : (
                        <>
                            {teams.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {teams.map((team) => (
                                        <Link to={`/team/${team.id}`} key={team.id}>
                                            <CardComponent
                                                name={team.name}
                                                members={team.members}
                                            />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <Typography>No teams found</Typography>
                            )}
                        </>
                    )}
                </main>
            </div>

            {isDesktop && <RightSidebar />}

            {user?.roles?.includes("Reviewee") && (
                <CreateTeamModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    setTeams={setTeams}
                    />

            )}
        </div>
    );
}

function CardComponent({ name, members }) {
    return (
        <Card>
            <CardContent className="h-full bg-gray-800 p-6 shadow-md hover:bg-gray-700">
                <h3 className="text-lg font-semibold">{name}</h3>
                {members && members.length > 0 && (
                    <p className="text-sm text-gray-400">{members.join(", ")}</p>
                )}
            </CardContent>
        </Card>
    );
}
