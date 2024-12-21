import axios from "axios";
import { useParams } from 'react-router-dom';
import { useSelector } from "react-redux";
import { LeftSidebar, RightSidebar } from "../Sidebar";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Drawer,
  IconButton,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";

export default function TeamChatPage() {
  const { teamId } = useParams();
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.user);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const baseBackend = process.env.REACT_APP_BASE_BACKEND;
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const chatBoxRef = useRef(null);
  const ws = useRef(null);
  const access_token = localStorage.getItem("access_token")

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const sendMessage = () => {
    if (content.trim() !== "" && ws.current.readyState === WebSocket.OPEN) {
      const messagePayload = {
        type: "chat_message",
        username: user.username,
        content: content,
        timestamp: new Date().toISOString(),
      };
      ws.current.send(JSON.stringify(messagePayload));
      scrollToBottom();
      setContent("");
    }
  };

  const loadOlderMessages = async () => {
    if (!hasMore) return;

    const response = await axios.get(`${baseBackend}/api/teams/${teamId}/messages/?page=${currentPage + 1}`);
    setMessages((prev) => [...response.data.messages, ...prev]);
    setCurrentPage((prev) => prev + 1);
    setHasMore(response.data.has_next);
  };

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      requestAnimationFrame(() => {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight - chatBoxRef.current.clientHeight;
      });
    }
  };

  const fetchMessages = async () => {
    const response = await axios.get(`${baseBackend}/api/team/${teamId}/messages/?page=1`);
    setMessages(response.data.messages);
    setHasMore(response.data.has_next)
  };

  useEffect(() => {
    ws.current = new WebSocket(`${baseBackend}/ws/team/${teamId}/?access_token=${access_token}`);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "chat_message") {
        setMessages((prevMessages) => [...prevMessages, data]);
        scrollToBottom();
        console.log(data)
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
    };
    
    fetchMessages();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };

  }, [teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  return (
    <div className={`h-screen flex bg-black text-white`}>
      {isDesktop && <LeftSidebar />}

      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={toggleMenu}
        classes={{ paper: "bg-gray-900 text-white w-64" }}
      >
        <div className="h-full flex flex-col">
          <LeftSidebar toggleMenu={toggleMenu} />
        </div>
      </Drawer>

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
            Team Chat
          </h1>
        </div>
        <main className="p-6 max-h-full">
          <Box className="bg-gray-800 text-white p-6 rounded-lg shadow-md h-screen max-h-[80vh] mx-auto flex flex-col">
            <Box
              ref={chatBoxRef}
              className="flex-1 overflow-y-auto bg-gray-700 rounded-lg p-4 mb-4"
            >
              {loading ? (
                <CircularProgress color="inherit" />
              ) : (
                <List>
                  {messages.map((msg, index) => (
                    <ListItem
                      key={index}
                      className={`mb-2 ${msg.username === user.username ? "text-green-400" : "text-blue-300"
                        }`}
                    >
                      <ListItemText
                        primary={`${msg.username}: ${msg.content}`}
                        secondary={
                          <span className="text-sm text-gray-400">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            <Box className="flex gap-4">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                InputProps={{
                  style: {
                    backgroundColor: "#374151",
                    color: "#FFF",
                  },
                }}
              />
              <Button
                onClick={sendMessage}
                variant="contained"
                color="primary"
                className="bg-blue-600"
                disabled={ws.current && ws.current.readyState !== WebSocket.OPEN}
              >
                Send
              </Button>
            </Box>
          </Box>
        </main>
      </div>

      {isDesktop && <RightSidebar />}
    </div>
  );
}