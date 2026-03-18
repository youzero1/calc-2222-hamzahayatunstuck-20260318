'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface HistoryItem {
  id: number;
  expression: string;
  result: string;
  createdAt: string;
}

interface HistoryProps {
  refreshTrigger: number;
  onSelectHistory: (expression: string, result: string) => void;
}

export default function History({ refreshTrigger, onSelectHistory }: HistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, refreshTrigger]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full lg:w-72 bg-gray-800 bg-opacity-60 backdrop-blur-sm rounded-3xl overflow-hidden border border-gray-700 border-opacity-50">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer select-none border-b border-gray-700 border-opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-white font-semibold text-sm">History</h2>
          {history.length > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
              {history.length}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Content */}
      {isOpen && (
        <div className="max-h-[400px] lg:max-h-[480px] overflow-y-auto scrollbar-thin">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 px-4">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 text-sm">No calculations yet</p>
              <p className="text-gray-600 text-xs mt-1">Your history will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700 divide-opacity-50">
              {history.map((item, index) => {
                const showDate =
                  index === 0 ||
                  formatDate(item.createdAt) !== formatDate(history[index - 1].createdAt);
                return (
                  <React.Fragment key={item.id}>
                    {showDate && (
                      <div className="px-4 py-1.5 bg-gray-700 bg-opacity-30">
                        <span className="text-gray-500 text-xs font-medium">{formatDate(item.createdAt)}</span>
                      </div>
                    )}
                    <button
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 hover:bg-opacity-40 transition-colors group"
                      onClick={() => onSelectHistory(item.expression, item.result)}
                    >
                      <div className="text-gray-400 text-xs truncate group-hover:text-gray-300 transition-colors">
                        {item.expression}
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-white text-base font-medium">
                          = {item.result}
                        </span>
                        <span className="text-gray-600 text-xs">{formatTime(item.createdAt)}</span>
                      </div>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
