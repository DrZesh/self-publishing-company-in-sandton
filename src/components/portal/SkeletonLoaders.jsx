import React from 'react';
import { cn } from '@/lib/utils';

/**
 * @param {Object} props
 * @param {string} [props.className]
 */
export function SkeletonCard({ className }) {
  return (
    <div className={cn("bg-[#1A1A2E]/50 rounded-2xl p-6 border border-[#B87333]/10 animate-pulse", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="h-6 w-32 bg-gray-800 rounded-lg" />
        <div className="h-8 w-8 bg-gray-800 rounded-lg" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full bg-gray-800 rounded" />
        <div className="h-4 w-2/3 bg-gray-800 rounded" />
      </div>
    </div>
  );
}

export function SkeletonStat({ className }) {
  return (
    <div className={cn("bg-gradient-to-br from-[#1A1A2E] to-[#16213E] rounded-2xl p-6 border border-[#B87333]/10 animate-pulse", className)}>
      <div className="h-4 w-24 bg-gray-800 rounded mb-2" />
      <div className="h-8 w-16 bg-gray-800 rounded" />
    </div>
  );
}

export function SkeletonTimeline({ className }) {
  return (
    <div className={cn("space-y-4 animate-pulse", className)}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-800 rounded-full" />
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-800 rounded mb-2" />
            <div className="h-3 w-48 bg-gray-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ className, count = 3 }) {
  return (
    <div className={cn("space-y-3 animate-pulse", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[#1A1A2E]/50 rounded-xl p-4 border border-[#B87333]/10">
          <div className="flex items-center justify-between mb-3">
            <div className="h-5 w-40 bg-gray-800 rounded" />
            <div className="h-6 w-16 bg-gray-800 rounded-full" />
          </div>
          <div className="h-3 w-full bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ className, rows = 5 }) {
  return (
    <div className={cn("space-y-3 animate-pulse", className)}>
      <div className="h-10 w-full bg-gray-800 rounded-lg" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 w-full bg-gray-800/50 rounded-lg" />
      ))}
    </div>
  );
}