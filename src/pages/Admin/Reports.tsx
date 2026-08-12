// src/pages/Admin/Reports.tsx
import React, { useState, useEffect } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { supabase } from "../../api/client";
import {
  Download,
  FileText,
  BarChart2,
  Users,
  Award,
  TrendingUp,
  FileDown,
} from "lucide-react";

const Reports: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [selectedReport, setSelectedReport] = useState<
    "overview" | "positions" | "voters" | "faulty"
  >("overview");

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Fetch students
      const { data: studentsData, error: studentsError } = await (
        supabase.from("students") as any
      ).select("*");

      if (studentsError) throw studentsError;

      // Fetch votes
      const { data: votesData, error: votesError } = await (
        supabase.from("votes") as any
      ).select("*");

      if (votesError) throw votesError;

      // Fetch candidates with positions
      const { data: candidatesData, error: candidatesError } = await (
        supabase.from("candidates") as any
      ).select("*, positions(name)");

      if (candidatesError) throw candidatesError;

      // Fetch audit logs for faulty votes
      const { data: auditLogsData, error: auditLogsError } = await (
        supabase.from("audit_logs") as any
      )
        .select("*")
        .in("action", [
          "DUPLICATE_ATTEMPT",
          "MULTIPLE_SELECTION",
          "INVALID_VOTE",
          "BLANK_VOTE",
        ]);

      if (auditLogsError) throw auditLogsError;

      const students = studentsData || [];
      const votes = votesData || [];
      const candidates = candidatesData || [];
      const auditLogs = auditLogsData || [];

      const totalStudents = students.length;
      const totalVotes = students.filter((s: any) => s.has_voted).length;
      const totalCandidates = candidates.length;

      // Calculate gender distribution
      const maleVotes =
        students.filter((s: any) => s.gender === "male" && s.has_voted)
          .length || 0;
      const femaleVotes =
        students.filter((s: any) => s.gender === "female" && s.has_voted)
          .length || 0;

      // Faulty votes
      const faultyVotes = {
        duplicateAttempts:
          auditLogs.filter((l: any) => l.action === "DUPLICATE_ATTEMPT")
            .length || 0,
        multipleSelections:
          auditLogs.filter((l: any) => l.action === "MULTIPLE_SELECTION")
            .length || 0,
        invalidVotes:
          auditLogs.filter((l: any) => l.action === "INVALID_VOTE").length || 0,
        blankVotes:
          auditLogs.filter((l: any) => l.action === "BLANK_VOTE").length || 0,
      };

      // Position results
      const positionResults = candidates.reduce((acc: any, candidate: any) => {
        const positionName = candidate.positions?.name || "Unknown";
        if (!acc[positionName]) {
          acc[positionName] = {
            position: positionName,
            candidates: [],
            totalVotes: 0,
          };
        }
        const voteCount =
          votes.filter((v: any) => v.candidate_id === candidate.id).length || 0;
        acc[positionName].candidates.push({
          name: candidate.name,
          votes: voteCount,
        });
        acc[positionName].totalVotes += voteCount;
        return acc;
      }, {});

      setReportData({
        overview: {
          totalStudents,
          totalVotes,
          totalCandidates,
          maleVotes,
          femaleVotes,
          voterTurnout: totalStudents
            ? ((totalVotes / totalStudents) * 100).toFixed(1)
            : 0,
        },
        faultyVotes,
        positionResults: Object.values(positionResults),
        sessionData: {
          // Would come from sessions table
        },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;

    const data = reportData[selectedReport as keyof typeof reportData];
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedReport}_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any) => {
    if (!data) return "";
    if (Array.isArray(data)) {
      if (data.length === 0) return "No data available";
      const headers = Object.keys(data[0] || {});
      const rows = data.map((item: any) =>
        headers.map((h) => item[h] || "").join(","),
      );
      return [headers.join(","), ...rows].join("\n");
    }
    return Object.entries(data)
      .map(([key, value]) => `${key},${value}`)
      .join("\n");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const reports = [
    { id: "overview", label: "Overview", icon: BarChart2 },
    { id: "positions", label: "Position Results", icon: Award },
    { id: "voters", label: "Voter Analysis", icon: Users },
    { id: "faulty", label: "Faulty Votes", icon: TrendingUp },
  ];

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (selectedReport) {
      case "overview":
        const overview = reportData.overview;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-upsa-blue">
                {overview.totalStudents}
              </p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {overview.totalVotes}
              </p>
              <p className="text-sm text-gray-600">Total Votes Cast</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {overview.voterTurnout}%
              </p>
              <p className="text-sm text-gray-600">Voter Turnout</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {overview.maleVotes}
              </p>
              <p className="text-sm text-gray-600">Male Voters</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-pink-600">
                {overview.femaleVotes}
              </p>
              <p className="text-sm text-gray-600">Female Voters</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-upsa-gold">
                {overview.totalCandidates}
              </p>
              <p className="text-sm text-gray-600">Total Candidates</p>
            </div>
          </div>
        );

      case "positions":
        return (
          <div className="space-y-6">
            {reportData.positionResults.map((position: any) => (
              <div
                key={position.position}
                className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {position.position}
                </h4>
                <div className="space-y-2">
                  {position.candidates.map((candidate: any) => (
                    <div
                      key={candidate.name}
                      className="flex items-center gap-4">
                      <span className="text-sm text-gray-700 flex-1">
                        {candidate.name}
                      </span>
                      <span className="text-sm font-medium">
                        {candidate.votes} votes
                      </span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-upsa-blue h-2 rounded-full"
                          style={{
                            width: `${position.totalVotes ? (candidate.votes / position.totalVotes) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Total: {position.totalVotes} votes
                </p>
              </div>
            ))}
          </div>
        );

      case "faulty":
        const faulty = reportData.faultyVotes;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-red-600">
                {faulty.duplicateAttempts}
              </p>
              <p className="text-sm text-gray-600">Duplicate Attempts</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {faulty.multipleSelections}
              </p>
              <p className="text-sm text-gray-600">Multiple Selections</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {faulty.invalidVotes}
              </p>
              <p className="text-sm text-gray-600">Invalid Candidates</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">
                {faulty.blankVotes}
              </p>
              <p className="text-sm text-gray-600">Blank Votes</p>
            </div>
          </div>
        );

      case "voters":
        const overviewData = reportData.overview;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Voter Demographics
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Male</span>
                    <span className="font-medium">
                      {overviewData.maleVotes}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Female</span>
                    <span className="font-medium">
                      {overviewData.femaleVotes}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2">
                    <span className="text-gray-600">Total</span>
                    <span className="font-bold">{overviewData.totalVotes}</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Voter Turnout
                </h4>
                <div className="text-center">
                  <p className="text-4xl font-bold text-upsa-blue">
                    {overviewData.voterTurnout}%
                  </p>
                  <p className="text-sm text-gray-500">
                    of {overviewData.totalStudents} eligible voters
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-upsa-blue h-2.5 rounded-full"
                      style={{
                        width: `${Math.min(parseFloat(overviewData.voterTurnout), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports & Analytics
          </h1>
          <p className="text-sm text-gray-600">
            View detailed election reports and statistics
          </p>
        </div>
        <Button onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Report Navigation */}
      <div className="flex flex-wrap gap-2">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedReport === report.id
                  ? "bg-upsa-blue text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}>
              <Icon className="h-4 w-4" />
              {report.label}
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      <Card>
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {reports.find((r) => r.id === selectedReport)?.label}
            </h3>
            <p className="text-sm text-gray-500">
              Generated on {new Date().toLocaleString()}
            </p>
          </div>
          <button
            onClick={exportReport}
            className="text-sm text-upsa-blue hover:text-upsa-blue/80 flex items-center gap-1">
            <FileDown className="h-4 w-4" />
            Export
          </button>
        </div>
        {renderReportContent()}
      </Card>

      {/* Quick Stats */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-upsa-blue/10 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-upsa-blue" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.overview?.totalVotes || 0}
                </p>
                <p className="text-xs text-gray-500">Total Votes</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.overview?.voterTurnout || 0}%
                </p>
                <p className="text-xs text-gray-500">Turnout</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.overview?.totalCandidates || 0}
                </p>
                <p className="text-xs text-gray-500">Candidates</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {reportData.faultyVotes?.total || 0}
                </p>
                <p className="text-xs text-gray-500">Faulty Votes</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reports;
