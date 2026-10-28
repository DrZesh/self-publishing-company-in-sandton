import React from 'react';
import { Upload, CheckCircle, Clock, XCircle, AlertCircle, Download, Calendar, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { platform } from '@/api/platformClient';

export default function FileRequestsTab({ fileRequests, contact, projects }) {
  const [selectedRequest, setSelectedRequest] = React.useState(null);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [uploading, setUploading] = React.useState(false);
  const [showUploadModal, setShowUploadModal] = React.useState(false);

  const statusConfig = {
    'requested': { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Requested' },
    'uploaded': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Uploaded' },
    'approved': { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Approved' },
    'rejected': { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Rejected' },
    'expired': { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Expired' },
  };

  const handleUpload = async () => {
    if (!selectedRequest || !selectedFile) return;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const { file_url } = await platform.integrations.Core.UploadFile({ file: selectedFile });
      const uploadRes = await platform.functions.invoke('fileUploadActions', {
        action: 'upload_file', request_id: selectedRequest.id, file_url, file_name: selectedFile.name,
      });
      
      if (uploadRes.data.success) {
        alert('File uploaded successfully.');
        setShowUploadModal(false);
        setSelectedFile(null);
        setSelectedRequest(null);
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const pendingRequests = fileRequests?.filter(r => r.status === 'requested') || [];
  const completedRequests = fileRequests?.filter(r => ['uploaded', 'approved', 'rejected'].includes(r.status)) || [];

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-gradient-to-r from-[#B87333]/20 to-blue-500/10 rounded-3xl border border-[#B87333]/30 p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-[#D4A574]" />
            <h3 className="font-bold text-white text-lg">Action Required: {pendingRequests.length} File(s) Needed</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">Please upload the following files to continue with your project:</p>
          <div className="grid gap-3">
            {pendingRequests.map(request => (
              <div key={request.id} className="p-4 bg-[#1A1A2E]/80 rounded-xl border border-[#B87333]/30">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{request.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{request.description}</p>
                    {request.deadline && (
                      <p className="text-xs text-orange-400 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due: {new Date(request.deadline).toLocaleDateString('en-ZA')}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowUploadModal(true);
                    }}
                    className="bg-gradient-to-r from-[#B87333] to-[#D4A574] hover:from-[#A06828] hover:to-[#B87333] text-white font-semibold px-4 py-2 rounded-lg text-sm"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload File
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All File Requests */}
      <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-gray-700/50 p-6 shadow-xl">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-[#D4A574]" />
          File Requests
        </h3>
        
        {!fileRequests || fileRequests.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No file requests yet</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {fileRequests.map(request => {
              const config = statusConfig[request.status] || statusConfig.requested;
              const Icon = config.icon;
              
              return (
                <div key={request.id} className="p-5 bg-gray-800/30 rounded-xl border border-gray-700/30">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-white">{request.title}</h4>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{request.description}</p>
                      {request.deadline && (
                        <p className="text-xs text-gray-500 mt-1">
                          Deadline: {new Date(request.deadline).toLocaleDateString('en-ZA')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {request.uploaded_file_url && (
                      <a
                        href={request.uploaded_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[#D4A574] hover:underline flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        View Uploaded File
                      </a>
                    )}
                    {request.uploaded_at && (
                      <span className="text-xs text-gray-500">
                        Uploaded: {new Date(request.uploaded_at).toLocaleDateString('en-ZA')}
                      </span>
                    )}
                    {request.admin_feedback && (
                      <div className="text-xs text-orange-400">
                        <strong>Admin feedback:</strong> {request.admin_feedback}
                      </div>
                    )}
                    {request.status === 'requested' && (
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowUploadModal(true);
                        }}
                        size="sm"
                        className="bg-gradient-to-r from-[#B87333] to-[#D4A574] hover:from-[#A06828] hover:to-[#B87333] text-white font-semibold"
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Upload
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-3xl border border-[#B87333]/30 p-6 max-w-lg w-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-xl">{selectedRequest.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{selectedRequest.description}</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 mb-2 block">Select File</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#B87333]/10 file:text-[#D4A574] hover:file:bg-[#B87333]/20 transition-colors"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setShowUploadModal(false)}
                  variant="outline"
                  className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 bg-gradient-to-r from-[#B87333] to-[#D4A574] hover:from-[#A06828] hover:to-[#B87333] text-white font-semibold disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload File'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}