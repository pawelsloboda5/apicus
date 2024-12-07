// pages/index.tsx
import { StackBuilder } from "@/components/StackBuilder"
import { MobileStackBuilder } from "@/components/mobile/MobileStackBuilder"
import { MobileLayout } from "@/components/layouts/MobileLayout"
import clientPromise from "@/lib/mongodb"
import { useState, useEffect } from "react"
import { Service } from "@/types/service"
import{ TechStackSuggestions } from "@/components/TechStackSuggestions"

interface HomeProps {
  services: Service[]
  error: string | null
  isMobile: boolean
}

export async function getServerSideProps() {
  try {
    const client = await clientPromise
    const db = client.db("apicus_NodeJS_Express")

    const data = await db
      .collection("processedForVectorization")
      .find({})
      .sort({ "metadata.service_name": 1 })
      .toArray()

    return {
      props: {
        services: JSON.parse(JSON.stringify(data)),
        error: null
      }
    }
  } catch (error) {
    console.error("Failed to fetch data:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to load data"
    
    return {
      props: {
        services: [],
        error: `Error fetching services: ${errorMessage}`
      }
    }
  }
}

export default function Home({ services = [], error, isMobile }: HomeProps) {
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [servicePlans, setServicePlans] = useState<Array<{
    serviceId: string;
    planIndex: number;
  }>>([])
 const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const currentServiceIds = servicePlans.map(sp => sp.serviceId)
    const newServices = selectedServices.filter(s => !currentServiceIds.includes(s._id))
    
    if (newServices.length > 0) {
      setServicePlans(prev => [
        ...prev,
        ...newServices.map(s => ({ serviceId: s._id, planIndex: 0 }))
      ])
    }

    setServicePlans(prev => 
      prev.filter(sp => selectedServices.some(s => s._id === sp.serviceId))
    )
  }, [selectedServices])

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  if (!hasStarted) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <TechStackSuggestions
          availableServices={services}
          onStackSelect={(stack) => {
            setSelectedServices(stack)
            setHasStarted(true)
          }}
        />
      </div>
    )
  }

  if (isMobile) {
    return (
      <MobileLayout 
        title="Build Your Stack"
        selectedServices={selectedServices}
        servicePlans={servicePlans}
        onServicesChange={setSelectedServices}
        availableServices={services}
      >
        <MobileStackBuilder
          availableServices={services}
          selectedServices={selectedServices}
          onServicesChange={setSelectedServices}
          servicePlans={servicePlans}
          onServicePlansChange={setServicePlans}
        />
      </MobileLayout>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <StackBuilder
        availableServices={services}
        selectedServices={selectedServices}
        onServicesChange={setSelectedServices}
        servicePlans={servicePlans}
        setServicePlans={setServicePlans}
      />
    </div>
  )
}
