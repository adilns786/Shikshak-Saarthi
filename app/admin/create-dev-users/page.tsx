"use client";

import { useState } from "react";
import { auth, db as firestore } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Loader2, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

const DEV_USERS = [
  {
    email: 'd2022.darshan.khapekar@ves.ac.in',
    password: '123456789',
    name: 'Darshan Khapekar',
    role: 'faculty',
    department: 'Computer',
    designation: 'Assistant Professor',
    employee_id: 'FAC001',
    fullData: {
      formHeader: {
        academic_year: "2025-26",
        cas_promotion_stage: "Stage 1",
        department_name: "Computer",
        faculty_name: "Faculty of Engineering and Technology",
        institute_name: "Vivekanand Education Society's Institute of Technology",
        name: "Darshan Khapekar"
      },
      part_a: {
        academic_qualifications: [
          {
            board_university: "Mumbai University",
            class_division: "First Class",
            examination: "BE",
            percentage: "85",
            subject: "Computer Engineering",
            year_passing: "2020"
          }
        ],
        courses_fdp: [],
        employment: {
          posts: [],
          prior: []
        },
        personal_in: {
          address: "Mumbai, Maharashtra",
          current_designation: "Assistant Professor",
          date_eligibility: "2025-01-01",
          date_last_promotion: "2024-01-01",
          department: "Computer",
          designation_applied: "Associate Professor",
          email: "d2022.darshan.khapekar@ves.ac.in",
          level_cas: "Stage 1",
          name: "Darshan Khapekar",
          telephone: "9876543210"
        },
        research_degrees: [],
        teaching_research_experience: {
          pg_years: "3",
          research_years: "1",
          specialization: "Artificial Intelligence",
          ug_years: "2"
        },
        teaching_student_assessment: {
          activities: [],
          teaching: []
        }
      },
      part_b: {
        invited_lectures: [],
        patents_policy_awards: [],
        table2: {
          consultancyProjects: [],
          ictInnovations: [],
          publications: [],
          researchGuidance: [],
          researchPapers: [],
          researchProjects: []
        }
      }
    }
  },
  {
    email: 'admin@ves.ac.in',
    password: '123456789',
    name: 'Admin User',
    role: 'misAdmin',
    department: 'Computer',
    designation: 'Administrator',
    employee_id: 'ADM001',
    fullData: {
      formHeader: {
        academic_year: "2025-26",
        cas_promotion_stage: "Admin",
        department_name: "Computer",
        faculty_name: "Faculty of Engineering and Technology",
        institute_name: "Vivekanand Education Society's Institute of Technology",
        name: "Admin User"
      },
      part_a: {
        academic_qualifications: [],
        courses_fdp: [],
        employment: {
          posts: [],
          prior: []
        },
        personal_in: {
          address: "Mumbai, Maharashtra",
          current_designation: "Administrator",
          date_eligibility: "2025-01-01",
          date_last_promotion: "2024-01-01",
          department: "Computer",
          designation_applied: "Administrator",
          email: "admin@ves.ac.in",
          level_cas: "N/A",
          name: "Admin User",
          telephone: "9876543211"
        },
        research_degrees: [],
        teaching_research_experience: {
          pg_years: "0",
          research_years: "0",
          specialization: "Administration",
          ug_years: "0"
        },
        teaching_student_assessment: {
          activities: [],
          teaching: []
        }
      },
      part_b: {
        invited_lectures: [],
        patents_policy_awards: [],
        table2: {
          consultancyProjects: [],
          ictInnovations: [],
          publications: [],
          researchGuidance: [],
          researchPapers: [],
          researchProjects: []
        }
      }
    }
  },
  {
    email: 'nupur.giri@ves.ac.in',
    password: '123456789',
    name: 'Nupur Giri',
    role: 'hod',
    department: 'Computer',
    designation: 'Head of Department',
    employee_id: 'HOD001',
    fullData: {
      formHeader: {
        academic_year: "2025-26",
        cas_promotion_stage: "Stage 3",
        department_name: "Computer",
        faculty_name: "Faculty of Engineering and Technology",
        institute_name: "Vivekanand Education Society's Institute of Technology",
        name: "Nupur Giri"
      },
      part_a: {
        academic_qualifications: [
          {
            board_university: "Mumbai University",
            class_division: "First Class with Distinction",
            examination: "ME",
            percentage: "90",
            subject: "Computer Engineering",
            year_passing: "2015"
          }
        ],
        courses_fdp: [],
        employment: {
          posts: [],
          prior: []
        },
        personal_in: {
          address: "Mumbai, Maharashtra",
          current_designation: "Head of Department",
          date_eligibility: "2025-01-01",
          date_last_promotion: "2023-01-01",
          department: "Computer",
          designation_applied: "Professor",
          email: "nupur.giri@ves.ac.in",
          level_cas: "Stage 3",
          name: "Nupur Giri",
          telephone: "9876543212"
        },
        research_degrees: [],
        teaching_research_experience: {
          pg_years: "8",
          research_years: "5",
          specialization: "Computer Networks",
          ug_years: "5"
        },
        teaching_student_assessment: {
          activities: [],
          teaching: []
        }
      },
      part_b: {
        invited_lectures: [],
        patents_policy_awards: [],
        table2: {
          consultancyProjects: [],
          ictInnovations: [],
          publications: [],
          researchGuidance: [],
          researchPapers: [],
          researchProjects: []
        }
      }
    }
  },
];

