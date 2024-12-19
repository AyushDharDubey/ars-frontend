import {
    CircularProgress,
    Modal,
    Box,
    TextField,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
    Button,
    IconButton,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { Add, Remove } from "@mui/icons-material";

export default function CreateAssignmentModal({ open, onClose, onSubmit }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [files, setFiles] = useState([]);
    const [allReviewees, setAllReviewees] = useState([]);
    const [allTeams, setAllTeams] = useState([]);
    const [reviewees, setReviewees] = useState([]);
    const [teams, setTeams] = useState([]);
    const [subtasks, setSubtasks] = useState([{ title: "", description: "" }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;

    const handleFileChange = (event) => {
        setFiles(event.target.files);
    };

    const handleSubtaskChange = (index, field, value) => {
        const updatedSubtasks = [...subtasks];
        updatedSubtasks[index][field] = value;
        setSubtasks(updatedSubtasks);
    };

    const addSubtask = () => {
        setSubtasks([...subtasks, { title: "", description: "" }]);
    };

    const removeSubtask = (index) => {
        const updatedSubtasks = subtasks.filter((_, i) => i !== index);
        setSubtasks(updatedSubtasks);
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
            Array.from(files).forEach((file) => {
                formData.append("files", file);
            });
            formData.append(
                "assigned_to",
                reviewees.map((reviewee) => reviewee.id)
            );
            formData.append(
                "assigned_to_team",
                teams.map((team) => team.id)
            );
            if (subtasks.length > 1) {
                subtasks.slice(0, -1).forEach((subtask) => {
                    formData.append("subtasks", JSON.stringify(subtask));
                });
            }
            // formData.append("subtasks", JSON.stringify(subtasks));

            await onSubmit(formData);
        } catch (err) {
            setError("Failed to create assignment. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            await axios.get(`${baseBackend}/reviewer/list_reviewees/`).then((response) => {
                setAllReviewees(response.data);
            });
            await axios.get(`${baseBackend}/reviewer/list_teams/`).then((response) => {
                setAllTeams(response.data);
            });
        })();
    }, []);

    return (
        <Modal open={open} onClose={onClose} className="flex items-center justify-center">
            <Box className="bg-gray-800 text-white p-8 rounded-lg shadow-md max-w-2xl overflow-auto mx-auto min-w-[70vh] relative">
                <h1 className="text-2xl font-bold mb-6">Create Assignment</h1>
                <form onSubmit={handleSubmit} className="max-h-[70vh]">
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
                        <label className="block text-sm font-medium text-gray-300 mb-1">Assign Teams</label>
                        <Select
                            multiple
                            fullWidth
                            value={teams}
                            onChange={(e) => setTeams(e.target.value)}
                            renderValue={(selected) => (
                                <div className="flex flex-wrap">
                                    {selected.map((team) => (
                                        <Chip key={team.id} label={team.name} className="m-1 bg-blue-600 text-white" />
                                    ))}
                                </div>
                            )}
                        >
                            {allTeams?.map((team) => (
                                <MenuItem key={team.id} value={team}>
                                    {team.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Subtasks</label>
                        {subtasks.map((subtask, index) => (
                            <div key={index} className="flex items-center mb-2 space-x-4">
                                <TextField
                                    label="Title"
                                    variant="outlined"
                                    value={subtask.title}
                                    onChange={(e) => handleSubtaskChange(index, "title", e.target.value)}
                                    fullWidth
                                />
                                <TextField
                                    label="Description"
                                    variant="outlined"
                                    value={subtask.description}
                                    onChange={(e) => handleSubtaskChange(index, "description", e.target.value)}
                                    fullWidth
                                />
                                <IconButton onClick={() => removeSubtask(index)} color="error">
                                    <Remove />
                                </IconButton>
                            </div>
                        ))}
                        <Button
                            onClick={addSubtask}
                            variant="contained"
                            color="primary"
                            startIcon={<Add />}
                            className="mt-2"
                        >
                            Add Subtask
                        </Button>
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
