"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface FilterOption {
  key: string
  label: string
  options: Array<{ value: string; label: string }>
}

interface SearchFilterProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: FilterOption[]
  activeFilters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void
  className?: string
}

export function SearchFilter({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  filters = [],
  activeFilters,
  onFilterChange,
  onClearFilters,
  className,
}: SearchFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length

  return (
    <div className={className}>
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {filters.length > 0 && (
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Filters</h4>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={onClearFilters}>
                      Clear all
                    </Button>
                  )}
                </div>

                {filters.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    <label className="text-sm font-medium">{filter.label}</label>
                    <Select
                      value={activeFilters[filter.key] || "all"}
                      onValueChange={(value) => onFilterChange(filter.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2 mt-3 flex-wrap"
        >
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || value === "all") return null
            const filter = filters.find((f) => f.key === key)
            const option = filter?.options.find((o) => o.value === value)
            return (
              <Badge key={key} variant="secondary" className="gap-1">
                {filter?.label}: {option?.label || value}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 ml-1 hover:bg-transparent"
                  onClick={() => onFilterChange(key, "all")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