export default function CreateDevUsersPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const createUser = async (userData: typeof DEV_USERS[0]) => {
    try {
      // Try to create user in Firebase Auth
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );

        // Create Firestore document with complete PBAS structure
        await setDoc(doc(firestore, "users", userCredential.user.uid), {
          email: userData.email,
          name: userData.name,
          full_name: userData.name,
          role: userData.role,
          department: userData.department,
          designation: userData.designation,
          employee_id: userData.employee_id,
          phone: '',
          createdAt: new Date(),
          is_active: true,
          // Complete PBAS data structure
          formHeader: userData.fullData.formHeader,
          part_a: userData.fullData.part_a,
          part_b: userData.fullData.part_b,
        });

        return { 
          success: true, 
          message: `Created ${userData.role}: ${userData.email}`,
          action: 'created'
        };
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          // User exists, just update Firestore
          const usersRef = collection(firestore, 'users');
          const q = query(usersRef, where('email', '==', userData.email));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userId = querySnapshot.docs[0].id;
            await updateDoc(doc(firestore, "users", userId), {
              name: userData.name,
              full_name: userData.name,
              role: userData.role,
              department: userData.department,
              designation: userData.designation,
              employee_id: userData.employee_id,
              is_active: true,
              // Update complete PBAS data structure
              formHeader: userData.fullData.formHeader,
              part_a: userData.fullData.part_a,
              part_b: userData.fullData.part_b,
            });
            
            return { 
              success: true, 
              message: `Updated existing user: ${userData.email}`,
              action: 'updated'
            };
          }
          
          return { 
            success: false, 
            message: `User ${userData.email} exists in Auth but not in Firestore. Please fix manually.`,
            action: 'error'
          };
        }
        throw authError;
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: `Failed: ${error.message}`,
        action: 'failed'
      };
    }
  };

  const handleCreateAll = async () => {
    setIsCreating(true);
    setResults([]);
    
    const newResults = [];
    for (const user of DEV_USERS) {
      const result = await createUser(user);
      newResults.push({ ...user, ...result });
      setResults([...newResults]);
      
      // Small delay between creations
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-white flex items-center gap-3">
              <UserPlus className="h-8 w-8" />
              Create Dev Users
            </CardTitle>
            <p className="text-gray-300 mt-2">
              This tool creates 3 development users for testing purposes
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* User List */}
            <div className="space-y-3">
              {DEV_USERS.map((user, index) => (
                <div
                  key={user.email}
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{user.name}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        Role: {user.role} | Dept: {user.department} | Password: {user.password}
                      </p>
                    </div>
                    {results[index] && (
                      <div className="flex items-center gap-2">
                        {results[index].success ? (
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-400" />
                        )}
                      </div>
                    )}
                  </div>
                  {results[index] && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`text-sm mt-2 ${
                        results[index].success ? 'text-green-300' : 'text-red-300'
                      }`}
                    >
                      {results[index].message}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>

            {/* Action Button */}
            <Button
              onClick={handleCreateAll}
              disabled={isCreating}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-6 rounded-lg shadow-lg transform transition-all hover:scale-105"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creating Users...
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create All Dev Users
                </>
              )}
            </Button>

            {/* Summary */}
            {results.length > 0 && !isCreating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <h3 className="font-semibold text-white mb-2">Summary</h3>
                <p className="text-sm text-gray-300">
                  ✅ Successful: {results.filter(r => r.success).length}/{results.length}
                </p>
                {results.filter(r => !r.success).length > 0 && (
                  <p className="text-sm text-red-300">
                    ❌ Failed: {results.filter(r => !r.success).length}
                  </p>
                )}
              </motion.div>
            )}

            {/* Instructions */}
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <h4 className="font-semibold text-blue-300 mb-2">Instructions:</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Click "Create All Dev Users" to create all 3 test accounts</li>
                <li>• If users already exist, their Firestore profiles will be updated</li>
                <li>• All users have password: <code className="bg-white/10 px-2 py-0.5 rounded">123456789</code></li>
                <li>• After creation, you can login with these accounts from the login page</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
