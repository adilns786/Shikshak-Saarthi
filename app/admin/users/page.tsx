"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db as firestore } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { AdminLayout } from "@/components/ui/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Eye,
  FileText,
  BookOpen,
  Award,
  Filter,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminManageUsersPage() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/auth/login");
        return;
      }

      try {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (!userDoc.exists()) {
          router.replace("/auth/login");
          return;
        }

        const userData = userDoc.data();

        if (userData.role !== "misAdmin" && userData.role !== "admin" && userData.role !== "hod") {
          router.replace("/dashboard");
          return;
        }

        setCurrentUser(userData);
        await fetchUsers(userData);
      } catch (err) {
        console.error("Error:", err);
        router.replace("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchUsers = async (currentUserData: any) => {
    try {
      const usersRef = collection(firestore, "users");
      let q = query(usersRef);

      // If HOD, only show their department faculty
      if (currentUserData.role === "hod") {
        q = query(usersRef, where("department", "==", currentUserData.department));
      }

      const querySnapshot = await getDocs(q);
      const usersList: any[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push({
          id: doc.id,
          ...data,
        });
      });

      setUsers(usersList);
      setFilteredUsers(usersList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Apply department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((user) => user.department === departmentFilter);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, roleFilter, departmentFilter, users]);

  const viewUserDetails = (user: any) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "misAdmin":
      case "admin":
        return "bg-red-100 text-red-700";
      case "hod":
        return "bg-purple-100 text-purple-700";
      case "faculty":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const departments = [...new Set(users.map((u) => u.department).filter(Boolean))];

  if (loading) {
    return (
      <AdminLayout user={currentUser}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-16 w-16 border-4 border-t-transparent border-blue-500 rounded-full"
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout user={currentUser}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-8 w-8 text-blue-600" />
                Manage Users
              </h1>
              <p className="text-slate-600 mt-1">
                {currentUser?.role === "hod"
                  ? `View and manage ${currentUser.department} Department faculty`
                  : "View and manage all system users"}
              </p>
            </div>
            <Badge className="text-lg px-4 py-2">
              {filteredUsers.length} Users
            </Badge>
          </div>
        </header>

        {/* Filters */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                  <SelectItem value="hod">HOD</SelectItem>
                  {currentUser?.role !== "hod" && (
                    <>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="misAdmin">MIS Admin</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-4">
          {filteredUsers.map((user, index) => {
            const publications = [
              ...(user.part_b?.table2?.publications || []),
              ...(user.part_b?.table2?.researchPapers || []),
            ];
            const patents = user.part_b?.patents_policy_awards || [];
            const projects = [
              ...(user.part_b?.table2?.researchProjects || []),
              ...(user.part_b?.table2?.consultancyProjects || []),
            ];

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                          {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-slate-900">
                              {user.name || "Unnamed User"}
                            </h3>
                            <Badge className={getRoleBadgeColor(user.role)}>
                              {user.role === "misAdmin" ? "MIS Admin" : user.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{user.email}</p>
                          {user.department && (
                            <p className="text-xs text-slate-500 mt-1">
                              {user.department} Department
                            </p>
                          )}

                          {/* Stats */}
                          <div className="flex gap-4 mt-3">
                            <div className="flex items-center gap-1 text-sm">
                              <FileText className="h-4 w-4 text-purple-600" />
                              <span className="font-medium text-purple-600">
                                {publications.length}
                              </span>
                              <span className="text-slate-600">Papers</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Award className="h-4 w-4 text-cyan-600" />
                              <span className="font-medium text-cyan-600">
                                {patents.length}
                              </span>
                              <span className="text-slate-600">Patents</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <BookOpen className="h-4 w-4 text-orange-600" />
                              <span className="font-medium text-orange-600">
                                {projects.length}
                              </span>
                              <span className="text-slate-600">Projects</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewUserDetails(user)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {filteredUsers.length === 0 && (
            <Card className="border-slate-200">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No users found
                </h3>
                <p className="text-slate-600">
                  Try adjusting your search or filters
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedUser?.name || "User Details"}
            </DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Role</p>
                  <Badge className={getRoleBadgeColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                </div>
                {selectedUser.department && (
                  <div>
                    <p className="text-sm text-slate-600">Department</p>
                    <p className="font-medium">{selectedUser.department}</p>
                  </div>
                )}
                {selectedUser.designation && (
                  <div>
                    <p className="text-sm text-slate-600">Designation</p>
                    <p className="font-medium">{selectedUser.designation}</p>
                  </div>
                )}
              </div>

              {/* Research Papers */}
              {selectedUser.part_b?.table2?.researchPapers?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Research Papers</h3>
                  <div className="space-y-2">
                    {selectedUser.part_b.table2.researchPapers.map(
                      (paper: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                        >
                          <p className="font-medium text-sm">{paper.title}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {paper.journal} • {paper.year}
                          </p>
                          {paper.impact_factor && (
                            <Badge variant="secondary" className="mt-2 text-xs">
                              IF: {paper.impact_factor}
                            </Badge>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Publications */}
              {selectedUser.part_b?.table2?.publications?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Publications</h3>
                  <div className="space-y-2">
                    {selectedUser.part_b.table2.publications.map(
                      (pub: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-purple-50 rounded-lg border border-purple-200"
                        >
                          <p className="font-medium text-sm">{pub.title}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {pub.publisher} • {pub.year} • {pub.type}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Patents */}
              {selectedUser.part_b?.patents_policy_awards?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Patents & Awards</h3>
                  <div className="space-y-2">
                    {selectedUser.part_b.patents_policy_awards.map(
                      (patent: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-cyan-50 rounded-lg border border-cyan-200"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">{patent.title}</p>
                              <p className="text-xs text-slate-600 mt-1">
                                {patent.category} • {patent.status} • {patent.year}
                              </p>
                            </div>
                            <Badge variant="secondary">{patent.category}</Badge>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Research Projects */}
              {selectedUser.part_b?.table2?.researchProjects?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Research Projects</h3>
                  <div className="space-y-2">
                    {selectedUser.part_b.table2.researchProjects.map(
                      (project: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                        >
                          <p className="font-medium text-sm">{project.title}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            {project.funding_agency} • ₹{project.amount} • {project.role}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
