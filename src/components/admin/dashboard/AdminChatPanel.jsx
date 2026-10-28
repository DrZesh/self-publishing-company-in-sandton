import React, { useState, useEffect, useRef } from 'react';
import { platform } from '@/api/platformClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, Paperclip, Image, File as FileIcon, Upload, X, Trash2, 
  MessageSquare, Users, Search, Filter
} from 'lucide-react';

export default function AdminChatPanel() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Fetch all projects with messages using direct entity access (admin only)
  const { data: projects = [] } = useQuery({
    queryKey: ['adminChatProjects'],
    queryFn: async () => {
      // Get all portal messages grouped by project
      const [messages, projectList, contacts] = await Promise.all([
        platform.entities.PortalMessage.list('-created_date', 200),
        platform.entities.Project.list('-updated_date', 100),
        platform.entities.Contact.list('-created_date', 100),
      ]);

      const contactMap = {};
      contacts.forEach(c => { contactMap[c.id] = c; });

      const projectMap = {};
      projectList.forEach(p => { projectMap[p.id] = p; });

      // Group messages by project_id
      const grouped = {};
      messages.forEach(msg => {
        if (!msg.project_id) return;
        if (!grouped[msg.project_id]) {
          grouped[msg.project_id] = { messages: [], unread: 0 };
        }
        grouped[msg.project_id].messages.push(msg);
        if (!msg.is_read && msg.sender_type === 'client') {
          grouped[msg.project_id].unread++;
        }
      });

      return Object.entries(grouped).map(([projectId, data]) => {
        const project = projectMap[projectId] || {};
        const contact = contactMap[project.contact_id] || {};
        const lastMsg = data.messages[0];
        return {
          id: projectId,
          book_title: project.book_title || 'Unknown Project',
          contact_id: project.contact_id,
          contact_name: contact.full_name || 'Unknown Client',
          profile_photo_url: contact.profile_photo_url,
          unread_count: data.unread,
          last_message: lastMsg?.message || '',
        };
      }).sort((a, b) => b.unread_count - a.unread_count);
    },
    refetchInterval: 10000,
  });

  // Mark messages as read when selecting a project
  useEffect(() => {
    if (selectedProject) {
      // Mark all unread client messages as read using entity SDK
      platform.entities.PortalMessage.filter({ project_id: selectedProject.id, is_read: false, sender_type: 'client' }, '-created_date', 50)
        .then(unreadMsgs => {
          unreadMsgs.forEach(msg => {
            platform.entities.PortalMessage.update(msg.id, { is_read: true }).catch(() => {});
          });
        }).catch(() => {});
    }
  }, [selectedProject?.id]);

  // Filter projects by search
  const filteredProjects = projects.filter(p => 
    p.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch messages for selected project
  const { data: messages = [] } = useQuery({
    queryKey: ['adminProjectMessages', selectedProject?.id],
    queryFn: async () => {
      if (!selectedProject?.id) return [];
      const response = await platform.functions.invoke('portalMessages', {
        action: 'list',
        project_id: selectedProject.id,
      });
      return response.data.messages || [];
    },
    enabled: !!selectedProject?.id,
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const response = await platform.integrations.Core.UploadFile({ file: file });
      return response.file_url;
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ msg, fileUrl, fileName }) => {
      const response = await platform.functions.invoke('portalMessages', {
        action: 'send',
        project_id: selectedProject.id,
        contact_id: selectedProject.contact_id,
        message: msg,
        sender_type: 'admin',
        attachments: fileUrl ? [{ file_url: fileUrl, file_name: fileName }] : undefined,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['adminProjectMessages', selectedProject?.id]);
      queryClient.invalidateQueries(['adminChatProjects']);
      setMessage('');
      setSelectedFile(null);
      setFilePreview(null);
      toast.success('Message sent');
    },
    onError: (error) => {
      toast.error('Failed to send message');
    },
  });



  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if (!message.trim() && !selectedFile) {
      toast.error('Please enter a message or select a file');
      return;
    }

    if (selectedFile) {
      uploadFileMutation.mutate(selectedFile, {
        onSuccess: (fileUrl) => {
          sendMessageMutation.mutate({
            msg: message.trim(),
            fileUrl: fileUrl,
            fileName: selectedFile.name,
          });
        },
      });
    } else {
      sendMessageMutation.mutate({
        msg: message.trim(),
        fileUrl: null,
        fileName: null,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getFileIcon = (fileName) => {
    if (fileName?.toLowerCase().endsWith('.pdf')) return <FileIcon className="w-4 h-4" />;
    if (fileName?.toLowerCase().endsWith('.doc') || fileName?.toLowerCase().endsWith('.docx')) return <FileIcon className="w-4 h-4" />;
    if (fileName?.toLowerCase().endsWith('.jpg') || fileName?.toLowerCase().endsWith('.jpeg') || fileName?.toLowerCase().endsWith('.png')) return <Image className="w-4 h-4" />;
    return <FileIcon className="w-4 h-4" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Projects List */}
      <div className="lg:col-span-1 rounded-2xl border border-[#B87333]/20 bg-white overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[#E5D9C9]">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-[#B87333]" />
            <h3 className="font-bold text-gray-900">Client Chats</h3>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by book or client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No conversations found</p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`w-full p-4 border-b border-[#E5D9C9] hover:bg-[#F5EFE8] transition-colors text-left ${
                  selectedProject?.id === project.id ? 'bg-[#F5EFE8]' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {project.profile_photo_url ? (
                    <img 
                      src={project.profile_photo_url} 
                      alt={project.contact_name}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-white shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#B87333] to-[#D4A574] flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                      {project.contact_name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900 truncate">{project.book_title}</p>
                      {project.unread_count > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-[#B87333] text-white text-xs font-bold rounded-full min-w-[20px] text-center">
                          {project.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{project.contact_name}</p>
                    {project.last_message && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{project.last_message}</p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-2 rounded-2xl border border-[#B87333]/20 bg-white overflow-hidden flex flex-col">
        {selectedProject ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#E5D9C9] bg-gradient-to-r from-[#1A2B4A] to-[#0F1F35] text-white">
              <div className="flex items-center gap-3">
                {selectedProject.profile_photo_url ? (
                  <img 
                    src={selectedProject.profile_photo_url} 
                    alt={selectedProject.contact_name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold">{selectedProject.book_title}</h3>
                  <p className="text-xs text-white/70">{selectedProject.contact_name}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-gray-50">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, idx) => {
                    const isAdmin = msg.sender_type === 'admin';
                    return (
                      <div key={idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className="flex items-end gap-2 max-w-[70%]">
                          {!isAdmin && selectedProject.profile_photo_url && (
                            <img 
                              src={selectedProject.profile_photo_url} 
                              alt="Client"
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <div className={`rounded-2xl p-3 ${
                            isAdmin 
                              ? 'bg-gradient-to-r from-[#1A2B4A] to-[#0F1F35] text-white' 
                              : 'bg-white border border-gray-200 text-gray-900'
                          }`}>
                          {msg.message && <p className="text-sm mb-2">{msg.message}</p>}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="space-y-2 mt-2">
                              {msg.attachments.map((att, attIdx) => (
                                <a
                                  key={attIdx}
                                  href={att.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`flex items-center gap-3 p-2 rounded-lg ${
                                    isAdmin ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-50 hover:bg-gray-100'
                                  } transition-colors`}
                                >
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    isAdmin ? 'bg-white/30' : 'bg-[#B87333]/10 text-[#B87333]'
                                  }`}>
                                    {getFileIcon(att.file_name)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium truncate ${isAdmin ? 'text-white' : 'text-gray-900'}`}>
                                      {att.file_name}
                                    </p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                          <p className={`text-xs mt-1 ${isAdmin ? 'text-white/70' : 'text-gray-500'}`}>
                            {new Date(msg.created_date).toLocaleString('en-ZA', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </p>
                        </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#E5D9C9] bg-white">
              {selectedFile && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-12 h-12 bg-[#B87333]/10 rounded flex items-center justify-center text-[#B87333]">
                        {getFileIcon(selectedFile.name)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={handleRemoveFile} className="p-1 hover:bg-red-50 rounded text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadFileMutation.isPending || sendMessageMutation.isPending}
                  className="px-3 py-2 rounded-lg border-2 border-[#B87333] text-[#B87333] hover:bg-[#B87333]/10 transition-colors disabled:opacity-50"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B87333]/50"
                  rows={2}
                />
                <Button
                  onClick={handleSend}
                  disabled={(!message.trim() && !selectedFile) || sendMessageMutation.isPending || uploadFileMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {sendMessageMutation.isPending || uploadFileMutation.isPending ? (
                    <Upload className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}