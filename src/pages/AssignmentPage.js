import { useSelector } from 'react-redux';
import RevieweeAssignmentPage from "./Reviewee/AssignmentPage";
import ReviewerAssignmentPage from "./Reviewer/AssignmentPage";
import { LeftSidebar, RightSidebar } from './Sidebar';
import { useMediaQuery, Drawer } from '@mui/material';
import { useState } from "react";



export default function AssignmentPage() {
    const user = useSelector((state) => state.user);
    const toggleMenu = () => setMenuOpen((prev) => !prev);
    const [menuOpen, setMenuOpen] = useState(false);
    const isDesktop = useMediaQuery('(min-width: 1024px)');

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

            {user?.roles?.includes('Reviewer') && <ReviewerAssignmentPage isDesktop={isDesktop} toggleMenu={toggleMenu} />}
            {user?.roles?.includes('Reviewee') && <RevieweeAssignmentPage isDesktop={isDesktop} toggleMenu={toggleMenu} />}            
            
            {isDesktop && <RightSidebar />}
        </div>
    );
}