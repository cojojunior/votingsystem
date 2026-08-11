// src/pages/Admin/VoterManagement.tsx
import React, { useState, useEffect } from "react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Modal } from "../../components/common/Modal";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { supabase } from "../../api/client";
import {
  Search,
  Upload,
  Download,
  UserPlus,
  Users,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react";

export const VoterManagement: React.FC = () => {
  const [voters, setVoters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSession, setFilterSession] = useState<string>("all");
  const [sessions, setSessions] = useState<any[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVoter, setNewVoter] = useState({
    studentId: "",
    email: "",
    gender: "male",
    level: "",
    programme: "",
    sessionId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("sessions")
        .select("*");

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);

      // Fetch voters
      const { data: votersData, error: votersError } = await supabase
        .from("students")
        .select("*");

      if (votersError) throw votersError;
      setVoters(votersData || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n");
        // Using the lines variable to read CSV data
        const csvHeaders = lines[0].split(",");
        console.log("CSV Headers:", csvHeaders); // Using the headers

        const students = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",");
            return {
              studentId: values[0]?.trim(),
              email: values[1]?.trim(),
              gender: values[2]?.trim() || "male",
              level: values[3]?.trim() || "",
              programme: values[4]?.trim() || "",
              sessionId: values[5]?.trim() || null,
              is_eligible: true,
              has_voted: false,
            };
          })
          .filter((s) => s.studentId && s.email);

        const { error } = await supabase.from("students").insert(students);

        if (error) throw error;
        await fetchData();
        setShowImportModal(false);
        setCsvFile(null);
      };
      reader.readAsText(csvFile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.from("students").insert({
        ...newVoter,
        is_eligible: true,
        has_voted: false,
      });

      if (error) throw error;
      await fetchData();
      setShowAddModal(false);
      setNewVoter({
        studentId: "",
        email: "",
        gender: "male",
        level: "",
        programme: "",
        sessionId: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVoter = async (id: string) => {
    if (!confirm("Are you sure you want to remove this voter?")) return;

    try {
      const { error } = await supabase.from("students").delete().eq("id", id);

      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDownloadCSV = () => {
    // Create CSV headers
    const headers = [
      "Student ID",
      "Email",
      "Gender",
      "Level",
      "Programme",
      "Session",
      "Voted",
      "Eligible",
    ];

    // Create CSV rows
    const rows = voters.map((voter) => [
      voter.student_id,
      voter.email,
      voter.gender,
      voter.level || "",
      voter.programme || "",
      getSessionName(voter.session_id),
      voter.has_voted ? "Yes" : "No",
      voter.is_eligible ? "Yes" : "No",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `voters_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredVoters = voters.filter((voter) => {
    const matchesSearch =
      voter.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "voted" && voter.has_voted) ||
      (filterStatus === "not_voted" && !voter.has_voted);
    const matchesSession =
      filterSession === "all" || voter.session_id === filterSession;
    return matchesSearch && matchesStatus && matchesSession;
  });

  const getSessionName = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    return session?.name || "Not Assigned";
  };

  const getStatusBadge = (hasVoted: boolean) => {
    if (hasVoted) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Voted
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-700 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Not Voted
      </span>
    );
  };

  const getEligibilityBadge = (isEligible: boolean) => {
    if (isEligible) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
          Eligible
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Ineligible
      </span>
    );
  };

  if (isLoading && voters.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = {
    total: voters.length,
    voted: voters.filter((v) => v.has_voted).length,
    notVoted: voters.filter((v) => !v.has_voted).length,
    eligible: voters.filter((v) => v.is_eligible).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voter Management</h1>
          <p className="text-sm text-gray-600">
            Manage eligible voters and their voting status
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownloadCSV}>
            <Download className="h-4 w-4 mr-2" />
            Download CSV
          </Button>
          <Button onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Voter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-upsa-blue">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Voters</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.voted}</p>
            <p className="text-sm text-gray-600">Voted</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {stats.notVoted}
            </p>
            <p className="text-sm text-gray-600">Not Voted</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.eligible}</p>
            <p className="text-sm text-gray-600">Eligible</p>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search voters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>
        <div className="w-40">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field">
            <option value="all">All Status</option>
            <option value="voted">Voted</option>
            <option value="not_voted">Not Voted</option>
          </select>
        </div>
        <div className="w-48">
          <select
            value={filterSession}
            onChange={(e) => setFilterSession(e.target.value)}
            className="input-field">
            <option value="all">All Sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          Apply Filters
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Voters Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Eligibility
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVoters.map((voter) => (
                <tr
                  key={voter.id}
                  className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {voter.student_id}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {voter.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {voter.level || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {getSessionName(voter.session_id)}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(voter.has_voted)}
                  </td>
                  <td className="px-4 py-3">
                    {getEligibilityBadge(voter.is_eligible)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteVoter(voter.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredVoters.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No voters found</p>
            <p className="text-sm text-gray-400">
              Try adjusting your filters or import voters
            </p>
          </div>
        )}
      </div>

      {/* Import CSV Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setCsvFile(null);
        }}
        title="Import Voters from CSV">
        <form onSubmit={handleImportCSV} className="space-y-4">
          <div>
            <label className="label">CSV File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-upsa-blue transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                className="hidden"
                id="csvFile"
              />
              <label htmlFor="csvFile" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {csvFile ? csvFile.name : "Click to select CSV file"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Format: StudentID, Email, Gender, Level, Programme, SessionID
                </p>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowImportModal(false);
                setCsvFile(null);
              }}>
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              disabled={!csvFile}
              isLoading={isLoading}>
              Import Voters
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Voter Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewVoter({
            studentId: "",
            email: "",
            gender: "male",
            level: "",
            programme: "",
            sessionId: "",
          });
        }}
        title="Add New Voter">
        <form onSubmit={handleAddVoter} className="space-y-4">
          <div>
            <label className="label">Student ID</label>
            <input
              type="text"
              value={newVoter.studentId}
              onChange={(e) =>
                setNewVoter({ ...newVoter, studentId: e.target.value })
              }
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={newVoter.email}
              onChange={(e) =>
                setNewVoter({ ...newVoter, email: e.target.value })
              }
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Gender</label>
              <select
                value={newVoter.gender}
                onChange={(e) =>
                  setNewVoter({ ...newVoter, gender: e.target.value })
                }
                className="input-field">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <input
                type="text"
                value={newVoter.level}
                onChange={(e) =>
                  setNewVoter({ ...newVoter, level: e.target.value })
                }
                className="input-field"
                placeholder="e.g., 100"
              />
            </div>
          </div>

          <div>
            <label className="label">Programme</label>
            <input
              type="text"
              value={newVoter.programme}
              onChange={(e) =>
                setNewVoter({ ...newVoter, programme: e.target.value })
              }
              className="input-field"
              placeholder="e.g., BSc Computer Science"
            />
          </div>

          <div>
            <label className="label">Session</label>
            <select
              value={newVoter.sessionId}
              onChange={(e) =>
                setNewVoter({ ...newVoter, sessionId: e.target.value })
              }
              className="input-field">
              <option value="">Select Session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowAddModal(false);
                setNewVoter({
                  studentId: "",
                  email: "",
                  gender: "male",
                  level: "",
                  programme: "",
                  sessionId: "",
                });
              }}>
              Cancel
            </Button>
            <Button type="submit" fullWidth isLoading={isLoading}>
              Add Voter
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
