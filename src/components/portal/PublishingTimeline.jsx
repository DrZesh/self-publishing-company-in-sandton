import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Calendar, TrendingUp, Sparkles, Zap, ArrowRight } from 'lucide-react';

export default function PublishingTimeline({ project }) {
  if (!project) return null;

  const STAGES = {
    'Full Publishing Package': [
      { key: 'quote_accepted', label: 'Quote Accepted', icon: Zap },
      { key: 'files_received', label: 'Files Received', icon: CheckCircle },
      { key: 'editing', label: 'Editing & Proofreading', icon: Clock },
      { key: 'cover_design', label: 'Cover Design', icon: Clock },
      { key: 'typesetting', label: 'Typesetting & Layout', icon: Clock },
      { key: 'proof_approval', label: 'Client Proof Approval', icon: AlertTriangle },
      { key: 'printing', label: 'Mass Production Printing', icon: Clock },
      { key: 'binding', label: 'Binding & Finishing', icon: Clock },
      { key: 'quality_check', label: 'Quality Control', icon: CheckCircle },
      { key: 'packaging', label: 'Packaging', icon: Clock },
      { key: 'ready_collection', label: 'Ready for Collection', icon: CheckCircle },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ],
    'Editing Only': [
      { key: 'quote_accepted', label: 'Quote Accepted', icon: Zap },
      { key: 'manuscript_received', label: 'Manuscript Received', icon: CheckCircle },
      { key: 'developmental_edit', label: 'Developmental Editing', icon: Clock },
      { key: 'copy_edit', label: 'Copy Editing', icon: Clock },
      { key: 'proofread', label: 'Proofreading', icon: Clock },
      { key: 'final_review', label: 'Final Review', icon: CheckCircle },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ],
    'Cover Design': [
      { key: 'quote_accepted', label: 'Quote Accepted', icon: Zap },
      { key: 'brief_received', label: 'Design Brief Received', icon: CheckCircle },
      { key: 'concepts', label: 'Concept Designs', icon: Clock },
      { key: 'revisions', label: 'Revisions', icon: Clock },
      { key: 'final_approval', label: 'Final Approval', icon: CheckCircle },
      { key: 'delivered', label: 'Files Delivered', icon: CheckCircle },
    ],
    'Printing Only': [
      { key: 'quote_accepted', label: 'Quote Accepted', icon: Zap },
      { key: 'files_received', label: 'Files Received', icon: CheckCircle },
      { key: 'prepress_check', label: 'Pre-press Check', icon: Clock },
      { key: 'printing', label: 'Printing', icon: Clock },
      { key: 'binding', label: 'Binding', icon: Clock },
      { key: 'quality_check', label: 'Quality Control', icon: CheckCircle },
      { key: 'ready_collection', label: 'Ready for Collection', icon: CheckCircle },
      { key: 'delivered', label: 'Delivered', icon: CheckCircle },
    ],
  };

  const stages = STAGES[project.service_type] || STAGES['Full Publishing Package'];
  
  const stageOrder = stages.map(s => s.key);
  const currentStageIndex = stageOrder.findIndex(s => 
    project.stage?.toLowerCase().includes(s) || 
    project.current_stage?.toLowerCase().includes(s)
  );
  const progress = currentStageIndex >= 0 ? ((currentStageIndex + 1) / stages.length) * 100 : 0;

  return (
    <div className="relative bg-gradient-to-br from-white via-[#FFFBF5] to-[#FFF9F3] rounded-3xl p-6 shadow-xl overflow-hidden border border-[#B87333]/10">
      {/* Header - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#B87333] to-[#D4A574] rounded-xl flex items-center justify-center shadow-lg shadow-[#B87333]/30 flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#B87333]">Publishing Journey</span>
            </div>
            <h3 className="font-bold text-gray-900 text-lg sm:text-xl">{project.book_title}</h3>
            <p className="text-sm text-gray-600">{project.service_type}</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="bg-gradient-to-r from-[#B87333] to-[#D4A574] rounded-xl px-4 py-2.5 shadow-lg shadow-[#B87333]/30 inline-block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/90">Current Stage</p>
            <p className="font-bold text-white text-xs sm:text-sm mt-0.5">{project.stage || 'Quote Accepted'}</p>
          </div>
        </div>
      </div>

      {/* Creative Progress Ring - Responsive */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Overall Progress</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-[#B87333] to-[#D4A574] bg-clip-text text-transparent">{Math.round(progress)}%</span>
        </div>
        
        {/* Progress Ring with Animation */}
        <div className="relative h-6 bg-white rounded-full overflow-hidden shadow-inner border border-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-[#B87333] via-[#D4A574] to-[#FFE5C4] rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            {/* Animated bubbles */}
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-2 h-2 bg-white/40 rounded-full animate-bubble"
                  style={{ 
                    left: `${(i + 1) * 25}%`,
                    top: '50%',
                    animationDelay: `${i * 0.3}s`,
                    transform: 'translateY(-50%)'
                  }}
                />
              ))}
            </div>
          </div>
          {/* Progress percentage markers */}
          <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
            {[0, 25, 50, 75, 100].map(marker => (
              <div key={marker} className="w-px h-3 bg-white/50" />
            ))}
          </div>
        </div>
        
        {/* Progress milestones */}
        <div className="flex justify-between mt-2 text-[10px] text-gray-500">
          <span>Start</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>Complete</span>
        </div>
      </div>

      {/* Timeline Stages - Responsive Vertical Layout for Mobile, Horizontal for Desktop */}
      <div className="relative">
        {/* Desktop: Horizontal Scroll */}
        <div className="hidden lg:block overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex items-start gap-4 min-w-max">
            {stages.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const Icon = stage.icon;

              return (
                <div key={stage.key} className="relative flex flex-col items-center group min-w-[120px]">
                  {/* Connector Line */}
                  {index < stages.length - 1 && (
                    <div className="absolute top-8 left-1/2 w-full h-0.5 bg-gray-200 -z-10">
                      {isCompleted && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#B87333] to-[#D4A574]"></div>
                      )}
                    </div>
                  )}

                  {/* Stage Node */}
                  <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                    isCompleted 
                      ? 'bg-gradient-to-br from-[#B87333] to-[#D4A574] rotate-0' 
                      : isCurrent 
                      ? 'bg-white border-2 border-[#B87333] animate-pulse' 
                      : 'bg-white border-2 border-gray-200'
                  }`}>
                    <Icon className={`w-7 h-7 transition-all duration-300 ${
                      isCompleted ? 'text-white' : isCurrent ? 'text-[#B87333]' : 'text-gray-400'
                    }`} />
                    
                    {/* Completion checkmark overlay */}
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Stage Label */}
                  <div className="mt-3 text-center max-w-[120px]">
                    <p className={`text-xs font-semibold transition-all duration-300 leading-tight ${
                      isCompleted ? 'text-gray-900' : isCurrent ? 'text-[#B87333]' : 'text-gray-500'
                    }`}>
                      {stage.label}
                    </p>
                    {isCurrent && (
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <span className="w-2 h-2 bg-[#B87333] rounded-full animate-pulse"></span>
                        <p className="text-[10px] text-[#B87333] font-medium">Current</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: Vertical Timeline */}
        <div className="lg:hidden space-y-0">
          {stages.map((stage, index) => {
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const Icon = stage.icon;

            return (
              <div key={stage.key} className="relative flex items-start gap-4 pb-6 last:pb-0">
                {/* Vertical Line */}
                {index < stages.length - 1 && (
                  <div className={`absolute left-8 top-12 w-0.5 h-[calc(100%-2rem)] ${
                    isCompleted ? 'bg-gradient-to-b from-[#B87333] to-[#D4A574]' : 'bg-gray-200'
                  }`}></div>
                )}

                {/* Stage Node */}
                <div className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                  isCompleted 
                    ? 'bg-gradient-to-br from-[#B87333] to-[#D4A574]' 
                    : isCurrent 
                    ? 'bg-white border-2 border-[#B87333] animate-pulse' 
                    : 'bg-white border-2 border-gray-200'
                }`}>
                  <Icon className={`w-7 h-7 transition-all duration-300 ${
                    isCompleted ? 'text-white' : isCurrent ? 'text-[#B87333]' : 'text-gray-400'
                  }`} />
                  
                  {/* Completion checkmark */}
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1 pt-1">
                  <p className={`text-sm font-semibold leading-tight ${
                    isCompleted ? 'text-gray-900' : isCurrent ? 'text-[#B87333]' : 'text-gray-500'
                  }`}>
                    {stage.label}
                  </p>
                  {isCurrent && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-2 h-2 bg-[#B87333] rounded-full animate-pulse"></span>
                      <p className="text-xs text-[#B87333] font-medium">In Progress</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estimated Completion - Responsive */}
      {project.deadline && (
        <div className="mt-8 pt-6 border-t border-[#B87333]/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#B87333]/10 to-[#D4A574]/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#B87333]" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Estimated Completion</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">
                  {new Date(project.deadline).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            {project.automation_enabled && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#B87333]/10 to-[#D4A574]/10 rounded-xl border border-[#B87333]/20">
                <Zap className="w-4 h-4 text-[#B87333]" />
                <span className="text-xs font-semibold text-[#B87333]">Auto-updates Active</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes bubble {
          0%, 100% { transform: translateY(-50%) scale(0); opacity: 0; }
          50% { transform: translateY(-50%) scale(1); opacity: 1; }
        }
        .animate-bubble {
          animation: bubble 1.5s infinite;
        }
      `}</style>
    </div>
  );
}