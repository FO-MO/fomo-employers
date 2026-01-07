"use client";
export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { fetchFromBackend } from "@/lib/tools";

interface CollegeData {
  data: {
    name: string;
    location: string;
    placementRate: string;
    initial: string;
    color: string;
  };
}

export default function OverviewCards3() {
  const [data, setData] = useState<CollegeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchFromBackend("overview-card3s?populate=*");
        setData(res || []);
      } catch (error) {
        console.error("Error fetching colleges data:", error);
        setError("Failed to load college data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow-[0px_0px_3px_#0006] rounded-2xl p-6 flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-[0px_0px_3px_#0006] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px]">
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
      <div className="bg-white shadow-[0px_0px_3px_#0006] rounded-2xl p-6 flex items-center justify-center min-h-[200px]">
        <p className="text-gray-600">No college data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white  shadow-[0px_0px_3px_#0006]  rounded-2xl  p-6">
      {/* Header */}
      <div className="flex opacity-0 items-center gap-2 mb-6">
        <svg
          className="w-5 h-5 text-gray-700"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 2zm6.82 6L12 12.72 5.18 8 12 4.28 18.82 8zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
        </svg>
        <h2 className="text-xl font-bold text-gray-900">
          Top Performing Colleges
        </h2>
      </div>

      {/* Colleges List */}
      <div className="space-y-4 opacity-0">
        {data.slice(0, 4).map((college: CollegeData, index: number) => {
          const y = college.data;
          return (
            <div
              key={index}
              className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded-lg transition-colors cursor-pointer"
            >
              {/* Avatar */}
              <div
                className={`${y.color} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
              >
                {y.initial}
              </div>

              {/* College Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 truncate">
                  {y.name}
                </h3>
                <p className="text-xs text-gray-500">{y.location}</p>
              </div>

              {/* Placement Rate */}
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-gray-900">
                  {y.placementRate}
                </div>
                <p className="text-xs text-gray-500">Placement Rate</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
