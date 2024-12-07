import { Service } from "@/types/service"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MobileServiceNavProps {
  services: Service[]
  currentIndex: number
  onNavigate: (index: number) => void
}

export function MobileServiceNav({ services, currentIndex, onNavigate }: MobileServiceNavProps) {
  return (
    <div className="flex items-center justify-between py-2 px-4 bg-white border-b">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(currentIndex - 1)}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>
      
      <span className="text-sm font-medium">
        {currentIndex + 1} of {services.length}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate(currentIndex + 1)}
        disabled={currentIndex === services.length - 1}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
} 