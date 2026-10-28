import React from 'react';
import { BookOpen, CheckCircle, Clock, ChevronRight } from 'lucide-react';

export default function ProjectsTab({ contact, projects = [] }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="rounded-xl border border-[#E5D9C9] bg-white p-16 text-center" style={{
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
      }}>
        <div className="w-20 h-20 bg-[#B87333]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-10 h-10 text-[#B87333]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Projects Yet</h3>
        <p className="text-gray-600">Your publishing projects will appear here once they're created.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
        <p className="text-sm text-gray-600">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid gap-6">
        {projects.map(project => {
          const isCompleted = ['Completed', 'Delivered'].includes(project.stage);
          const progress = isCompleted ? 100 : 25; // Simplified progress for demo

          return (
            <div key={project.id} className="rounded-xl border border-[#E5D9C9] bg-white overflow-hidden" style={{
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)'
            }}>
              <div className="flex flex-col md:flex-row">
                {/* Cover Image */}
                <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-gray-100">
                  {project.cover_image ? (
                    <img src={project.cover_image} alt={project.book_title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#B87333]/20 to-[#D4A574]/20 flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-[#B87333]/30" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{project.book_title}</h3>
                      <p className="text-sm text-gray-600">{project.service_type}</p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      isCompleted ? 'bg-green-100 text-green-700' : 'bg-[#B87333]/10 text-[#B87333]'
                    }`}>
                      {project.stage}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-600">Progress</span>
                      <span className="text-xs font-bold text-[#B87333]">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#B87333] to-[#D4A574] rounded-full transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 mb-4 text-sm">
                    {project.deadline && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Due {new Date(project.deadline).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                    {project.stage_changed_at && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Updated {new Date(project.stage_changed_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        // Navigate to documents or show project details
                        alert(`Viewing details for: ${project.book_title}\n\nThis would open the project detail view.`);
                      }}
                      className="px-5 py-2.5 rounded-lg bg-[#1A2B4A] text-white text-sm font-semibold hover:shadow-md transition-all flex items-center gap-2"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    {!isCompleted && (
                      <button 
                        onClick={() => {
                          // Navigate to chat
                          alert(`Contacting support for: ${project.book_title}\n\nThis would open the chat tab.`);
                        }}
                        className="px-5 py-2.5 rounded-lg border-2 border-[#B87333] text-[#B87333] text-sm font-semibold hover:bg-[#B87333]/10 transition-all"
                      >
                        Contact Support
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}