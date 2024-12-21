import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button, Modal, TextField, Select, MenuItem } from '@mui/material';

export default function CreateUpdateReviewModal({ open, onClose, submission, fetchData }) {
    const [comments, setComments] = useState("");
    const [status, setStatus] = useState("Pending");
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;

    useEffect(() => {
        if (submission && submission.reviews && submission.reviews.length > 0) {
            const existingReview = submission.reviews[0];
            setComments(existingReview.comments || "");
            setStatus(existingReview.status || "Pending");
        } else {
            setComments("");
            setStatus("Pending");
        }
    }, [submission]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!submission) return;

        try {
            const reviewData = { comments, status };

            if (submission.reviews && submission.reviews.length > 0) {
                const reviewId = submission.reviews[0].id;
                await axios.put(
                    `${baseBackend}/reviewer/submission/${submission.id}/reviews/${reviewId}/`,
                    reviewData,
                    { headers: { 'Content-Type': 'application/json' } }
                );
            } else {
                await axios.post(
                    `${baseBackend}/reviewer/submission/${submission.id}/create_review/`,
                    reviewData,
                    { headers: { 'Content-Type': 'application/json' } }
                );
            }

            fetchData();
            onClose();
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    return (
        <Modal open={open} onClose={onClose} className="flex items-center justify-center">
            <Box className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">{submission?.reviews?.length > 0 ? "Edit Review" : "Review Submission"}</h2>
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
                            <MenuItem value="Changes Suggested">Changes Suggested</MenuItem>
                            <MenuItem value="Approved">Approved</MenuItem>
                            <MenuItem value="Rejected">Rejected</MenuItem>
                        </Select>

                    </div>
                    <Box className="flex justify-end space-x-2">
                        <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
                        >
                            {submission?.reviews?.length > 0 ? "Save Changes" : "Submit Review"}
                        </button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
}
