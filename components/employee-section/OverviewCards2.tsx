"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { fetchFromBackend } from "@/lib/tools";

interface OverviewCardItem {
  data: {
    label: string;
    change?: string;
    percentage: number;
    color: string;
  };
}

export default function OverviewCards2() {
  const [data, setData] = useState<OverviewCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchFromBackend("overview-card2s?populate=*");
        setData(res || []);
      } catch (error) {
        console.error("Error fetching overview cards data:", error);
        setError("Failed to load hiring performance data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-[0px_0px_3px_#0006] p-6 flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-[0px_0px_3px_#0006] p-6 flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-red-600 font-semibold mb-2">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-[0px_0px_3px_#0006] p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-600">No performance data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-[0px_0px_3px_#0006] p-6">
      {/* Header */}
      <div className="flex opacity-0 items-center gap-2 mb-6">
        <svg
          className="w-5 h-5 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
        <h2 className="text-xl font-bold text-gray-900 opacity-0">
          Hiring Performance
        </h2>
      </div>

      {/* Performance Metrics */}
      <div className="space-y-6">
        {data.map((item: OverviewCardItem, index: number) => (
          <div key={index} className="opacity-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {item.data.label}
              </span>
              <div className="flex items-center gap-2">
                {item.data.change && (
                  <span className="text-xs font-semibold text-gray-900">
                    {item.data.change}
                  </span>
                )}
                {!item.data.change && (
                  <span className="text-sm font-bold text-gray-900">
                    {item.data.percentage}%
                  </span>
                )}
              </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`${item.data.color} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${item.data.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
