"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  disabled?: boolean
}

export function DatePicker({ date, setDate, disabled }: DatePickerProps) {
  // Add a client-side state that mirrors the server-side date
  // This prevents hydration mismatches by only using the real date after hydration
  const [clientDate, setClientDate] = useState<Date | undefined>(undefined)
  const [mounted, setMounted] = useState(false)
  
  // After component mounts (client-side), we sync the states
  useEffect(() => {
    setMounted(true)
    setClientDate(date)
  }, [date])
  
  // Handler to update both states when a new date is selected
  const handleDateChange = (newDate: Date | undefined) => {
    setClientDate(newDate)
    setDate(newDate)
  }
  
  // Only display the actual value after mounting
  const displayDate = mounted ? clientDate : undefined
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayDate && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayDate ? (
            <span>{format(displayDate, "PPP")}</span>
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={displayDate}
          onSelect={handleDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
} 