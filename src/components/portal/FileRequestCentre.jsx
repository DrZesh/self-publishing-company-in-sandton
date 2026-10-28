import React, { useState } from 'react';
import { Upload, CheckCircle, X, AlertCircle, FileText, Calendar, Download } from 'lucide-react';

export default function FileRequestCentre({ fileRequests, onUpload, projectId }) {
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = async (request, file) => {
    setUploadingId(request.id);
    setSelectedFile(file);
    
    // Here you would upload the file and call onUpload
    // For now, simulate upload
    setTimeout(() => {
      onUpload(request.id, file);
      setUploadingId(null);
      setSelectedFile(null);
    }, 1500);
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'uploaded':
        return { color: 'bg-blue-50 border-blue-200 text-blue-800', icon: CheckCircle, label: 'Uploaded' };
      case 'approved':
        return { color: 'bg-green-50 border-green-200 text-green-800', icon: CheckCircle, label: 'Approved' };
      case 'rejected':
        return { color: 'bg-red-50 border-red-200 text-red-800', icon: X, label: 'Needs Re-upload' };
      default:
        return { color: 'bg-orange-50 border-orange-200 text-orange-800', icon: AlertCircle, label: 'Requested' };
    }
  };

  if (!fileRequests?.length) {
    return (
      <div className="bg-white rounded-3xl border-2 border-[#D4A574]/20 p-8 text-center shadow-lg">
        <div className="w-20 h-20 bg-gradient-to-br from-[#B87333] to-[#D4A574] rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No File Requests</h3>
        <p className="text-gray-500">Your team will request files here as needed.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border-2 border-[#D4A574]/20 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-xl flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#B87333]" />
            File Upload Centre
          </h3>
          <p className="text-sm text-gray-500 mt-1">Upload requested documents and files</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">
            {fileRequests.filter(r => r.status === 'requested').length} pending
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {fileRequests.map(request => {
          const statusConfig = getStatusConfig(request.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={request.id}
              className={`rounded-2xl border-2 p-5 ${statusConfig.color} transition-all duration-200`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className="w-5 h-5" />
                    <h4 className="font-bold text-base">{request.title}</h4>
                    <span className="text-[10px] bg-white/60 px-2 py-0.5 rounded-full font-bold">
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="text-sm opacity-80 mb-3">{request.description}</p>
                  
                  {request.due_date && (
                    <p className="text-xs opacity-70 flex items-center gap-1 mb-2">
                      <Calendar className="w-3 h-3" />
                      Due: {new Date(request.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long' })}
                    </p>
                  )}
                  
                  {request.status === 'rejected' && request.rejected_reason && (
                    <div className="bg-red-100 rounded-lg p-3 mt-2">
                      <p className="text-xs font-semibold text-red-700 mb-1">Reason for rejection:</p>
                      <p className="text-sm text-red-600">{request.rejected_reason}</p>
                    </div>
                  )}
                  
                  {request.status === 'uploaded' && request.uploaded_file_name && (
                    <div className="bg-blue-100 rounded-lg p-3 mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700 font-medium">{request.uploaded_file_name}</span>
                      </div>
                      <a href={request.uploaded_file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-semibold flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                    </div>
                  )}
                </div>

                {request.status === 'requested' && (
                  <label className="flex-shrink-0">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => e.target.files[0] && handleFileSelect(request, e.target.files[0])}
                      disabled={uploadingId === request.id}
                    />
                    <div className={`px-5 py-2.5 bg-gradient-to-r from-[#B87333] to-[#D4A574] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer ${uploadingId === request.id ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}>
                      {uploadingId === request.id ? 'Uploading...' : 'Upload File'}
                    </div>
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}