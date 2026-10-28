import React from 'react';
import { Upload, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const uploadCategories = [
  'Manuscript', 'Edited Manuscript', 'Cover Image', 'Author Photo', 
  'ISBN Document', 'Proof Corrections', 'Signed Documents', 
  'Print-Ready Files', 'Proof of Payment', 'Supporting Documents'
];

const statusIcons = {
  'Uploaded': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  'Under Review': { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  'Approved': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  'Rejected': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  'Please Re-upload': { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
};

export default function UploadsTab({ uploads, selectedFile, setSelectedFile, uploadCategory, setUploadCategory, selectedProject, setSelectedProject, projects, uploading, handleFileUpload }) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Upload Form */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-[#B87333]/20 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#D4A574]" />
          Upload File
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">Category</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B87333]/40"
            >
              {uploadCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {projects?.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-400 mb-2 block">Project (optional)</label>
              <select
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#B87333]/40"
              >
                <option value="">Auto-select latest project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.book_title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block">File</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#B87333]/10 file:text-[#D4A574] hover:file:bg-[#B87333]/20 transition-colors"
            />
          </div>

          <Button
            onClick={handleFileUpload}
            disabled={!selectedFile || uploading}
            className="w-full bg-gradient-to-r from-[#B87333] to-[#D4A574] hover:from-[#A06828] hover:to-[#B87333] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#B87333]/30 transition-all duration-300 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </div>
      </div>

      {/* Upload History */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#D4A574]" />
          Your Uploads
        </h3>
        
        {!uploads || uploads.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No uploads yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {uploads.map(file => {
              const StatusIcon = statusIcons[file.status]?.icon || Clock;
              const statusColor = statusIcons[file.status]?.color || 'text-gray-400';
              const statusBg = statusIcons[file.status]?.bg || 'bg-gray-500/10';
              
              return (
                <div key={file.id} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{file.file_name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{file.category}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}>
                      <StatusIcon className="w-3 h-3" />
                      {file.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(file.created_date).toLocaleDateString('en-ZA')}</span>
                    {file.admin_feedback && (
                      <span className="text-orange-400">⚠️ {file.admin_feedback}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}