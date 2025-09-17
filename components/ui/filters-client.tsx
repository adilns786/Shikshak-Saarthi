"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"

interface FiltersProps {
  searchParams: { role?: string; search?: string }
}

export function Filters({ searchParams }: FiltersProps) {
  const router = useRouter()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(window.location.search)
    if (term) {
      params.set("search", term)
    } else {
      params.delete("search")
    }
    router.replace(`/admin/users?${params.toString()}`)
  }, 300)

  const handleRoleChange = (role: string) => {
    const params = new URLSearchParams(window.location.search)
    if (role === "all") {
      params.delete("role")
    } else {
      params.set("role", role)
    }
    router.replace(`/admin/users?${params.toString()}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, department, or employee ID..."
                className="pl-10"
                defaultValue={searchParams.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <Select defaultValue={searchParams.role || "all"} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="faculty">Faculty</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => router.replace("/admin/users")}>
            <Filter className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}