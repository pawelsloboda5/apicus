import { StackBuilder } from "@/components/StackBuilder"
import clientPromise from "@/lib/mongodb"
import { useState } from "react"
import { Service } from "@/types/service"

interface HomeProps {
  services: Service[]
  error: string | null
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

export default function Home({ services = [], error }: HomeProps) {
  const [selectedServices, setSelectedServices] = useState<Service[]>([])

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="p-8 space-y-8">
      <StackBuilder 
        availableServices={services} 
        selectedServices={selectedServices}
        onServicesChange={setSelectedServices}
      />
    </div>
  )
}
