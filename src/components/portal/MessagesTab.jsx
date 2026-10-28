import React from 'react';
import { MessageSquare, Send, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MessagesTab({ messages, messageText, setMessageText, sendMessage, selectedProject, setSelectedProject, projects }) {
  return (
    <div className="space-y-6">
      {/* Compose Message */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-[#B87333]/20 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#D4A574]" />
          Send a Message
        </h3>
        
        {projects?.length > 0 && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-400 mb-2 block">Project (optional)</label>
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B87333]/40"
            >
              <option value="">General enquiry</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.book_title}</option>
              ))}
            </select>
          </div>
        )}

        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message to Creative Books SA..."
          rows={4}
          className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#B87333]/40 resize-none mb-4"
        />

        <Button
          onClick={sendMessage}
          disabled={!messageText.trim()}
          className="bg-gradient-to-r from-[#B87333] to-[#D4A574] hover:from-[#A06828] hover:to-[#B87333] text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-[#B87333]/30 transition-all duration-300"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Message
        </Button>
      </div>

      {/* Message History */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#D4A574]" />
          Message History
        </h3>
        
        {!messages || messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`p-4 rounded-xl border ${
                  msg.sender_type === 'client'
                    ? 'bg-gray-800/30 border-gray-700/30'
                    : 'bg-[#B87333]/10 border-[#B87333]/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.sender_type === 'client' ? 'bg-gray-700' : 'bg-[#B87333]'
                  }`}>
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-white">
                        {msg.sender_type === 'client' ? 'You' : 'Creative Books SA Team'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.created_date).toLocaleDateString('en-ZA', { 
                          day: 'numeric', 
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-[#D4A574] hover:underline block"
                          >
                            📎 Attachment
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}