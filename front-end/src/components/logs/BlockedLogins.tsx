import {
  Button,
  TextControl,
  SelectControl,
} from "@wordpress/components";
import { useState } from "react";
import { useBlockedLogins } from "../../hooks/useBlockedLogins";
import { getDateRangeFromPreset } from "../../utils/date";
import { DateFilterPreset } from "~/types/blocked-logins";
import { AlertCircle } from "lucide-react";

export function BlockedLogins() {
  const {
    data,
    isLoading,
    error,
    currentPage,
    filters,
    goToPage,
    refresh,
    updateFilters,
    clearFilters,
  } = useBlockedLogins();

  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all');

  const hasActiveFilters =
    filters.username ||
    filters.result ||
    filters.ip ||
    filters.start_date ||
    filters.end_date;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Blocked Login Attempts</h3>
        <Button variant="secondary" onClick={refresh}>
          Refresh
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <div className="grid grid-cols-4 gap-4 items-end">
          <TextControl
            label="Username"
            value={filters.username}
            onChange={(value) => updateFilters({ username: value })}
            placeholder="Filter by username..."
          />

          <SelectControl
            label="Result"
            value={filters.result as "" | "warn" | "bad"}
            onChange={(value) => updateFilters({ result: value || "" })}
            options={[
              { label: "All Results", value: "" },
              { label: "Bad", value: "bad" },
              { label: "Warning", value: "warn" },
            ]}
          />

          <TextControl
            label="IP Address"
            value={filters.ip}
            onChange={(value) => updateFilters({ ip: value })}
            placeholder="Filter by IP..."
          />

          <SelectControl
            label="Date Range"
            value={datePreset}
            onChange={(value: string) => {
              const preset = value as DateFilterPreset;
              setDatePreset(preset);
              const dateRange = getDateRangeFromPreset(preset);
              updateFilters({
                start_date: dateRange.start_date,
                end_date: dateRange.end_date,
              });
            }}
            options={[
              { label: "All Time", value: "all" },
              { label: "Last 24 Hours", value: "last_24h" },
              { label: "Last 7 Days", value: "last_7d" },
              { label: "Last 30 Days", value: "last_30d" },
            ]}
          />
        </div>

        {hasActiveFilters && (
          <div className="mt-3">
            <Button
              variant="link"
              onClick={() => {
                clearFilters();
                setDatePreset('all');
              }}
              className="text-sm"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      {error ? (
        <div className="flex items-center justify-center py-12 bg-white border border-red-200 rounded-md">
          <div className="text-center max-w-md">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>

            {/* Error Message */}
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Load Blocked Login Logs
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {error}
            </p>

            {/* Action Button */}
            <Button variant="primary" onClick={refresh} style={{ marginTop: '8px' }}>
              Try Again
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-8 bg-white border border-gray-200 rounded-md">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blocked logins...</p>
          </div>
        </div>
      ) : !data || data.logs.length === 0 ? (
        <div className="text-center py-8 bg-white border border-gray-200 rounded-md">
          <p className="text-gray-600">No blocked login attempts recorded.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[200px_200px_250px_minmax(300px,2fr)_200px] bg-gray-50 border-b border-gray-200">
            <div className="px-4 py-3 text-sm font-semibold text-gray-700">
              Username
            </div>
            <div className="px-4 py-3 text-sm font-semibold text-gray-700">
              Result
            </div>
            <div className="px-4 py-3 text-sm font-semibold text-gray-700">
              IP Address
            </div>
            <div className="px-4 py-3 text-sm font-semibold text-gray-700">
              User Agent
            </div>
            <div className="px-4 py-3 text-sm font-semibold text-gray-700">
              Date
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {data.logs.map((log, index) => {
              const getResultDisplay = (result: string | null) => {
                if (result === "warn") {
                  return {
                    text: "Warning",
                    className: "bg-yellow-100 text-yellow-800",
                  };
                } else if (result === "bad") {
                  return { text: "Bad", className: "bg-red-100 text-red-800" };
                }
                return {
                  text: result || "Unknown",
                  className: "bg-gray-100 text-gray-800",
                };
              };

              const resultDisplay = getResultDisplay(log.result);
              return (
                <div
                  key={log.id}
                  className={`grid grid-cols-[200px_200px_250px_minmax(300px,2fr)_200px] transition-colors duration-150 min-h-[52px] ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  } hover:bg-gray-50`}
                >
                  {/* Username */}
                  <div className="px-4 py-4 flex items-center">
                    <strong className="text-sm">{log.username}</strong>
                  </div>

                  {/* Result */}
                  <div className="px-4 py-4 flex items-center">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${resultDisplay.className}`}
                    >
                      {resultDisplay.text}
                    </span>
                  </div>

                  {/* IP Address */}
                  <div className="px-4 py-4 flex items-center">
                    <span className="text-sm text-gray-600">
                      {log.ip_address || "N/A"}
                    </span>
                  </div>

                  {/* User Agent */}
                  <div className="px-4 py-4 flex items-center min-w-0">
                    <span className="text-xs text-gray-600 truncate block w-full" title={log.user_agent || "N/A"}>
                      {log.user_agent || "N/A"}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="px-4 py-4 flex items-center">
                    <span className="text-sm text-gray-600">
                      {formatDate(log.blocked_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data && (
        <div className="flex justify-between items-center pt-4">
          <div className="text-sm text-gray-600">
            Page {data.page} of {data.total_pages} ({data.total} total)
          </div>

          {data.total_pages > 1 && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === data.total_pages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
