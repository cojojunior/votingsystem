// src/pages/Admin/AuditLog.tsx
import React, { useState, useEffect } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { supabase } from "../../api/client";
import {
  Search,
  Filter,
  Download,
  AlertCircle,
  Clock,
  Activity,
  RefreshCw,
} from "lucide-react";

interface AuditLogEntry {
  id: string;
  student_id: string | null;
  admin_id: string | null;
  action: string;
  details: any;
  timestamp: string;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

const AuditLog: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLogs();

    let interval: any;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(200);

      if (filterAction !== "all") {
        query = query.eq("action", filterAction);
      }

      if (dateRange.start) {
        query = query.gte("timestamp", dateRange.start);
      }

      if (dateRange.end) {
        query = query.lte("timestamp", dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const variants: Record<string, string> = {
      LOGIN_SUCCESS: "bg-green-100 text-green-700",
      LOGIN_FAILED: "bg-red-100 text-red-700",
      OTP_REQUESTED: "bg-blue-100 text-blue-700",
      BALLOT_STARTED: "bg-indigo-100 text-indigo-700",
      BALLOT_SUBMITTED: "bg-purple-100 text-purple-700",
      VOTE_ACCEPTED: "bg-green-100 text-green-700",
      DUPLICATE_ATTEMPT: "bg-red-100 text-red-700",
      INVALID_VOTE: "bg-orange-100 text-orange-700",
      BLANK_VOTE: "bg-yellow-100 text-yellow-700",
      ADMIN_LOGIN: "bg-blue-100 text-blue-700",
      ADMIN_ACTION: "bg-indigo-100 text-indigo-700",
      ELECTION_OPENED: "bg-green-100 text-green-700",
      ELECTION_PAUSED: "bg-yellow-100 text-yellow-700",
      ELECTION_RESUMED: "bg-green-100 text-green-700",
      ELECTION_CLOSED: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-2 py-0.5 text-xs rounded-full ${variants[action] || "bg-gray-100 text-gray-700"}`}>
        {action.replace(/_/g, " ")}
      </span>
    );
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const exportLogs = () => {
    const csv = filteredLogs.map((log) => ({
      timestamp: new Date(log.timestamp).toLocaleString(),
      action: log.action,
      user: log.student_id || log.admin_id || "System",
      details: JSON.stringify(log.details || {}),
      ip: log.ip || "-",
    }));

    if (csv.length === 0) {
      alert("No logs to export");
      return;
    }

    const headers = Object.keys(csv[0]);
    const rows = csv.map((row) =>
      headers.map((h) => row[h as keyof typeof row]).join(","),
    );
    const output = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([output], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const actions = Array.from(new Set(logs.map((log) => log.action)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-600">
            Monitor all system activities and security events
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "success" : "secondary"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}>
            <RefreshCw
              className={`h-4 w-4 mr-1 ${autoRefresh ? "animate-spin" : ""}`}
            />
            {autoRefresh ? "Live" : "Paused"}
          </Button>
          <Button variant="secondary" size="sm" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>
        <div className="w-48">
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="input-field">
            <option value="all">All Actions</option>
            {actions.map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="w-48">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange({ ...dateRange, start: e.target.value })
            }
            className="input-field"
            placeholder="Start Date"
          />
        </div>
        <div className="w-48">
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange({ ...dateRange, end: e.target.value })
            }
            className="input-field"
            placeholder="End Date"
          />
        </div>
        <Button variant="secondary" size="sm" onClick={fetchLogs}>
          <Filter className="h-4 w-4 mr-1" />
          Apply
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.student_id || log.admin_id || "System"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                    {log.details ? (
                      <span className="text-xs font-mono bg-gray-50 px-2 py-1 rounded">
                        {typeof log.details === "string"
                          ? log.details
                          : JSON.stringify(log.details).substring(0, 50)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {log.ip || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No audit logs found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters</p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Showing {filteredLogs.length} of {logs.length} logs
            </span>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Using the Card component */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Total Logs</p>
            <p className="text-2xl font-bold text-upsa-blue">{logs.length}</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Filtered Logs</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredLogs.length}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Unique Actions</p>
            <p className="text-2xl font-bold text-purple-600">
              {actions.length}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuditLog;
