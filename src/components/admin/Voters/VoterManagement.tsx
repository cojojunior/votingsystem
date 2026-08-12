// src/components/admin/Voters/VoterManagement.tsx
import React, { useState, useEffect } from "react";
import { Card } from "../../common/Card";
import { Button } from "../../common/Button";
import { Modal } from "../../common/Modal";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { supabase } from "../../../api/client";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      const { data: sessionsData, error: sessionsError } = await (
        supabase.from("sessions") as any
      ).select("*");

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);

      // Fetch voters
      const { data: votersData, error: votersError } = await (
        supabase.from("students") as any
      ).select("*");

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

    setIsSubmitting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          throw new Error("CSV file is empty or invalid");
        }

        const headerRow = lines[0].split(",").map((h) => h.trim());
        const headers = headerRow.reduce(
          (acc: any, h: string, index: number) => {
            acc[h] = index;
            return acc;
          },
          {},
        );

        const requiredHeaders = ["StudentID", "Email"];
        const missingHeaders = requiredHeaders.filter((h) => !(h in headers));
        if (missingHeaders.length > 0) {
          throw new Error(
            `Missing required headers: ${missingHeaders.join(", ")}`,
          );
        }

        const students = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          if (values.every((v) => !v)) continue;

          const student = {
            student_id: values[headers["StudentID"]] || "",
            email: values[headers["Email"]] || "",
            gender:
              headers["Gender"] !== undefined
                ? values[headers["Gender"]]?.toLowerCase() || "male"
                : "male",
            level:
              headers["Level"] !== undefined
                ? values[headers["Level"]] || ""
                : "",
            programme:
              headers["Programme"] !== undefined
                ? values[headers["Programme"]] || ""
                : "",
            session_id:
              headers["SessionID"] !== undefined
                ? values[headers["SessionID"]] || null
                : null,
            is_eligible: true,
            has_voted: false,
          };

          if (student.student_id && student.email) {
            students.push(student);
          }
        }

        if (students.length === 0) {
          throw new Error("No valid student records found");
        }

        const { error } = await (supabase.from("students") as any).insert(
          students,
        );

        if (error) throw error;

        await fetchData();
        setShowImportModal(false);
        setCsvFile(null);
        alert(`Successfully imported ${students.length} students`);
      };
      reader.readAsText(csvFile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        student_id: newVoter.studentId,
        email: newVoter.email,
        gender: newVoter.gender,
        level: newVoter.level,
        programme: newVoter.programme,
        session_id: newVoter.sessionId || null,
        is_eligible: true,
        has_voted: false,
      };

      const { error } = await (supabase.from("students") as any).insert(
        payload,
      );

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
      setIsSubmitting(false);
    }
  };

  const handleDeleteVoter = async (id: string) => {
    if (!confirm("Are you sure you want to remove this voter?")) return;

    try {
      const { error } = await (supabase.from("students") as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDownloadCSV = () => {
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
    const rows = voters.map((voter: any) => [
      voter.student_id || "",
      voter.email || "",
      voter.gender || "",
      voter.level || "",
      voter.programme || "",
      getSessionName(voter.session_id),
      voter.has_voted ? "Yes" : "No",
      voter.is_eligible ? "Yes" : "No",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
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

  const filteredVoters = voters.filter((voter: any) => {
    const matchesSearch =
      voter.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voter.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "voted" && voter.has_voted) ||
      (filterStatus === "not_voted" && !voter.has_voted);
    const matchesSession =
      filterSession === "all" || voter.session_id === filterSession;
    return matchesSearch && matchesStatus && matchesSession;
  });

  const getSessionName = (sessionId: string) => {
    const session = sessions.find((s: any) => s.id === sessionId);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = {
    total: voters.length,
    voted: voters.filter((v: any) => v.has_voted).length,
    notVoted: voters.filter((v: any) => !v.has_voted).length,
    eligible: voters.filter((v: any) => v.is_eligible).length,
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
            {sessions.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
          onClick={fetchData}>
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
              {filteredVoters.map((voter: any) => (
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
              isLoading={isSubmitting}>
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
              {sessions.map((s: any) => (
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
            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Add Voter
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VoterManagement;
