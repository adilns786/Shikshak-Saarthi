"use client";
import { useState } from "react";
import { auth,db as firestore } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const departments = [
  "Computer Engineering",
  "Electronics and Computer Science",
  "Automation and Robotics",
  "Masters of Computer Applications",
  "Humanities and Applied Sciences",
  "Information Technology",
];

export default function RegisterPage() {
  const [role, setRole] = useState<"faculty" | "misAdmin">("faculty");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState(departments[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Default password for faculty/admin
      const password = "12345678";
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Save extra data in Firestore
      await setDoc(doc(firestore, "users", userCredential.user.uid), {
        name,
        email,
        role,
        department: role === "faculty" ? department : "",
        createdAt: new Date(),
      });

      setMessage("User registered successfully!");
      setName("");
      setEmail("");
      setDepartment(departments[0]);
      router.push("/auth/login");
    } catch (err: any) {
      console.error(err);
      setMessage(err.message || "Error registering user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <CardTitle>Register User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label>Role</Label>
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "faculty" | "misAdmin")
                }
                className="w-full border p-2 rounded mt-1"
              >
                <option value="faculty">Faculty</option>
                <option value="misAdmin">MIS Admin</option>
              </select>
            </div>

            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {role === "faculty" && (
              <div>
                <Label>Department</Label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full border p-2 rounded mt-1"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          {message && (
            <p className="mt-2 text-center text-sm text-red-600">{message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
