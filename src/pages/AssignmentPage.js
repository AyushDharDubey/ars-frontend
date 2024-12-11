import { useSelector } from 'react-redux';
import RevieweeAssignmentPage from "./Reviewee/AssignmentPage";
import ReviewerAssignmentPage from "./Reviewer/AssignmentPage";

export default function AssignmentPage() {
    const user = useSelector((state) => state.user);

    if (user.roles.includes('Reviewer')) return <ReviewerAssignmentPage />
    else if (user.roles.includes('Reviewee')) return (<RevieweeAssignmentPage />);
}