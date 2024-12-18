import React, { useEffect, useRef, useState } from "react";
import { LeftSidebar, RightSidebar } from "../Sidebar";
import { useParams } from "react-router-dom";
import axios from "axios";
import { CircularProgress } from "@mui/material";

export default function RevieweeAssignmentPage() {
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
        <div className="h-screen flex bg-black text-white">
            <LeftSidebar />
            <div className="flex-1 overflow-auto">
                <div className="flex bg-gray-900 justify-between items-center mb-3 p-4">
                    <h1 className="text-2xl font-bold">Assignment: {assignment.title || "Loading..."}</h1>
                    <input
                        type="text"
                        placeholder="Search Subtasks"
                        className="w-64 p-2 border border-gray-600 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
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
                            <DownloadButton files={assignment.files} />
                            <SubmissionList assignmentId={assignmentId} submissions={submissions} setSubmissions={setSubmissions} />
                            <CreateSubmissionForm assignmentId={assignmentId} setSubmissions={setSubmissions} />
                        </>
                    )}
                </main>
            </div>
            <RightSidebar />
        </div>
    );
}

function AssignmentDetails({ assignment }) {
    return (
        <div className="bg-gray-800 shadow-md rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Assignment Details:</h3>
            <p className="mb-2"><strong>Title:</strong> {assignment.title}</p>
            <p className="mb-2"><strong>Description:</strong> {assignment.description}</p>
            <p className="mb-2"><strong>Due Date:</strong> {new Date(assignment.due_date).toLocaleString()}</p>
        </div>
    );
}

function SubtaskList({ subtasks, filter }) {
    const filteredSubtasks = subtasks.filter(subtask =>
        subtask.title.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="bg-gray-800 shadow-md rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Subtasks:</h3>
            {filteredSubtasks.length === 0 ? (
                <p className="text-center text-lg">No subtasks found.</p>
            ) : (
                <ul className="list-disc list-inside space-y-4 mt-4 mb-4 max-h-96 overflow-y-auto">
                    {filteredSubtasks.map((subtask) => (
                        <li key={subtask.id} className="p-4 shadow-md rounded-lg transition duration-200 hover:shadow-lg">
                            <h1 className="font-semibold text-lg">{subtask.title}</h1>
                            <p>{subtask.description}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function DownloadButton({ files }) {
    return (
        <div className="my-3">
            {files.length > 0 ? (
                files.map((file) => (
                    <div key={file.id} className="mb-2">
                        <a
                            href={file.file}
                            download
                            className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 rounded-lg text-sm px-5 py-2.5"
                        >
                            Download {file.file.split('/').pop()}
                        </a>
                    </div>
                ))
            ) : (
                <p className="text-center text-lg">No attachments available.</p>
            )}
        </div>
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
            Array.from(files).forEach(file => formData.append("attachments", file));

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

function SubmissionList({ assignmentId, submissions, setSubmissions }) {
    const [loading, setLoading] = useState(true);
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${baseBackend}/reviewee/assignment/${assignmentId}/submissions/`);
                setSubmissions(response.data);
                // response.data = [{"id":11,"files":[],"reviews":[{"id":6,"comments":"od agoai","status":"Rejected","created_at":"2024-12-18T05:23:52.486297Z","updated_at":"2024-12-18T05:23:52.486360Z","submission":11,"reviewer":13}],"is_group_submission":false,"description":"ljsdf","created_at":"2024-10-29T19:01:20.704459Z","updated_at":"2024-10-29T19:01:20.704497Z","assignment":12,"submitted_by":12}]
            } catch (error) {
                console.error("Error fetching submissions:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [assignmentId]);

    return (
        <div className="bg-gray-800 shadow-md rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mt-8 mb-4">Submissions:</h1>
            {loading ? (
                <div className="flex justify-center">
                    <CircularProgress />
                </div>
            ) : submissions.length === 0 ? (
                <p className="text-center text-lg">No submissions found for this assignment.</p>
            ) : (
                <ul className="list-none list-inside space-y-4 mt-4 max-h-96 overflow-y-auto">
                    {submissions.map((submission) => (
                        <li
                            key={submission.id}
                            className="p-4 bg-gray-800 shadow-md rounded-lg transition-transform duration-200 hover:shadow-lg hover:-translate-y-1"
                        >
                            <h1 className="font-semibold text-lg">Submitted by: {submission.submitted_by}</h1>
                            <p className="mt-2">Description: {submission.description}</p>
                            <p className="mt-2">Submitted on: {new Date(submission.updated_at).toLocaleString()}</p>
                            <p className="mt-2 font-semibold">Status: {submission.status}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
