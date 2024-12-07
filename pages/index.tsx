import { StackBuilder } from "@/components/StackBuilder"
import { StackAnalytics } from "@/components/StackAnalytics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import clientPromise from "@/lib/mongodb"
import { useState } from "react"

export async function getServerSideProps() {
  try {
    const client = await clientPromise
    const db = client.db("apicus_NodeJS_Express")

    // Get total count of services
    const totalCount = await db
      .collection("processedForVectorization")
      .countDocuments()

    console.log(`Total services in database: ${totalCount}`)

    const data = await db
      .collection("processedForVectorization")
      .find({})
      .sort({ "metadata.service_name": 1 })  // Sort alphabetically by service name
      .toArray()

    console.log(`Retrieved ${data.length} services`)
    console.log('Available services:', data.map(s => s.metadata.service_name))

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

export default function Home({ services = [], error }: { services?: any[], error?: string | null }) {
  const [selectedServices, setSelectedServices] = useState<any[]>([])

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Build Your Tech Stack</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-10 w-[250px]"
            />
          </div>
        </div>
      </div>

      <StackBuilder 
        availableServices={services} 
        selectedServices={selectedServices}
        onServicesChange={setSelectedServices}
      />
    </div>
  )
}
