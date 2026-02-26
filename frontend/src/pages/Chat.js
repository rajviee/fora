import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import io from 'socket.io-client';
import {
  Search,
  Plus,
  Send,
  Paperclip,
  Users,
  User,
  X,
  Image,
  File,
  MoreVertical
} from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [socket, setSocket] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Connect to WebSocket
  useEffect(() => {
    const token = localStorage.getItem('token');
    const backendUrl = process.env.REACT_APP_BACKEND_URL;
    
    const newSocket = io(backendUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Connected to chat server');
    });

    newSocket.on('newMessage', (message) => {
      if (message.room === selectedRoom?._id) {
        setMessages(prev => [...prev, message]);
      }
      // Update room's last message
      setRooms(prev => prev.map(room => 
        room._id === message.room 
          ? { ...room, lastMessage: message }
          : room
      ));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [selectedRoom?._id]);

  // Fetch rooms and employees
  useEffect(() => {
    fetchRooms();
    fetchEmployees();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const response = await api.get('/chat/rooms');
      const roomsList = response.data?.rooms || response.data || [];
      setRooms(Array.isArray(roomsList) ? roomsList : []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      const employeeList = response.data?.employees || response.data || [];
      setEmployees(Array.isArray(employeeList) ? employeeList : []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
      setEmployees([]);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      setMessages(response.data || []);
      // Join room
      socket?.emit('joinRoom', roomId);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setMessages([]);
    }
  };

  const selectRoom = (room) => {
    setSelectedRoom(room);
    fetchMessages(room._id);
  };

  const createDMRoom = async (participantId) => {
    try {
      const response = await api.post('/chat/rooms', {
        type: 'dm',
        participants: [participantId]
      });
      setShowNewChat(false);
      setRooms(prev => [response.data, ...prev]);
      selectRoom(response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create chat');
    }
  };

  const createGroupRoom = async (name, participantIds) => {
    try {
      const response = await api.post('/chat/rooms', {
        type: 'group',
        name,
        participants: participantIds
      });
      setShowNewChat(false);
      setRooms(prev => [response.data, ...prev]);
      selectRoom(response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create group');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;
    if (!selectedRoom) return;

    try {
      const formData = new FormData();
      formData.append('content', newMessage.trim());
      if (attachment) {
        formData.append('attachment', attachment);
      }

      const response = await api.post(
        `/chat/rooms/${selectedRoom._id}/messages`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Emit via socket for real-time
      socket?.emit('sendMessage', {
        roomId: selectedRoom._id,
        message: response.data
      });

      setNewMessage('');
      setAttachment(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
    }
  };

  const getRoomName = (room) => {
    if (room.type === 'group') return room.name;
    const otherParticipant = room.participants?.find(p => p._id !== user?._id);
    return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : 'Unknown';
  };

  const getRoomAvatar = (room) => {
    if (room.type === 'group') {
      return room.name?.charAt(0)?.toUpperCase() || 'G';
    }
    const otherParticipant = room.participants?.find(p => p._id !== user?._id);
    return otherParticipant 
      ? `${otherParticipant.firstName?.[0]}${otherParticipant.lastName?.[0]}`
      : '?';
  };

  const filteredRooms = rooms.filter(room => {
    const name = getRoomName(room);
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ 
      display: 'flex', 
      height: 'calc(100vh - 180px)',
      background: 'white',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: '320px', 
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '1rem', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontWeight: 600, fontSize: '1.125rem' }}>Messages</h2>
          <button
            onClick={() => setShowNewChat(true)}
            className="btn btn-primary"
            style={{ padding: '0.5rem' }}
            data-testid="new-chat-btn"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={18} 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} 
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ paddingLeft: '2.5rem' }}
              data-testid="search-chat-input"
            />
          </div>
        </div>

        {/* Room List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="spinner" />
            </div>
          ) : filteredRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <p>No conversations yet</p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '1rem' }}
                onClick={() => setShowNewChat(true)}
              >
                Start a chat
              </button>
            </div>
          ) : (
            filteredRooms.map(room => (
              <div
                key={room._id}
                onClick={() => selectRoom(room)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.875rem 1rem',
                  cursor: 'pointer',
                  background: selectedRoom?._id === room._id ? '#f0f7ff' : 'transparent',
                  borderLeft: selectedRoom?._id === room._id ? '3px solid #1360C6' : '3px solid transparent',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedRoom?._id !== room._id) {
                    e.currentTarget.style.background = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedRoom?._id !== room._id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
                data-testid={`chat-room-${room._id}`}
              >
                <div 
                  className="avatar avatar-md"
                  style={{ 
                    background: room.type === 'group' ? '#1360C6' : '#103362',
                    flexShrink: 0
                  }}
                >
                  {getRoomAvatar(room)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {getRoomName(room)}
                    </span>
                    {room.lastMessage && (
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {new Date(room.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {room.lastMessage && (
                    <p style={{
                      fontSize: '0.813rem',
                      color: '#6b7280',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {room.lastMessage.content || 'Attachment'}
                    </p>
                  )}
                </div>
                {room.type === 'group' && (
                  <Users size={14} color="#9ca3af" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!selectedRoom ? (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#6b7280'
          }}>
            <div style={{ textAlign: 'center' }}>
              <Users size={48} strokeWidth={1.5} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{ 
              padding: '1rem 1.25rem', 
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div 
                  className="avatar avatar-md"
                  style={{ 
                    background: selectedRoom.type === 'group' ? '#1360C6' : '#103362'
                  }}
                >
                  {getRoomAvatar(selectedRoom)}
                </div>
                <div>
                  <h3 style={{ fontWeight: 600 }}>{getRoomName(selectedRoom)}</h3>
                  {selectedRoom.type === 'group' && (
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {selectedRoom.participants?.length} members
                    </p>
                  )}
                </div>
              </div>
              <button className="btn btn-ghost" style={{ padding: '0.5rem' }}>
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '1rem',
              background: '#f9fafb'
            }}>
              {messages.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#6b7280',
                  padding: '2rem'
                }}>
                  <p>No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.sender?._id === user?._id;
                  return (
                    <div
                      key={message._id || index}
                      style={{
                        display: 'flex',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        marginBottom: '0.75rem'
                      }}
                    >
                      <div style={{
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: isOwn ? 'row-reverse' : 'row',
                        alignItems: 'flex-end',
                        gap: '0.5rem'
                      }}>
                        {!isOwn && (
                          <div 
                            className="avatar avatar-sm"
                            style={{ background: '#103362' }}
                          >
                            {message.sender?.firstName?.[0]}{message.sender?.lastName?.[0]}
                          </div>
                        )}
                        <div style={{
                          padding: '0.75rem 1rem',
                          borderRadius: isOwn ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                          background: isOwn ? '#1360C6' : 'white',
                          color: isOwn ? 'white' : '#374151',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                          {!isOwn && selectedRoom.type === 'group' && (
                            <p style={{ 
                              fontSize: '0.688rem', 
                              fontWeight: 500,
                              marginBottom: '0.25rem',
                              color: isOwn ? 'rgba(255,255,255,0.8)' : '#1360C6'
                            }}>
                              {message.sender?.firstName}
                            </p>
                          )}
                          {message.content && (
                            <p style={{ wordBreak: 'break-word' }}>{message.content}</p>
                          )}
                          {message.attachment && (
                            <div style={{ marginTop: message.content ? '0.5rem' : 0 }}>
                              {message.attachment.type?.startsWith('image/') ? (
                                <img 
                                  src={`${process.env.REACT_APP_BACKEND_URL}${message.attachment.url}`}
                                  alt="attachment"
                                  style={{ 
                                    maxWidth: '200px', 
                                    borderRadius: '0.5rem' 
                                  }}
                                />
                              ) : (
                                <a 
                                  href={`${process.env.REACT_APP_BACKEND_URL}${message.attachment.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: isOwn ? 'white' : '#1360C6'
                                  }}
                                >
                                  <File size={16} />
                                  {message.attachment.name}
                                </a>
                              )}
                            </div>
                          )}
                          <p style={{ 
                            fontSize: '0.625rem', 
                            marginTop: '0.375rem',
                            opacity: 0.7
                          }}>
                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ 
              padding: '1rem', 
              borderTop: '1px solid #e5e7eb',
              background: 'white'
            }}>
              {attachment && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  background: '#f3f4f6',
                  borderRadius: '0.375rem',
                  marginBottom: '0.75rem'
                }}>
                  <File size={16} />
                  <span style={{ flex: 1, fontSize: '0.875rem' }}>{attachment.name}</span>
                  <button 
                    type="button" 
                    onClick={() => setAttachment(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-ghost"
                  style={{ padding: '0.625rem' }}
                >
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input"
                  style={{ flex: 1 }}
                  data-testid="message-input"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() && !attachment}
                  className="btn btn-primary"
                  data-testid="send-message-btn"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <NewChatModal
          employees={employees.filter(e => e._id !== user?._id)}
          onClose={() => setShowNewChat(false)}
          onCreateDM={createDMRoom}
          onCreateGroup={createGroupRoom}
        />
      )}
    </div>
  );
};

const NewChatModal = ({ employees, onClose, onCreateDM, onCreateGroup }) => {
  const [activeTab, setActiveTab] = useState('dm');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [search, setSearch] = useState('');

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggleUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (activeTab === 'dm' && selectedUsers.length === 1) {
      onCreateDM(selectedUsers[0]);
    } else if (activeTab === 'group' && selectedUsers.length > 0 && groupName.trim()) {
      onCreateGroup(groupName.trim(), selectedUsers);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div style={{ 
          padding: '1rem 1.25rem', 
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontWeight: 600 }}>New Conversation</h3>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="tabs" style={{ padding: '0 1rem', borderBottom: '1px solid #e5e7eb' }}>
          <button 
            className={`tab ${activeTab === 'dm' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dm'); setSelectedUsers([]); }}
          >
            <User size={16} style={{ marginRight: '0.5rem' }} />
            Direct Message
          </button>
          <button 
            className={`tab ${activeTab === 'group' ? 'active' : ''}`}
            onClick={() => { setActiveTab('group'); setSelectedUsers([]); }}
          >
            <Users size={16} style={{ marginRight: '0.5rem' }} />
            Group
          </button>
        </div>

        <div style={{ padding: '1rem' }}>
          {activeTab === 'group' && (
            <div style={{ marginBottom: '1rem' }}>
              <label className="label">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="input"
                data-testid="group-name-input"
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label className="label">
              {activeTab === 'dm' ? 'Select User' : 'Select Members'}
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="input"
              style={{ marginBottom: '0.75rem' }}
            />
          </div>

          <div style={{ 
            maxHeight: '200px', 
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem'
          }}>
            {filteredEmployees.map(emp => (
              <div
                key={emp._id}
                onClick={() => {
                  if (activeTab === 'dm') {
                    setSelectedUsers([emp._id]);
                  } else {
                    toggleUser(emp._id);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  background: selectedUsers.includes(emp._id) ? '#f0f7ff' : 'transparent',
                  borderBottom: '1px solid #f3f4f6'
                }}
              >
                <div 
                  className="avatar avatar-sm"
                  style={{ background: '#103362' }}
                >
                  {emp.firstName?.[0]}{emp.lastName?.[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {emp.designation || emp.role}
                  </p>
                </div>
                {selectedUsers.includes(emp._id) && (
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#1360C6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ 
          padding: '1rem', 
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end'
        }}>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={
              (activeTab === 'dm' && selectedUsers.length !== 1) ||
              (activeTab === 'group' && (selectedUsers.length === 0 || !groupName.trim()))
            }
            className="btn btn-primary"
            data-testid="create-chat-btn"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
