import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, Filter, User, Building2, BookOpen, Clock, CheckCircle, AlertCircle, FileText, Bell } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/AdminLayout';

export default function AdminChat() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all'); // all, unread, my-projects
  const [searchQuery, setSearchQuery] = useState('');

  const queryClient = useQueryClient();

  // Fetch all projects with messages
  const { data: projects = [], isLoading, refetch } = useQuery({
    queryKey: ['adminPortalChats'],
    queryFn: async () => {
      const response = await platform.functions.invoke('clientPortalData', {
        action: 'list_projects_with_messages',
      });
      return response.data.projects || [];
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Send message mutation with optimistic updates
  const sendMessageMutation = useMutation({
    mutationFn: async ({ project_id, contact_id, msg }) => {
      const response = await platform.functions.invoke('portalMessages', {
        action: 'send',
        project_id,
        contact_id,
        message: msg,
        sender_type: 'admin',
      });
      return response.data;
    },
    onMutate: async ({ project_id, contact_id, msg }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['portalMessages', project_id]);
      
      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['portalMessages', project_id]);
      
      // Optimistically add the message
      if (previousMessages) {
        const newMessage = {
          message: msg,
          sender_type: 'admin',
          sender_name: 'Admin',
          created_date: new Date().toISOString(),
          is_read: false,
          attachments: []
        };
        queryClient.setQueryData(['portalMessages', project_id], [...previousMessages, newMessage]);
      }
      
      return { previousMessages };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPortalChats']);
      if (selectedProject) {
        queryClient.invalidateQueries(['portalMessages', selectedProject.id]);
      }
      setMessage('');
    },
    onError: (err, variables, context) => {
      // Rollback to previous messages on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['portalMessages', selectedProject?.id], context.previousMessages);
      }
      toast.error('Failed to send message');
    },
  });

  // Mark messages as read when selecting a project
  useEffect(() => {
    if (selectedProject) {
      platform.functions.invoke('clientPortalData', {
        action: 'mark_messages_read',
        project_id: selectedProject.id,
      }).catch(console.error);
    }
  }, [selectedProject]);

  // Filter projects
  const filteredProjects = projects.filter(project => {
    if (filter === 'unread' && !project.has_unread) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        project.book_title?.toLowerCase().includes(query) ||
        project.contact_name?.toLowerCase().includes(query) ||
        project.contact_company?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleSend = () => {
    if (!message.trim() || !selectedProject) return;
    sendMessageMutation.mutate({
      project_id: selectedProject.id,
      contact_id: selectedProject.contact_id,
      msg: message.trim(),
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AdminLayout>
    <div className="flex h-[calc(100vh-12rem)] gap-0 overflow-hidden rounded-2xl" style={{ background: '#e5ddd5' }}>
      {/* Projects List - Chat Sidebar */}
      <div className="w-96 flex flex-col border-r" style={{ background: '#ffffff', borderColor: '#d1d7db' }}>
        {/* Sidebar Header */}
        <div className="p-4 border-b flex items-center gap-3" style={{ background: '#f0f2f5', borderColor: '#d1d7db' }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a884] to-[#008f6f] flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900">Chats</h2>
            <p className="text-xs text-gray-600">{filteredProjects.length} conversations</p>
          </div>
          <div className="relative">
            <button className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {filteredProjects.filter(p => p.unread_count > 0).length > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-[#00a884] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {filteredProjects.filter(p => p.unread_count > 0).length}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="p-3 border-b" style={{ borderColor: '#d1d7db' }}>
          <Input
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            style={{ 
              background: '#f0f2f5',
              border: 'none',
              borderRadius: '8px'
            }}
          />
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No chats found</p>
            </div>
          ) : (
            <div>
              {filteredProjects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full p-3 text-left hover:bg-[#f5f6f6] transition-colors border-b ${
                    selectedProject?.id === project.id ? 'bg-[#f0f2f5]' : ''
                  }`}
                  style={{ borderColor: '#f0f2f5' }}
                >
                  <div className="flex items-start gap-3">
                    {project.profile_photo_url ? (
                      <img 
                        src={project.profile_photo_url} 
                        alt={project.contact_name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00a884] to-[#008f6f] flex items-center justify-center text-white font-bold flex-shrink-0">
                        {project.contact_name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-900 truncate">{project.contact_name}</p>
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {project.last_message_time ? new Date(project.last_message_time).toLocaleString('en-ZA', { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          }) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {project.last_message}
                        </p>
                        {project.unread_count > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-[#00a884] text-white text-xs font-bold rounded-full min-w-[20px] text-center flex-shrink-0">
                            {project.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{project.book_title}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col" style={{ background: '#efe7dd' }}>
        {selectedProject ? (
          <>
            {/* Chat Header */}
            <div className="p-3 border-b flex items-center gap-3" style={{ background: '#f0f2f5', borderColor: '#d1d7db' }}>
              {selectedProject.profile_photo_url ? (
                <img 
                  src={selectedProject.profile_photo_url} 
                  alt={selectedProject.contact_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00a884] to-[#008f6f] flex items-center justify-center text-white font-bold">
                  {selectedProject.contact_name?.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{selectedProject.contact_name}</h3>
                <p className="text-xs text-gray-600">{selectedProject.book_title}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedProject.unread_count > 0 && (
                  <span className="px-2 py-1 bg-[#00a884] text-white text-xs font-bold rounded-full">
                    {selectedProject.unread_count} new
                  </span>
                )}
                <Badge variant="outline" className="text-xs" style={{ background: '#00a884', color: 'white', border: 'none' }}>
                  {selectedProject.stage}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ChatMessages project={selectedProject} selectedProject={selectedProject} />

            {/* Message Input */}
            <div className="p-3 flex items-center gap-3" style={{ background: '#f0f2f5' }}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#00a884]/50"
                style={{ background: '#ffffff' }}
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="w-12 h-12 rounded-full p-0 flex items-center justify-center"
                style={{ 
                  background: message.trim() ? '#00a884' : '#d1d7db',
                  opacity: message.trim() ? 1 : 0.5
                }}
              >
                {sendMessageMutation.isPending ? (
                  <Clock className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <Send className="w-6 h-6 text-white" />
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500" style={{ background: '#e5ddd5' }}>
            <div className="text-center max-w-md p-8">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/50 flex items-center justify-center">
                <MessageSquare className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Welcome to Client Chats</h2>
              <p className="text-gray-600">Select a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}

function ChatMessages({ project, selectedProject }) {
  const messagesEndRef = React.useRef(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['portalMessages', project.id],
    queryFn: async () => {
      const response = await platform.functions.invoke('portalMessages', {
        action: 'list',
        project_id: project.id,
      });
      return response.data.messages || [];
    },
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  });

  // Mark messages as read when viewing
  useEffect(() => {
    if (messages.length > 0) {
      const unreadClientMessages = messages.filter(m => !m.is_read && m.sender_type === 'client');
      if (unreadClientMessages.length > 0) {
        Promise.all(unreadClientMessages.map(m => 
          platform.asServiceRole.entities.PortalMessage.update(m.id, { is_read: true })
        )).then(() => {
          queryClient.invalidateQueries(['adminPortalChats']);
        }).catch(console.error);
      }
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4" style={{ 
      background: '#e5ddd5',
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4c5b5' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
    }}>
      {isLoading ? (
        <div className="text-center text-sm text-gray-500 py-8">Loading messages...</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/50 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-700">No messages yet</p>
          <p className="text-sm text-gray-600 mt-2">Start the conversation</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg, idx) => {
            const isAdmin = msg.sender_type === 'admin';
            const showAvatar = idx === 0 || messages[idx - 1]?.sender_type !== msg.sender_type;
            return (
              <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} mb-1`}>
                <div className={`flex items-end gap-2 max-w-[70%] ${isAdmin ? 'flex-row-reverse' : ''}`}>
                  {!isAdmin && showAvatar && selectedProject.profile_photo_url && (
                    <img 
                      src={selectedProject.profile_photo_url} 
                      alt={msg.sender_name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mb-1"
                    />
                  )}
                  {!isAdmin && !showAvatar && <div className="w-8 flex-shrink-0" />}
                  <div className={`rounded-lg p-2 px-3 shadow-sm ${
                    isAdmin 
                      ? 'bg-[#d9fdd3]' 
                      : 'bg-white'
                  }`} style={{
                    borderTopRightRadius: isAdmin ? '0' : '8px',
                    borderTopLeftRadius: isAdmin ? '8px' : '0'
                  }}>
                    {msg.message && (
                      <p className="text-sm text-gray-800 mb-1 whitespace-pre-wrap">{msg.message}</p>
                    )}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {msg.attachments.map((att, attIdx) => (
                          <a
                            key={attIdx}
                            href={att.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/50 hover:bg-white/80 transition-colors border border-gray-200"
                          >
                            <div className="w-10 h-10 rounded-lg bg-[#00a884]/10 flex items-center justify-center">
                              <FileIcon className="w-5 h-5 text-[#00a884]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate text-gray-900">
                                {att.file_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Click to view
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[10px] text-gray-500">
                        {new Date(msg.created_date).toLocaleTimeString('en-ZA', { 
                          hour: '2-digit', 
                          minute: '2-digit'
                        })}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px]">
                          {msg.is_read ? (
                            <svg className="w-4 h-4 text-[#00a884]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

function FileIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}