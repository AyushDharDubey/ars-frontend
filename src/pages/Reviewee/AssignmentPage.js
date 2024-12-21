import React, { useEffect, useRef, useState } from "react";
import { LeftSidebar, RightSidebar } from "../Sidebar";
import { useParams } from "react-router-dom";
import axios from "axios";
import MenuIcon from '@mui/icons-material/Menu';
import { CircularProgress, IconButton, Box } from "@mui/material";

export default function RevieweeAssignmentPage({ isDesktop, toggleMenu }) {
    const { assignmentId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [assignment, setAssignment] = useState({ subtasks: [], files: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("");
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;

    useEffect(() => {
        const fetchAssignmentData = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`${baseBackend}/reviewee/assignment/${assignmentId}`);
                setAssignment(res.data);
            } catch (err) {
                setError("Failed to load assignment data.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignmentData();
    }, [assignmentId]);

    return (
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
            </div>

            <main className="p-6 min-h-full">
                {loading ? (
                    <div className="flex justify-center">
                        <CircularProgress />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : (
                    <>
                        <AssignmentDetails assignment={assignment} />
                        <SubtaskList subtasks={assignment.subtasks} filter={filter} />
                        <SubmissionList assignmentId={assignmentId} submissions={submissions} setSubmissions={setSubmissions} filter={filter} />
                        <CreateSubmissionForm assignmentId={assignmentId} setSubmissions={setSubmissions} />
                    </>
                )}
            </main>
        </div>
    );
}

function AssignmentDetails({ assignment }) {
    return (
        <div className="bg-gray-800 shadow-md rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Assignment Details:</h3>
            <p className="mb-2"><strong>Title:</strong> {assignment.title}</p>
            <p><strong>Description:</strong> {assignment.description}</p>
            <p><strong>Due Date:</strong> {new Date(assignment.due_date).toLocaleString()}</p>
            <p><strong>Created At:</strong> {new Date(assignment.created_at).toLocaleString()}</p>
            {assignment.assigned_to && assignment.assigned_to.length > 0 ? (
                <p>
                    <strong>Assigned to individuals (id): </strong>
                    <span>{assignment.assigned_to.join(", ")}</span>
                </p>
            ) : (
                <span>No individuals assigned</span>
            )}
            {assignment.assigned_to_teams && assignment.assigned_to_teams.length > 0 ? (
                <p>
                    <strong>Assigned teams (id): </strong>
                    <span>{assignment.assigned_to_teams.join(", ")}</span>
                </p>
            ) : (
                <span>No teams assigned</span>
            )}


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
        </div>
    );
}

function SubtaskList({ subtasks, filter }) {
    const filteredSubtasks = subtasks.filter(subtask =>
        subtask.title.toLowerCase().includes(filter.toLowerCase())
    );

    return (
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
    );
}

function CreateSubmissionForm({ assignmentId, setSubmissions }) {
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const filesRef = useRef(null);
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("description", description);
            Array.from(files).forEach(file => formData.append("files", file));

            await axios.post(
                `${baseBackend}/reviewee/assignment/${assignmentId}/submit/`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            ).then((response) => {
                setSubmissions((prevSubmissions) => [...prevSubmissions, response.data]);
            });
            setDescription("");
            setFiles([]);
            if (filesRef.current) filesRef.current.value = "";
        } catch (error) {
            console.error("Error uploading files:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Create Submission</h2>
            <div className="mb-4">
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-1">Upload Files</label>
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={(e) => setFiles(e.target.files)}
                    ref={filesRef}
                    className="block w-full text-sm text-gray-300 bg-gray-700 border border-gray-600 rounded-lg p-2"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full h-32 p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300"
                    placeholder="Write a brief description..."
                />
            </div>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg">
                {loading ? "Submitting..." : "Submit"}
            </button>
        </form>
    );
}

function SubmissionList({ assignmentId, submissions, setSubmissions, filter }) {
    const [loading, setLoading] = useState(true);
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;

    const filteredSubmissions = submissions.filter((submission) =>
        submission.description.toLowerCase().includes(filter.toLowerCase())
    );

    const statusClass = {
        'Approved': 'text-green-500',
        'Changes Suggested': 'text-yellow-500',
        'Rejected': 'text-red-500'
    };

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${baseBackend}/reviewee/assignment/${assignmentId}/submissions/`);
                setSubmissions(response.data);
            } catch (error) {
                console.error("Error fetching submissions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [assignmentId]);

    return (
        <Box className="bg-gray-800 shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Submissions</h2>
            {loading ? (
                <div className="flex justify-center">
                    <CircularProgress />
                </div>
            ) : submissions.length === 0 ? (
                <p className="text-center text-lg">No submissions found for this assignment.</p>
            ) : (
                filteredSubmissions.map((submission) => (
                    <div key={submission.id}>
                        <SubmissionReviewCard
                            submission={submission}
                            statusClass={statusClass}
                        />
                    </div>
                ))
            )}
        </Box>
    );
}

function SubmissionReviewCard({ submission, statusClass }) {
    return (
        <Box className="p-4 bg-gray-800 shadow-md rounded-lg transition-transform duration-200 hover:shadow-lg hover:-translate-y-1">
            <Box className="flex justify-between">
                <Box>
                    <h3 className="font-semibold text-lg">Submitted by: {submission.submitted_by.username}</h3>
                    <p>Description: {submission.description}</p>
                    <p>Submitted on: {new Date(submission.created_at).toLocaleString()}</p>
                    <p>Last Updated: {new Date(submission.updated_at).toLocaleString()}</p>
                    <p className={`${statusClass[submission.status]}`}>Status: {submission.status}</p>
                </Box>
                {submission?.files?.length > 0 && (
                    <Box className="mr-4">
                        <h4 className="font-semibold text-sm">Files:</h4>
                        {submission.files.map((file) => (
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

            </Box>

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
        </Box>
    );
}
