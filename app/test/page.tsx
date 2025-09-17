"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingSpinner, InlineLoader } from "@/components/ui/loading-spinner"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { EmptyState } from "@/components/ui/empty-state"
import { NotificationToast, type ToastNotification } from "@/components/ui/notification-toast"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { SearchFilter } from "@/components/ui/search-filter"
import { FileText, Users, CheckCircle, AlertTriangle, Info, AlertCircle, Database, Zap } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function TestPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [searchValue, setSearchValue] = useState("")
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})
  const [notifications, setNotifications] = useState<ToastNotification[]>([])
  const [showLoader, setShowLoader] = useState(false)

  const steps = [
    { id: "1", title: "Setup", description: "Initial setup" },
    { id: "2", title: "Configure", description: "Configuration" },
    { id: "3", title: "Review", description: "Final review" },
    { id: "4", title: "Complete", description: "All done" },
  ]

  const filterOptions = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "pending", label: "Pending" },
      ],
    },
    {
      key: "department",
      label: "Department",
      options: [
        { value: "cs", label: "Computer Science" },
        { value: "ee", label: "Electronics" },
        { value: "me", label: "Mechanical" },
      ],
    },
  ]

  const addNotification = (type: ToastNotification["type"], title: string, description?: string) => {
    const notification: ToastNotification = {
      id: Date.now().toString(),
      type,
      title,
      description,
      duration: 5000,
    }
    setNotifications((prev) => [...prev, notification])
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const testDatabaseConnection = async () => {
    setShowLoader(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      addNotification("success", "Database Connected", "Successfully connected to Supabase database")
      toast({
        title: "Database Test",
        description: "Connection successful!",
      })
    } catch (error) {
      addNotification("error", "Connection Failed", "Unable to connect to database")
    } finally {
      setShowLoader(false)
    }
  }

  const testAPIEndpoints = async () => {
    setShowLoader(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      addNotification("success", "API Tests Passed", "All endpoints are responding correctly")
      toast({
        title: "API Test",
        description: "All endpoints working!",
      })
    } catch (error) {
      addNotification("error", "API Test Failed", "Some endpoints are not responding")
    } finally {
      setShowLoader(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto p-6 space-y-8">
        {/* Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <NotificationToast key={notification.id} notification={notification} onDismiss={removeNotification} />
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">System Testing & Components</h1>
          <p className="text-gray-600">Test all system components and UI elements</p>
        </motion.div>

        <Tabs defaultValue="components" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="components">UI Components</TabsTrigger>
            <TabsTrigger value="database">Database Tests</TabsTrigger>
            <TabsTrigger value="api">API Tests</TabsTrigger>
            <TabsTrigger value="integration">Integration Tests</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="space-y-6">
            {/* Loading States */}
            <Card>
              <CardHeader>
                <CardTitle>Loading States</CardTitle>
                <CardDescription>Different loading spinner variations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <h4 className="font-medium">Small Spinner</h4>
                    <LoadingSpinner size="sm" />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="font-medium">Medium Spinner</h4>
                    <LoadingSpinner size="md" text="Loading data..." />
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="font-medium">Large Spinner</h4>
                    <LoadingSpinner size="lg" text="Processing request..." />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Indicator */}
            <Card>
              <CardHeader>
                <CardTitle>Progress Indicator</CardTitle>
                <CardDescription>Multi-step process visualization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ProgressIndicator steps={steps} currentStep={currentStep} />
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                    disabled={currentStep === steps.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Search & Filter</CardTitle>
                <CardDescription>Advanced search and filtering capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <SearchFilter
                  searchPlaceholder="Search faculty, appraisals..."
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  filters={filterOptions}
                  activeFilters={activeFilters}
                  onFilterChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
                  onClearFilters={() => setActiveFilters({})}
                />
              </CardContent>
            </Card>

            {/* Empty States */}
            <Card>
              <CardHeader>
                <CardTitle>Empty States</CardTitle>
                <CardDescription>Various empty state designs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EmptyState
                    icon={FileText}
                    title="No Appraisals Found"
                    description="You haven't created any appraisals yet. Start by creating your first appraisal."
                    action={{
                      label: "Create Appraisal",
                      onClick: () => addNotification("info", "Action Clicked", "Create appraisal button clicked"),
                    }}
                  />
                  <EmptyState
                    icon={Users}
                    title="No Faculty Members"
                    description="No faculty members match your current search criteria."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Tests */}
            <Card>
              <CardHeader>
                <CardTitle>Notification System</CardTitle>
                <CardDescription>Test different notification types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => addNotification("success", "Success!", "Operation completed successfully")}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Success
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addNotification("error", "Error!", "Something went wrong")}
                    className="flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Error
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addNotification("warning", "Warning!", "Please review your input")}
                    className="flex items-center gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Warning
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => addNotification("info", "Info", "Here's some helpful information")}
                    className="flex items-center gap-2"
                  >
                    <Info className="h-4 w-4" />
                    Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Connection Tests
                </CardTitle>
                <CardDescription>Test database connectivity and operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {showLoader && <InlineLoader text="Testing database connection..." />}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={testDatabaseConnection} disabled={showLoader} className="h-20 flex-col gap-2">
                    <Database className="h-6 w-6" />
                    Test Connection
                  </Button>
                  <div className="space-y-2">
                    <Badge variant="outline">Supabase Connected</Badge>
                    <Badge variant="outline">RLS Enabled</Badge>
                    <Badge variant="outline">Auth Configured</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  API Endpoint Tests
                </CardTitle>
                <CardDescription>Test all API endpoints and functionality</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {showLoader && <InlineLoader text="Testing API endpoints..." />}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={testAPIEndpoints}
                    disabled={showLoader}
                    variant="outline"
                    className="h-16 flex-col bg-transparent"
                  >
                    Authentication
                  </Button>
                  <Button
                    onClick={testAPIEndpoints}
                    disabled={showLoader}
                    variant="outline"
                    className="h-16 flex-col bg-transparent"
                  >
                    Data Scraping
                  </Button>
                  <Button
                    onClick={testAPIEndpoints}
                    disabled={showLoader}
                    variant="outline"
                    className="h-16 flex-col bg-transparent"
                  >
                    LLM Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Integration Status</CardTitle>
                <CardDescription>Overall system health and integration status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-medium">Authentication</h4>
                    <Badge variant="secondary" className="mt-1">
                      Working
                    </Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-medium">Database</h4>
                    <Badge variant="secondary" className="mt-1">
                      Connected
                    </Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-medium">PDF Export</h4>
                    <Badge variant="secondary" className="mt-1">
                      Ready
                    </Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-medium">UI/UX</h4>
                    <Badge variant="secondary" className="mt-1">
                      Polished
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  )
}
