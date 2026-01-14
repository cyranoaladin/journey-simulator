/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { useState } from 'react';
import { useJourneyStore } from '../../store/journeyStore';
import AgentActivityFeed from '../Journey/AgentActivityFeed';
import JourneyTimeline from '../Journey/JourneyTimeline';

export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const lastStep = useJourneyStore((s) => s.lastStep);
  const selectedPersona = useJourneyStore((s) => s.selectedPersona);
  const userProgress = useJourneyStore((s) => s.userProgress);

  // Toggle sidebar on mobile
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Left Sidebar - Timeline & Progress */}
      <div className={`lg:w-80 bg-black/20 backdrop-blur-sm border-r border-white/10 transition-all duration-300 ${isSidebarOpen ? 'w-full lg:block' : 'hidden'}`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              {selectedPersona?.name || 'Journey'}
            </h2>
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{userProgress?.totalXP || 0} XP</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (userProgress?.totalXP || 0) / 10)}%` }}
              ></div>
            </div>
          </div>

          <JourneyTimeline phases={selectedPersona?.phases || []} currentPhase={userProgress?.completedPhases?.length || 0} />
        </div>
      </div>

      {/* Mobile toggle button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg border border-white/10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-2">
              {lastStep?.metadata?.title || selectedPersona?.title || 'Journey Simulator'}
            </h1>
            <p className="text-gray-400">
              {lastStep?.metadata?.summary || 'Join the Internet Capital Market on Solana'}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Agent Activity & Resources */}
      <div className="lg:w-80 bg-black/20 backdrop-blur-sm border-l border-white/10 hidden lg:block">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="w-3 h-3 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>{' '}
            Agent Activity
          </h3>

          {lastStep ? (
            <AgentActivityFeed step={lastStep} />
          ) : (
            <div className="text-gray-500 text-sm">
              No agent activity yet
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6">
            <h4 className="font-medium mb-2">Quick Actions</h4>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition text-sm">
                Reload journey
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition text-sm">
                View resources
              </button>
              <button className="w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition text-sm">
                Ask Zyno a question
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}