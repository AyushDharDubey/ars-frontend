import React, { useEffect, useState, useRef } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import { Box, Button, CircularProgress, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CreateUpdateReviewModal from "./ReviewAssignment";
import EditAssignmentModal from "./EditAssignment";


export default function ReviewerAssignmentPage({ isDesktop, toggleMenu }) {
    const { assignmentId } = useParams();
    const [assignment, setAssignment] = useState({subtasks: []});
    const [submissions, setSubmissions] = useState([]);
    const [isOpenReviewModal, setIsOpenReviewModal] = useState(false);
    const [isOpenEditAssignmentModal, setIsOpenEditAssignmentModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [filter, setFilter] = useState("");
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;
    const hasFetchedData = useRef(false);
    const [isLoading, setIsLoading] = useState(true);

    const openReviewModal = (submission) => {
        const existingReview = submission.reviews && submission.reviews.length > 0 ? submission.reviews[0] : null;
        setSelectedSubmission({ ...submission, existingReview });
        setIsOpenReviewModal(true);
    };

    const closeReviewModal = () => {
        setSelectedSubmission(null);
        setIsOpenReviewModal(false);
    };

    const openAssignmentModal = () => {
        setIsOpenEditAssignmentModal(true);
    };

    const closeAssignmentModal = () => {
        setSelectedSubmission(null);
        setIsOpenEditAssignmentModal(false);
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const assignmentResponse = await axios.get(`${baseBackend}/reviewer/assignment/${assignmentId}`);
            setAssignment(assignmentResponse.data);

            const submissionsResponse = await axios.get(`${baseBackend}/reviewer/assignment/${assignmentId}/submissions/`);
            setSubmissions(submissionsResponse.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!hasFetchedData.current) {
            hasFetchedData.current = true;
            fetchData();
        }
    }, []);

    // Filter submissions based on the filter input
    const filteredSubmissions = submissions.filter((submission) =>
        submission.description.toLowerCase().includes(filter.toLowerCase())
    );

    const filteredSubtasks = assignment?.subtasks.filter((subtask) =>
        subtask.title.toLowerCase().includes(filter.toLowerCase()) || subtask.description.toLowerCase().includes(filter.toLowerCase())
    );

    const statusClass = {
        'Approved': 'text-green-500',
        'Changes Suggested': 'text-yellow-500',
        'Rejected': 'text-red-500'
    };

    return (
        <div className="flex-1 overflow-auto">
            <Box className="flex bg-gray-900 justify-between items-center mb-6 p-4">
                <h1 className="text-2xl font-bold ">
                    {!isDesktop && (
                        <span className="pr-4">
                            <IconButton onClick={toggleMenu} color="inherit">
                                <MenuIcon />
                            </IconButton>
                        </span>
                    )}
                    Reviewer: Assignment {assignment?.title}
                </h1>
                {isDesktop && (
                    <input
                        type="text"
                        placeholder="Search Subtasks"
                        className="w-64 p-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                )}
            </Box>

            <main className="p-6 min-h-full">
                {isLoading ? (
                    <div className="flex justify-center">
                        <CircularProgress />
                    </div>
                ) : (
                    <AssignmentDetails assignment={assignment} openAssignmentModal={openAssignmentModal} />
                )}

                <Box className="bg-gray-800 shadow-md rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Subtasks</h2>
                    {filteredSubtasks?.length === 0 ? (
                        <p className="text-center text-lg text-gray-600">No subtasks found for this assignment.</p>
                    ) : (
                        filteredSubtasks.map((subtask) => (
                            <div key={subtask.id} className="p-4 bg-gray-800 rounded-lg transition-transform duration-200">
                                <h3 className="font-semibold text-lg">Title: {subtask.title}</h3>
                                <p>Description: {subtask.description}</p>
                            </div>
                        ))
                    )}
                </Box>

                <Box className="bg-gray-800 shadow-md rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Submissions</h2>
                    {filteredSubmissions.length === 0 ? (
                        <p className="text-center text-lg text-gray-600">No submissions found for this assignment.</p>
                    ) : (
                        filteredSubmissions.map((submission) => (
                            <div key={submission.id}>
                                <SubmissionReviewCard
                                    submission={submission}
                                    openReviewModal={() => openReviewModal(submission)}
                                    pending={submission.status !== 'Approved'}
                                    statusClass={statusClass}
                                />
                                <CreateUpdateReviewModal
                                    open={isOpenReviewModal}
                                    onClose={closeReviewModal}
                                    submission={selectedSubmission}
                                    fetchData={fetchData}
                                />
                            </div>
                        ))
                    )}
                </Box>
            </main>

            {assignment && (
                <EditAssignmentModal
                    open={isOpenEditAssignmentModal}
                    onClose={closeAssignmentModal}
                    fetchData={fetchData}
                    assignment={assignment}
                />
            )}
        </div>
    );
}

function AssignmentDetails({ assignment, openAssignmentModal }) {
    return (
        <Box className="bg-gray-800 shadow-md rounded-lg p-6 mb-6">
            <Box className="flex justify-between mb-4">
                <h2 className="text-xl font-bold">Assignment Details</h2>
                <Button variant="contained" color="primary" onClick={openAssignmentModal}>
                    Edit Assignment
                </Button>
            </Box>
            <p><strong>Description:</strong> {assignment.description}</p>
            <p><strong>Due Date:</strong> {new Date(assignment.due_date).toLocaleString()}</p>
            <p><strong>Created At:</strong> {new Date(assignment.created_at).toLocaleString()}</p>
            <p><strong>Assigned to:</strong> {assignment.assigned_to.join(", ")}</p>

            {assignment?.files?.length > 0 && (
                <Box className="mt-4">
                    <h4 className="font-semibold text-sm">Files:</h4>
                    {assignment.files.map((file) => (
                        <div key={file.id}>
                            <a
                                href={file.file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400"
                            >
                                {file.file.split("/").pop()}
                            </a>
                        </div>
                    ))}
                </Box>
            )}

            <Box className="flex mt-4 space-x-4">
                <Button variant="contained" color="warning">
                    Notify Assignees
                </Button>
            </Box>
        </Box>
    );
}

function SubmissionReviewCard({ submission, openReviewModal, pending, statusClass }) {
    return (
        <Box className="p-4 bg-gray-800 shadow-md rounded-lg transition-transform duration-200 hover:shadow-lg hover:-translate-y-1">
            <h3 className="font-semibold text-lg">Submitted by: {submission.submitted_by}</h3>
            <p>Description: {submission.description}</p>
            <p>Submitted on: {new Date(submission.created_at).toLocaleString()}</p>
            <p>Last Updated: {new Date(submission.updated_at).toLocaleString()}</p>
            <p className={`${statusClass[submission.status]}`}>Status: {submission.status}</p>

            {submission?.reviews && submission.reviews.length > 0 && (
                <div className="mt-4">
                    <h4 className="text-sm text-gray-400">Review:</h4>
                    {submission.reviews.map((review) => (
                        <div key={review.id} className="bg-gray-700 p-3 mt-2 rounded-lg">
                            <p className={`font-medium ${statusClass[submission.status]}`}>Status: {submission.status}</p>
                            <p>Comments: {review.comments}</p>
                            <p>Reviewed on: {new Date(review.created_at).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            )}

            {pending && (
                <div className="mt-4">
                    <Button variant="contained" color="primary" onClick={openReviewModal} className="m-4">
                        {submission.reviews?.length > 0 ? "Edit Review" : "Review Submission"}
                    </Button>
                </div>
            )}
        </Box>
    );
}
