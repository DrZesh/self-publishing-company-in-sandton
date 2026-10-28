import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, User, Clock, Paperclip, Image, File, Upload, Check } from 'lucide-react';
import { platform } from '@/api/platformClient';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ClientChat({ contact, project }) {
  const [isOpen, setIsOpen] = useState(false);
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
    enabled: !!project?.id && isOpen,
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
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

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message.trim());
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
          style={{
            boxShadow: '0 4px 20px rgba(184, 115, 51, 0.4)'
          }}
        >
          <MessageSquare className="w-7 h-7" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px] flex flex-col rounded-2xl overflow-hidden shadow-2xl" style={{
          background: 'white',
          border: '1px solid #E5D9C9',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
        }}>
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#1A2B4A] to-[#0F1F35] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Creative Books Support</h3>
                <p className="text-xs text-white/70">We typically reply within 2 hours</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50 min-h-[300px]">
            {isLoading ? (
              <div className="text-center text-sm text-gray-500 py-8">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No messages yet</p>
                <p className="text-xs text-gray-500 mt-1">Start a conversation with our team</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isClient = msg.sender_type === 'client';
                return (
                  <div key={idx} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 ${
                      isClient 
                        ? 'bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white' 
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isClient ? 'text-white/70' : 'text-gray-500'}`}>
                        {new Date(msg.created_date).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B87333]/50 focus:border-transparent"
                rows={2}
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                style={{
                  boxShadow: '0 2px 8px rgba(184, 115, 51, 0.2)'
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}