import React, { useEffect, useState, useRef } from "react";
import { LeftSidebar, RightSidebar } from '../Sidebar';
import { useParams } from 'react-router-dom';
import axios from "axios";
import { Box, Button, CircularProgress, Modal, TextField, Select, MenuItem } from '@mui/material';
import CreateReviewModal from "./ReviewAssignment";
import EditAssignmentModal from "./EditAssignment";

export default function ReviewerAssignmentPage() {
    const { assignmentId } = useParams();
    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [isOpenReviewModal, setIsOpenReviewModal] = useState(false);
    const [isOpenEditAssignmentModal, setIsOpenEditAssignmentModal] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;
    const hasFetchedData = useRef(false);

    const openReviewModal = (submission) => {
        setSelectedSubmission(submission);
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
        try {
            const assignmentResponse = await axios.get(`${baseBackend}/reviewer/assignment/${assignmentId}`);
            setAssignment(assignmentResponse.data);

            const submissionsResponse = await axios.get(`${baseBackend}/reviewer/assignment/${assignmentId}/submissions/`);
            setSubmissions(submissionsResponse.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    useEffect(() => {
        if (!hasFetchedData.current) {
            hasFetchedData.current = true;
            fetchData();
        }
    }, []);

    return (
        <div className="h-screen flex bg-black text-white">
            <LeftSidebar />
            <div className="flex-1 overflow-auto">
                <Box className="flex bg-gray-900 justify-between items-center mb-6 p-4">
                    <h1 className="text-2xl font-bold">Reviewer: Assignment {assignment?.title}</h1>
                </Box>

                <main className="p-6 min-h-full">
                    {assignment ? (
                        <AssignmentDetails assignment={assignment} openAssignmentModal={openAssignmentModal} />
                    ) : (
                        <div className="flex justify-center">
                            <CircularProgress />
                        </div>
                    )}

                    <Box className="bg-gray-800 shadow-md rounded-lg p-6 mb-6">
                        <h2 className="text-2xl font-bold mb-4">Submissions</h2>
                        {submissions.length === 0 ? (
                            <p className="text-center text-lg text-gray-600">No submissions found for this assignment.</p>
                        ) : (
                            submissions.map((submission) => (
                                <>
                                    <SubmissionReviewCard
                                        key={submission.id}
                                        submission={submission}
                                        openReviewModal={() => openReviewModal(submission)}
                                        pending={(submissions.status!=='Approved')} />
                                    <CreateReviewModal
                                        open={isOpenReviewModal}
                                        onClose={closeReviewModal}
                                        submission={submission}
                                        fetchData={fetchData} />
                                </>
                            ))
                        )}
                    </Box>
                </main>


                {assignment ?
                    <EditAssignmentModal
                        open={isOpenEditAssignmentModal}
                        onClose={closeAssignmentModal}
                        fetchData={fetchData}
                        assignment={assignment} /> : ""}
            </div>
            <RightSidebar />
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

            <Box className="flex mt-4 space-x-4">
                <Button variant="contained" color="warning">
                    Notify Assignees
                </Button>
            </Box>
        </Box>
    );
}

function SubmissionReviewCard({ submission, openReviewModal, pending }) {
    return (
        <Box
            className="p-4 bg-gray-800 shadow-md rounded-lg transition-transform duration-200 hover:shadow-lg hover:-translate-y-1"
        >

            <h3 className="font-semibold text-lg">Submitted by: {submission.submitted_by}</h3>
            <p>Description: {submission.description}</p>
            <p>Submitted on: {new Date(submission.updated_at).toLocaleString()}</p>
            <div className="mt-4">
                {
                    pending ?
                        <Button variant="contained" color="primary" onClick={openReviewModal} className="m-4">
                            Review Submission
                        </Button>
                        :
                        ""
                }
            </div>
        </Box>
    );
}