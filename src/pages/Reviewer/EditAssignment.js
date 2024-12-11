import { CircularProgress, Modal, Box, TextField, Select, MenuItem, Chip, OutlinedInput } from '@mui/material';
import { useEffect, useState } from "react";
import axios from "axios";

export default function EditAssignmentModal({ open, onClose, onSubmit, assignment }) {
    const [title, setTitle] = useState(assignment.title);
    const [description, setDescription] = useState(assignment.description);
    const [dueDate, setDueDate] = useState(assignment.due_date);
    const [subtasks, setSubtasks] = useState(assignment.subtasks);
    const [subtaskTitle, setSubtaskTitle] = useState("");
    const [subtaskDescription, setSubtaskDescription] = useState("");
    const [files, setFiles] = useState(assignment.files);
    const [allReviewees, setAllReviewees] = useState([]);
    const [reviewees, setReviewees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;

    const handleAddSubtask = () => {
        if (subtaskTitle && subtaskDescription) {
            setSubtasks([...subtasks, { title: subtaskTitle, description: subtaskDescription }]);
            setSubtaskTitle("");
            setSubtaskDescription("");
        }
    };

    const handleFileChange = (event) => {
        setFiles(event.target.files);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("due_date", dueDate);
            subtasks.forEach((subtask, index) => {
                formData.append(`subtasks[${index}][title]`, subtask.title);
                formData.append(`subtasks[${index}][description]`, subtask.description);
            });
            Array.from(files).forEach((file) => {
                formData.append("files", file);
            });
            formData.append("assigned_to", reviewees.map(_ => _.id));
            formData.append("assigned_to_team", []);

            await onSubmit(formData);
            onClose();
        } catch (err) {
            setError("Failed to create assignment. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            await axios.get(`${baseBackend}/reviewer/list_reviewees/`)
                .then((response) => {
                    const fetchedReviewees = response.data;
                    setAllReviewees(fetchedReviewees);
                    
                    const previouslyAssignedReviewees = fetchedReviewees.filter((reviewee) =>
                        assignment?.assigned_to?.includes(reviewee?.id)
                    );
                    setReviewees((prevReviewees) => [...prevReviewees, ...previouslyAssignedReviewees]);
                });
        })();
    }, []);

    return (
        <Modal open={open} onClose={onClose} className="flex items-center justify-center">
            <Box className="bg-gray-800 text-white p-8 rounded-lg shadow-md max-w-2xl overflow-auto mx-auto relative">
                <h1 className="text-2xl font-bold mb-6">Edit Assignment</h1>
                <form onSubmit={handleSubmit} className='max-h-[70vh]'>

                    <div className="mb-4">
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={4}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                        <TextField
                            type="datetime-local"
                            fullWidth
                            variant="outlined"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Assign Reviewees</label>
                        <Select
                            multiple
                            fullWidth
                            value={reviewees}
                            onChange={(e) => setReviewees(e.target.value)}
                            renderValue={(selected) => (
                                <div className="flex flex-wrap">
                                    {selected.map((reviewee) => (
                                        <Chip key={reviewee.id} label={reviewee.username} className="m-1 bg-blue-600 text-white" />
                                    ))}
                                </div>
                            )}
                        >
                            {allReviewees?.map((reviewee) => (
                                <MenuItem key={reviewee.id} value={reviewee}>
                                    {reviewee.username}
                                </MenuItem>
                            ))}
                        </Select>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-lg font-bold mb-2">Subtasks</h2>
                        <div className="flex space-x-4">
                            <input
                                type="text"
                                placeholder="Subtask Title"
                                value={subtaskTitle}
                                onChange={(e) => setSubtaskTitle(e.target.value)}
                                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg"
                            />
                            <input
                                type="text"
                                placeholder="Subtask Description"
                                value={subtaskDescription}
                                onChange={(e) => setSubtaskDescription(e.target.value)}
                                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={handleAddSubtask}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                            >
                                Add
                            </button>
                        </div>
                        <ul className="list-disc list-inside mt-4 space-y-2">
                            {subtasks.map((subtask, index) => (
                                <li key={index} className="p-2 bg-gray-700 rounded-lg">
                                    <strong>{subtask.title}</strong>: {subtask.description}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Attachments</label>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg"
                        />
                    </div>

                    {error && <div className="text-red-500 mb-4">{error}</div>}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                        >
                            {loading ? <CircularProgress size={24} /> : "Create Assignment"}
                        </button>
                    </div>
                </form>
            </Box>
        </Modal>
    );
}
