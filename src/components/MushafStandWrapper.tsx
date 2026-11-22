import React from 'react';
import { Layers } from 'lucide-react';

interface MushafStandWrapperProps {
  enabled: boolean;
  onToggle: () => void;
  pageNumber: number;
  children: React.ReactNode;
}

export const MushafStandWrapper: React.FC<MushafStandWrapperProps> = ({
  enabled,
  onToggle,
  pageNumber,
  children
}) => {
  // Even pages on left, Odd pages on right in traditional two-page open Mushaf
  const isLeftPage = pageNumber % 2 === 0;

  if (!enabled) {
    // Clean Flat Mode (No wooden stand, modern focused reader)
    return (
      <div className="w-full flex flex-col items-center justify-center transition-all duration-300">
        <div className="w-full max-w-4xl px-2 sm:px-4 md:px-6">
          {children}
        </div>
      </div>
    );
  }

  // Wooden Stand Mode (Authentic Rehal / Wooden Book Stand Addon)
  return (
    <div className="w-full flex flex-col items-center justify-center transition-all duration-300 relative select-none pb-6">
      {/* Outer Stand Elevation & Presentation Container */}
      <div className="relative w-full max-w-4xl px-2 sm:px-6 md:px-8">
        
        {/* Top Floating Badge for Stand Mode status */}
        <div className="flex items-center justify-end mb-2 pr-2">
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-950/40 border border-amber-600/30 text-amber-300 hover:bg-amber-900/60 transition-colors shadow-sm hit-area-40"
            title="Toggle Wooden Rehal Stand Mode"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Wooden Stand: ON</span>
          </button>
        </div>

        {/* 3D Book Elevation on Wooden Rehal Base */}
        <div className="relative rounded-2xl md:rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] transition-all">
          
          {/* Layered Book Thickness (stacked pages edge effect) */}
          <div
            className={`absolute inset-0 rounded-2xl md:rounded-3xl border border-amber-900/40 pointer-events-none transform translate-y-1.5 ${
              isLeftPage ? '-translate-x-1' : 'translate-x-1'
            }`}
            style={{
              background: 'linear-gradient(to bottom, #2C1A11 0%, #170C07 100%)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)'
            }}
          />

          {/* Central Book Spine Shadow Gradient (simulating open physical Mushaf curve) */}
          <div
            className={`absolute inset-y-0 w-12 sm:w-16 pointer-events-none z-20 opacity-35 ${
              isLeftPage
                ? 'right-0 bg-gradient-to-l from-black/80 to-transparent'
                : 'left-0 bg-gradient-to-r from-black/80 to-transparent'
            }`}
          />

          {/* Golden Silk Page Ribbon Marker (Aesthetic touch in King Fahd Mushaf) */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 sm:w-5 h-10 sm:h-14 bg-gradient-to-b from-amber-500 to-amber-700 rounded-b shadow-lg z-30 pointer-events-none border-x border-amber-300/40 flex flex-col justify-end items-center pb-1">
            <div className="w-2.5 h-0.5 bg-amber-200/60 rounded" />
          </div>

          {/* Inner Mushaf Page Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>

        {/* =====================================================================
            WOODEN REHAL STAND BASE & CARVED LEGS (The Stand Addon)
           ===================================================================== */}
        <div className="relative -mt-3 sm:-mt-4 mx-auto w-[94%] sm:w-[92%] z-0 pointer-events-none">
          {/* Top Wooden Shelf Lip */}
          <div
            className="h-4 sm:h-5 rounded-b-xl border-t border-amber-500/25 shadow-2xl relative overflow-hidden flex items-center justify-center"
            style={{
              background: 'linear-gradient(90deg, #1C0F08 0%, #3D2214 25%, #4A2A1A 50%, #3D2214 75%, #1C0F08 100%)'
            }}
          >
            {/* Subtle Carved Wood Inlay Pattern */}
            <div className="w-full h-full opacity-20 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:8px_8px]" />
          </div>

          {/* Interlocking Crossed Wooden Rehal Legs (Arabic Wooden Book Stand) */}
          <div className="relative h-10 sm:h-14 w-full flex items-center justify-center overflow-hidden">
            {/* Left Angled Leg */}
            <div
              className="absolute w-2/5 h-16 rounded-b-lg border-b border-amber-600/20 shadow-2xl transform -skew-x-12"
              style={{
                background: 'linear-gradient(135deg, #2A170D 0%, #1A0D07 100%)'
              }}
            />
            {/* Right Angled Leg */}
            <div
              className="absolute w-2/5 h-16 rounded-b-lg border-b border-amber-600/20 shadow-2xl transform skew-x-12"
              style={{
                background: 'linear-gradient(225deg, #2A170D 0%, #150A05 100%)'
              }}
            />

            {/* Central Arabesque Brass Emblem (Medallion on the Rehal Joint) */}
            <div className="relative z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-amber-700 via-yellow-600 to-amber-500 border border-amber-300/50 shadow-md flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full border border-amber-950/60 bg-amber-900/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-amber-200 rounded-full" />
              </div>
            </div>
          </div>

          {/* Deep Shadow Cast onto Ground */}
          <div className="w-3/4 mx-auto h-4 bg-black/70 blur-md rounded-full -mt-2" />
        </div>

      </div>
    </div>
  );
};
