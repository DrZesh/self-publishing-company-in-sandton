import { useState } from 'react';
import { QrCode, Download, X } from 'lucide-react';

function getQRUrl(text, size = 200) {
  return `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(text)}&choe=UTF-8`;
}

export default function ProjectQRCode({ project, contact }) {
  const [open, setOpen] = useState(false);
  const projectUrl = `${window.location.origin}/admin/projects?highlight=${project.id}`;
  const qrUrl = getQRUrl(projectUrl, 300);

  const handleDownload = async () => {
    const res = await fetch(qrUrl);
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `QR_${(project.book_title || 'project').replace(/\s+/g, '_')}.png`;
    a.click();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        title="View QR Code"
      >
        <QrCode className="w-3.5 h-3.5" />
        QR Code
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Project QR Code</h3>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code */}
            <div className="bg-white border-2 border-gray-100 rounded-xl p-4 flex items-center justify-center mb-4">
              <img src={qrUrl} alt="Project QR Code" className="w-48 h-48" />
            </div>

            {/* Project info */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1">
              <p className="text-sm font-semibold text-gray-900">{project.book_title}</p>
              {contact && <p className="text-xs text-gray-500">{contact.full_name}</p>}
              <p className="text-xs text-gray-400">{project.service_type} · {project.stage}</p>
            </div>

            <p className="text-xs text-gray-400 mb-4 text-center">
              Scan to open project in CRM. Print and attach to physical project folder.
            </p>

            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#B87333] hover:bg-[#A06828] text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              Download QR Code
            </button>
          </div>
        </div>
      )}
    </>
  );
}