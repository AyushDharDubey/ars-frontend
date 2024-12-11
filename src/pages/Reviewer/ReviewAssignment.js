import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Box, Button, Modal, TextField, Select, MenuItem } from '@mui/material';


export default function CreateReviewModal({ open, onClose, submission, fetchData }) {
    const [comments, setComments] = useState("");
    const [status, setStatus] = useState("Pending");
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;

    useEffect(() => {
        if (submission) {
            setComments(submission.comments || "");
            setStatus(submission.status || "Pending");
        }
    }, [submission]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!submission) return;

        try {
            await axios.post(
                `${baseBackend}/reviewer/submission/${submission.id}/create_review/`,
                { comments, status },
                { headers: { 'Content-Type': 'application/json' } }
            );
            fetchData();
            onClose();
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    return (
        <Modal open={open} onClose={onClose} className="flex items-center justify-center">
            <Box className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Review Submission</h2>
                <form onSubmit={handleSubmit}>

                    <div className="mb-4">
                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            multiline
                            rows={4}
                        />
                    </div>
                    <div className="mb-4">
                        <Select
                            fullWidth
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            variant="outlined"
                        >
                            <MenuItem value="Changes Requested">Changes Requested</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>

                    </div>
                    <Box className="flex justify-end space-x-2">
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                        >
                            Submit Review
                        </button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
}
