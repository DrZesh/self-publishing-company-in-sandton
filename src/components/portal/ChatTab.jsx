import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Image, File as FileIcon, Upload, X, Check, Trash2 } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function ChatTab({ contact, project }) {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['portalMessages', project?.id],
    queryFn: async () => {
      if (!project?.id) return [];
      const response = await platform.functions.invoke('portalMessages', {
        action: 'list',
        project_id: project.id,
      });
      return response.data.messages || [];
    },
    enabled: !!project?.id,
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
        project_id: project.id,
        contact_id: contact.id,
        message: msg,
        sender_type: 'client',
        attachments: fileUrl ? [{ file_url: fileUrl, file_name: fileName }] : undefined,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['portalMessages', project?.id]);
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

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview for images
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
      // Upload file first, then send message
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
    if (fileName.toLowerCase().endsWith('.pdf')) return <FileIcon className="w-4 h-4" />;
    if (fileName.toLowerCase().endsWith('.doc') || fileName.toLowerCase().endsWith('.docx')) return <FileIcon className="w-4 h-4" />;
    if (fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg') || fileName.toLowerCase().endsWith('.png')) return <Image className="w-4 h-4" />;
    return <FileIcon className="w-4 h-4" />;
  };

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No project available for chat</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-2xl overflow-hidden bg-white border border-[#E5D9C9]" style={{
        boxShadow: '0 4px 24px rgba(184, 115, 51, 0.08)'
      }}>
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#1A2B4A] to-[#0F1F35] text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Project Chat - {project.book_title}</h2>
              <p className="text-sm text-white/70 mt-1">Share files, images, manuscripts, and book covers with our team</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50">
          {isLoading ? (
            <div className="text-center text-sm text-gray-500 py-8">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <Upload className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700 mb-2">No messages yet</p>
              <p className="text-sm text-gray-600">Start a conversation and share files with our team</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => {
                const isClient = msg.sender_type === 'client';
                return (
                  <div key={idx} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl p-4 ${
                      isClient 
                        ? 'bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white' 
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
                              className={`flex items-center gap-3 p-3 rounded-lg ${
                                isClient ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-50 hover:bg-gray-100'
                              } transition-colors`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isClient ? 'bg-white/30' : 'bg-[#B87333]/10 text-[#B87333]'
                              }`}>
                                {getFileIcon(att.file_name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isClient ? 'text-white' : 'text-gray-900'}`}>
                                  {att.file_name}
                                </p>
                                <p className={`text-xs ${isClient ? 'text-white/70' : 'text-gray-500'}`}>
                                  Click to view/download
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                      <p className={`text-xs mt-2 ${isClient ? 'text-white/70' : 'text-gray-500'}`}>
                        {new Date(msg.created_date).toLocaleString('en-ZA', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-200 bg-white">
          {/* File Preview */}
          {selectedFile && (
            <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                  ) : (
                    <div className="w-20 h-20 bg-[#B87333]/10 rounded-lg flex items-center justify-center text-[#B87333]">
                      {getFileIcon(selectedFile.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Ready to upload
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
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
              className="px-4 py-3 rounded-xl border-2 border-[#B87333] text-[#B87333] font-semibold hover:bg-[#B87333]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Paperclip className="w-5 h-5" />
              Attach File
            </button>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Share manuscripts, book covers, images, or any files)"
              className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B87333]/50 focus:border-transparent"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={(!message.trim() && !selectedFile) || sendMessageMutation.isPending || uploadFileMutation.isPending}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                boxShadow: '0 2px 8px rgba(184, 115, 51, 0.2)'
              }}
            >
              {sendMessageMutation.isPending || uploadFileMutation.isPending ? (
                <Upload className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Supported files: Images (JPG, PNG), PDFs, Documents (DOC, DOCX). Max size: 10MB
          </p>
        </div>
      </div>
    </div>
  );
}