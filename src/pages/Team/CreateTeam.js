import {
    Modal,
    Box,
    TextField,
    Chip,
    Button,
    CircularProgress,
    Autocomplete,
  } from "@mui/material";
  import { useState, useEffect } from "react";
  import axios from "axios";
  
  export default function CreateTeamModal({ open, onClose, setTeams }) {
    const [teamName, setTeamName] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [allReviewees, setAllReviewees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const baseBackend = process.env.REACT_APP_BASE_BACKEND;
  
    useEffect(() => {
      if (open) {
        const fetchReviewees = async () => {
          try {
            const response = await axios.get(`${baseBackend}/api/list_reviewees/`);
            setAllReviewees(response.data);
          } catch (err) {
            console.error("Error fetching reviewees:", err);
          }
        };
  
        fetchReviewees();
      }
    }, [open, baseBackend]);
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
      setError(null);
  
      try {
        const response = await axios.post(`${baseBackend}/api/create_team/`, {
          name: teamName,
          members: selectedMembers.map((member) => member.id),
        });
        setTeams((prevTeams) => [...prevTeams, response.data]);
      } catch (error) {
        setError("Error creating team.");
        console.error("Error creating team:", error);
      } finally {
        setLoading(false);
      }
      onClose();
    };
  
    return (
      <Modal open={open} onClose={onClose} className="flex items-center justify-center">
        <Box className="bg-gray-800 text-white p-8 rounded-lg shadow-md max-w-2xl overflow-auto mx-auto min-w-[30vw] relative">
          <h1 className="text-2xl font-bold mb-6">Create Team</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <TextField
                fullWidth
                variant="outlined"
                label="Team Name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
              />
            </div>
  
            <div className="mb-4">
              <Autocomplete
                multiple
                options={allReviewees}
                getOptionLabel={(option) => option.username}
                value={selectedMembers}
                onChange={(event, newValue) => setSelectedMembers(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Add Members"
                    placeholder="Search for reviewees..."
                  />
                )}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      key={option.id}
                      label={option.username}
                      {...getTagProps({ index })}
                      className="bg-blue-600 text-white"
                    />
                  ))
                }
              />
            </div>
  
            {error && <div className="text-red-500 mb-4">{error}</div>}
  
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                className="bg-blue-600"
              >
                {loading ? <CircularProgress size={24} /> : "Create Team"}
              </Button>
            </div>
          </form>
        </Box>
      </Modal>
    );
  }
  