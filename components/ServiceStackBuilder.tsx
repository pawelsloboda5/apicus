// components/ServiceStackBuilder.tsx
"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Service } from "@/types/service"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { 
  Search, X, Plus, 
  Server, Shield, Activity, 
  Database, Zap,
  Users, Box
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface ServiceStackBuilderProps {
  initialServices: Service[]
  onServicesChange: (services: Service[]) => void
}

const ITEMS_PER_PAGE = {
  sm: 6,
  md: 9,
  lg: 12,
  xl: 15
}

const SERVICE_CATEGORIES = [
  { id: 'all', name: 'All Services', icon: undefined },
  { id: 'infrastructure', name: 'Infrastructure', icon: Server },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'monitoring', name: 'Monitoring', icon: Activity },
  { id: 'database', name: 'Database', icon: Database },
  { id: 'api', name: 'APIs', icon: Zap },
  { id: 'collaboration', name: 'Collaboration', icon: Users },
  { id: 'devops', name: 'DevOps', icon: Box },
] as const

export function ServiceStackBuilder({ 
  initialServices,
  onServicesChange 
}: ServiceStackBuilderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [priceRange] = useState<[number, number]>([0, 1000])
  const [viewMode] = useState<'grid' | 'list'>('grid')
  const [screenSize] = useState(getScreenSize())

  // Screen size detection
  function getScreenSize(): keyof typeof ITEMS_PER_PAGE {
    if (typeof window === 'undefined') return 'lg'
    if (window.innerWidth >= 1536) return 'xl'
    if (window.innerWidth >= 1280) return 'lg'
    if (window.innerWidth >= 768) return 'md'
    return 'sm'
  }

  // Filtered and paginated services
  const filteredServices = useMemo(() => {
    return initialServices.filter(service => {
      const nameMatch = service.metadata.service_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
      
      const categoryMatch = selectedCategory === 'all' || 
        service.metadata.pricing_types.some(type => 
          type.toLowerCase().includes(selectedCategory.toLowerCase())
        )

      const priceMatch = service.enhanced_data.plans.some(plan => {
        const price = plan.pricing?.monthly?.base_price || 0
        return price >= priceRange[0] && price <= priceRange[1]
      })

      return nameMatch && categoryMatch && priceMatch
    })
  }, [initialServices, searchQuery, selectedCategory, priceRange])

  const paginatedServices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE[screenSize]
    return filteredServices.slice(startIndex, startIndex + ITEMS_PER_PAGE[screenSize])
  }, [filteredServices, currentPage, screenSize])

  const totalPages = Math.ceil(filteredServices.length / ITEMS_PER_PAGE[screenSize])

  const handleServiceSelect = (service: Service) => {
    const newServices = [...selectedServices, service]
    setSelectedServices(newServices)
    onServicesChange(newServices)
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
      <div className="relative">
        {/* Search and Filters Section */}
        <div className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700 p-4">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search services..."
                  className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {SERVICE_CATEGORIES.map(category => (
                    <SelectItem 
                      key={category.id} 
                      value={category.id}
                      className="text-slate-100 focus:bg-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        {category.icon && <category.icon className="h-4 w-4" />}
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedCategory !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="bg-slate-700 text-slate-100"
                >
                  {SERVICE_CATEGORIES.find(c => c.id === selectedCategory)?.name}
                  <X 
                    className="ml-2 h-3 w-3 cursor-pointer" 
                    onClick={() => setSelectedCategory('all')}
                  />
                </Badge>
              )}
              {searchQuery && (
                <Badge 
                  variant="secondary"
                  className="bg-slate-700 text-slate-100"
                >
                  Search: {searchQuery}
                  <X 
                    className="ml-2 h-3 w-3 cursor-pointer" 
                    onClick={() => setSearchQuery('')}
                  />
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="max-w-7xl mx-auto p-4">
          <div className={cn(
            "grid gap-4",
            viewMode === 'grid' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            viewMode === 'list' && "grid-cols-1"
          )}>
            {paginatedServices.map(service => (
              <ServiceCard
                key={service._id}
                service={service}
                onSelect={() => handleServiceSelect(service)}
                isSelected={selectedServices.some(s => s._id === service._id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  className={cn(
                    "bg-slate-800 border-slate-700 text-slate-100",
                    page === currentPage && "bg-blue-600 hover:bg-blue-700"
                  )}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ServiceCardProps {
  service: Service
  onSelect: () => void
  isSelected: boolean
}

function ServiceCard({ service, onSelect, isSelected }: ServiceCardProps) {
  const lowestPrice = useMemo(() => {
    const prices = service.enhanced_data.plans
      .filter(plan => plan?.pricing?.monthly?.base_price)
      .map(plan => plan.pricing.monthly.base_price)
    return prices.length > 0 ? Math.min(...prices) : null
  }, [service])

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-200",
      "bg-slate-800/50 border-slate-700 hover:bg-slate-800/80",
      "backdrop-blur-sm",
      isSelected && "ring-2 ring-blue-500"
    )}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-slate-100 group-hover:text-white">
              {service.metadata.service_name}
            </h3>
            {lowestPrice !== null && (
              <p className="text-sm text-slate-400 group-hover:text-slate-300">
                From ${lowestPrice}/mo
              </p>
            )}
          </div>
          <Button
            size="sm"
            className={cn(
              "transition-opacity",
              isSelected ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-700 hover:bg-slate-600"
            )}
            onClick={onSelect}
            disabled={isSelected}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {service.metadata.pricing_types.map((type, i) => (
            <Badge 
              key={i}
              variant="secondary"
              className="bg-slate-700 text-slate-300"
            >
              {type}
            </Badge>
          ))}
        </div>

        {service.enhanced_data.market_insights?.target_market && (
          <p className="mt-3 text-sm text-slate-400 line-clamp-2">
            {service.enhanced_data.market_insights.target_market}
          </p>
        )}
      </div>
    </Card>
  )
}
