// components/layouts/MobileLayout.tsx
import { ReactNode, useState } from 'react'
import { LayoutGrid, PieChart, Settings, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileAnalytics } from "@/components/mobile/MobileAnalytics"
import { Service } from "@/types/service"
import { MobileServiceDiscovery } from "@/components/mobile/MobileServiceDiscovery"

interface MobileLayoutProps {
  children: ReactNode
  title?: string
  selectedServices?: Service[]
  servicePlans?: Array<{
    serviceId: string
    planIndex: number
  }>
  onServicesChange?: (services: Service[]) => void
  availableServices?: Service[]
}

export function MobileLayout({ 
  children, 
  title = "Apicus",
  selectedServices = [],
  servicePlans = [],
  onServicesChange = () => {},
  availableServices = []
}: MobileLayoutProps) {
  const [activeTab, setActiveTab] = useState('stack')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="flex items-center justify-center p-4">
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
      </header>

      {/* Mobile Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'stack' && children}
        {activeTab === 'add' && (
          <div className="p-4">
            <MobileServiceDiscovery
              availableServices={availableServices}
              selectedServices={selectedServices}
              onAddService={(service) => {
                onServicesChange([...selectedServices, service])
                setActiveTab('stack')
              }}
            />
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="p-4">
            <MobileAnalytics 
              services={selectedServices}
              servicePlans={servicePlans}
            />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex items-center justify-around p-2">
          <Button
            variant={activeTab === 'stack' ? 'default' : 'ghost'}
            size="sm"
            className="flex-col gap-1 h-auto py-2"
            onClick={() => setActiveTab('stack')}
          >
            <LayoutGrid className="h-5 w-5" />
            <span className="text-xs">Stack</span>
          </Button>

          <Button
            variant={activeTab === 'add' ? 'default' : 'ghost'}
            size="sm"
            className="flex-col gap-1 h-auto py-2"
            onClick={() => setActiveTab('add')}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs">Add</span>
          </Button>

          <Button
            variant={activeTab === 'analytics' ? 'default' : 'ghost'}
            size="sm"
            className="flex-col gap-1 h-auto py-2"
            onClick={() => setActiveTab('analytics')}
          >
            <PieChart className="h-5 w-5" />
            <span className="text-xs">Analytics</span>
          </Button>

          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            size="sm"
            className="flex-col gap-1 h-auto py-2"
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}