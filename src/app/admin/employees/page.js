"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronDown, 
  ChevronRight, 
  GitBranch, 
  Loader2,
  Building,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EmployeesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("directory"); // 'directory' | 'hierarchy'
  
  // Search / filter state for directory
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // Collapse states for managers in org tree
  const [collapsedManagers, setCollapsedManagers] = useState({
    "manager-uuid-2222": false, // Rahul Sharma
    "manager-uuid-3333": false  // Shreya Mehta
  });

  useEffect(() => {
    async function loadProfiles() {
      try {
        const res = await fetch('/api/profiles?all=true');
        if (res.ok) {
          const data = await res.json();
          setProfiles(data);
        }
      } catch (err) {
        console.error("Error loading profiles:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfiles();
  }, []);

  const toggleManager = (id) => {
    setCollapsedManagers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  // Extract unique values for filters
  const departments = ["all", ...new Set(profiles.map(p => p.department).filter(Boolean))];
  const locations = ["all", ...new Set(profiles.map(p => p.location).filter(Boolean))];
  const designations = ["all", ...new Set(profiles.map(p => p.designation).filter(Boolean))];
  const roles = ["all", ...new Set(profiles.map(p => p.role).filter(Boolean))];

  // Filter profiles for flat directory
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === "all" || p.department?.toLowerCase() === deptFilter.toLowerCase();
    const matchesLoc = locationFilter === "all" || p.location?.toLowerCase() === locationFilter.toLowerCase();
    const matchesDesig = designationFilter === "all" || p.designation?.toLowerCase() === designationFilter.toLowerCase();
    const matchesRole = roleFilter === "all" || p.role?.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesDept && matchesLoc && matchesDesig && matchesRole;
  });

  const hasActiveFilters = Boolean(
    searchQuery ||
    deptFilter !== "all" ||
    locationFilter !== "all" ||
    designationFilter !== "all" ||
    roleFilter !== "all"
  );


  // Hierarchy Data Extraction
  const admin = profiles.find(p => p.role === "admin");
  const managers = profiles.filter(p => p.role === "manager");
  const employees = profiles.filter(p => p.role === "employee");
  const summaryCards = [
    { label: "Total Profiles", value: profiles.length, tone: "blue" },
    { label: "Managers", value: managers.length, tone: "green" },
    { label: "Employees", value: employees.length, tone: "amber" },
    { label: "View Mode", value: viewMode === "directory" ? "Directory" : "Hierarchy", tone: "accent" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[linear-gradient(135deg,rgba(91,156,246,0.08),rgba(200,240,96,0.08),rgba(255,255,255,0.02))] p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(200,240,96,0.20),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(91,156,246,0.15),transparent_32%)]" />
        <div className="relative z-[1] flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text2)] mb-3">
              <UserCheck className="w-3.5 h-3.5 text-[var(--accent)]" /> Admin organization center
            </div>
            <h2 className="text-[28px] font-semibold text-[var(--text1)] tracking-tight flex items-center gap-2">
              <Users className="w-7 h-7 text-[var(--accent)] shrink-0" />
              Employee Directory
            </h2>
            <p className="text-[13.5px] text-[var(--text2)] mt-2 max-w-xl">Review every profile, navigate the reporting tree, and switch between hierarchy and directory views without losing context.</p>
          </div>

          <div className="flex bg-[var(--surface2)] border border-[var(--border)] p-1 rounded-xl self-start shadow-sm">
          <button 
            onClick={() => setViewMode("hierarchy")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-[12.5px] font-medium transition flex items-center gap-1.5",
              viewMode === "hierarchy" 
                ? "bg-[var(--surface)] text-[var(--text1)] shadow-sm border border-[var(--border)]" 
                : "text-[var(--text3)] hover:text-[var(--text1)]"
            )}
          >
            <GitBranch className="w-3.5 h-3.5 shrink-0" />
            Hierarchy View
          </button>
          <button 
            onClick={() => setViewMode("directory")}
            className={cn(
              "px-3.5 py-1.5 rounded-md text-[12.5px] font-medium transition flex items-center gap-1.5",
              viewMode === "directory" 
                ? "bg-[var(--surface)] text-[var(--text1)] shadow-sm border border-[var(--border)]" 
                : "text-[var(--text3)] hover:text-[var(--text1)]"
            )}
          >
            <Users className="w-3.5 h-3.5" />
            Directory List
          </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
            <div className="text-[11px] uppercase tracking-wider text-[var(--text3)] mb-1">{card.label}</div>
            <div className="text-[22px] font-semibold text-[var(--text1)]">{card.value}</div>
          </div>
        ))}
      </div>

      {/* --- 📋 FLAT DIRECTORY LIST VIEW --- */}
      {viewMode === "directory" && (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          {/* Filters Row */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-3 w-full max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text3)]" />
                <input 
                  type="text" 
                  placeholder="Search name, email, designation..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-9 text-[var(--text1)]"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="form-select w-auto py-1.5 text-[12.5px] text-[var(--text1)]">
                <option value="all">All Departments</option>
                {departments.filter(d => d !== "all").map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="form-select w-auto py-1.5 text-[12.5px] text-[var(--text1)]">
                <option value="all">All Locations</option>
                {locations.filter(l => l !== "all").map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={designationFilter} onChange={(e) => setDesignationFilter(e.target.value)} className="form-select w-auto py-1.5 text-[12.5px] text-[var(--text1)]">
                <option value="all">All Designations</option>
                {designations.filter(d => d !== "all").map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="form-select w-auto py-1.5 text-[12.5px] text-[var(--text1)] capitalize">
                <option value="all">All Roles</option>
                {roles.filter(r => r !== "all").map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDeptFilter("all");
                    setLocationFilter("all");
                    setDesignationFilter("all");
                    setRoleFilter("all");
                  }}
                  className="tb-btn tb-btn-ghost px-3 py-1.5 text-[12px]"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-4 py-3 text-[12.5px] text-[var(--text2)]">
            <div>
              Showing <span className="font-semibold text-[var(--text1)]">{filteredProfiles.length}</span> of <span className="font-semibold text-[var(--text1)]">{profiles.length}</span> profiles
            </div>
            {hasActiveFilters && <span className="badge badge-accent">Filtered view</span>}
          </div>

          {/* Directory Table */}
          <div className="enterprise-table-wrapper border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface2)] mt-4">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface2)]">
                  <th className="enterprise-table-th text-[var(--text2)]">Employee</th>
                  <th className="enterprise-table-th text-[var(--text2)]">Role Designation</th>
                  <th className="enterprise-table-th text-[var(--text2)]">Department</th>
                  <th className="enterprise-table-th text-[var(--text2)]">Office Location</th>
                  <th className="enterprise-table-th text-[var(--text2)]">Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="enterprise-table-td text-center py-12 text-[var(--text3)]">
                      No records matched the filter query.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((p) => (
                    <tr key={p.id} className="enterprise-table-tr border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface2)] transition">
                      <td className="enterprise-table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[var(--surface2)] border border-[var(--border)] text-[var(--blue)] font-bold text-[12px] flex items-center justify-center shrink-0">
                            {p.avatar || p.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-[13.5px] text-[var(--text1)]">{p.name}</div>
                            <div className="text-[11.5px] text-[var(--text2)] font-mono flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-[var(--text3)]" /> {p.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="enterprise-table-td">
                        <span className="text-[13px] text-[var(--text1)] font-medium">{p.designation}</span>
                      </td>
                      <td className="enterprise-table-td">
                        <span className="badge badge-neutral capitalize text-[var(--text1)]">{p.department}</span>
                      </td>
                      <td className="enterprise-table-td text-[13px] text-[var(--text2)]">
                        <div className="flex items-center gap-1 text-[var(--text1)]">
                          <MapPin className="w-3 h-3 text-[var(--text3)]" /> {p.location || "Mumbai"}
                        </div>
                      </td>
                      <td className="enterprise-table-td font-mono text-[12.5px] text-[var(--text1)]">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[var(--text3)]" /> {p.phone || "+91 99999 99999"}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- 📊 CONNECTED HIERARCHY TREE VIEW --- */}
      {viewMode === "hierarchy" && (
        <div className="flex flex-col items-center gap-5 py-6 w-full overflow-x-auto min-w-[600px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center justify-between gap-3 w-full max-w-[800px] px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface2)] text-[12.5px] text-[var(--text2)]">
            <div>
              Click a manager card to collapse or expand that branch.
            </div>
            <span className="badge badge-neutral">{managers.length} teams</span>
          </div>

          {/* Tier 1: Admin */}
          {admin && (
            <div className="flex flex-col items-center relative pb-8">
              <div className="org-card border border-[var(--accent-border)] bg-[var(--accent-bg)] shadow-[0_0_15px_rgba(200,240,96,0.03)] p-4 rounded-xl w-[260px] relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--surface)] text-[var(--accent)] font-bold text-[14px] flex items-center justify-center border border-[var(--accent-border)] shrink-0">
                  {admin.avatar || 'SA'}
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[var(--text1)]">{admin.name}</h4>
                  <p className="text-[11.5px] text-[var(--text2)] mt-0.5">{admin.designation}</p>
                  <span className="inline-block px-1.5 py-0.5 mt-1.5 rounded text-[10px] bg-[var(--surface)] text-[var(--text1)] border border-[var(--border)] font-semibold uppercase tracking-wider">
                    {admin.department}
                  </span>
                </div>
              </div>

              {/* Central vertical link line down to Tier 2 */}
              <div className="absolute bottom-0 left-1/2 w-[1px] h-8 bg-[var(--border2)] -translate-x-1/2" />
            </div>
          )}

          {/* Branch Header Link (Horizontal spans between Rahul & Shreya) */}
          <div className="relative w-full max-w-[560px] flex justify-between h-[1px]">
            <div className="absolute left-1/4 right-1/4 top-0 h-[1px] bg-[var(--border2)]" />
            <div className="absolute left-1/4 top-0 w-[1px] h-6 bg-[var(--border2)]" />
            <div className="absolute right-1/4 top-0 w-[1px] h-6 bg-[var(--border2)]" />
          </div>

          {/* Tier 2: Managers ( राहुल & श्रेया ) */}
          <div className="flex justify-around w-full max-w-[800px] mt-6 gap-8 items-start">
            {managers.map((mgr) => {
              const directReports = employees.filter(e => e.manager_id === mgr.id);
              const isCollapsed = collapsedManagers[mgr.id];

              return (
                <div key={mgr.id} className="flex flex-col items-center w-1/2 relative">
                  {/* Manager Card */}
                  <div 
                    onClick={() => toggleManager(mgr.id)}
                    className={cn(
                      "org-card border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border2)] p-4 rounded-xl w-[260px] relative z-10 flex items-center gap-3 cursor-pointer shadow-lg transition duration-200",
                      !isCollapsed && "shadow-[var(--blue-bg)]"
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--surface2)] text-[var(--blue)] font-bold text-[14px] flex items-center justify-center border border-[var(--border)] shrink-0">
                      {mgr.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-bold text-[var(--text1)] truncate">{mgr.name}</h4>
                      <p className="text-[11.5px] text-[var(--text2)] mt-0.5 truncate">{mgr.designation}</p>
                      
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--blue-bg)] text-[var(--blue)] font-bold border border-[var(--blue-bg)]">
                          {directReports.length} Reports
                        </span>
                        <span className="text-[10px] text-[var(--text2)] flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {mgr.location?.split(',')[0]}
                        </span>
                      </div>
                    </div>

                    <button className="text-[var(--text3)] hover:text-[var(--text1)] p-0.5 bg-[var(--surface2)] rounded">
                      {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Connecting Line Down from Manager to direct reports */}
                  {!isCollapsed && directReports.length > 0 && (
                    <div className="absolute top-[72px] bottom-0 left-1/2 w-[1px] h-8 bg-[var(--border2)] -translate-x-1/2" />
                  )}

                  {/* Tier 3: Collapsible Employees Stacks under Manager */}
                  {!isCollapsed && directReports.length > 0 && (
                    <div className="flex flex-col items-center gap-3 mt-8 w-full relative pt-2">
                      {directReports.map((emp) => (
                        <div key={emp.id} className="relative flex items-center justify-center w-full">
                          {/* Horizontal small branch node connector */}
                          <div className="absolute left-[30%] right-[30%] top-1/2 h-[1px] bg-[var(--border2)] -translate-y-1/2 hidden" />
                          
                          <div className="org-card border border-[var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface3)] hover:border-[var(--border2)] p-3 rounded-lg w-[220px] shadow-sm flex items-center gap-3 transition">
                            <div className="w-8 h-8 rounded-full bg-[var(--surface)] text-[var(--text1)] font-bold text-[11px] flex items-center justify-center border border-[var(--border)] shrink-0">
                              {emp.avatar}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-[12.5px] font-semibold text-[var(--text1)] truncate">{emp.name}</h5>
                              <p className="text-[11px] text-[var(--text2)] truncate">{emp.designation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
