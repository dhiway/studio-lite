import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"


type DateSwitchProps = {
  className?: string;
  onToggleChange?: (isOn: boolean) => void;
  onDateChange?: (date: Date | undefined) => void;
};

export default function DateSwitch({ className, onToggleChange, onDateChange }: DateSwitchProps) {
  const [isOn, setIsOn] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggleChange) onToggleChange(newState);
  };

  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  return (
    <div
      className={`${className} 
        relative flex items-center
        w-[200px] h-[40px]
        rounded-full
        bg-[#2b2b2b]
        border border-[#3b3b3b] 
        transition-all duration-300
        p-1
      `}
    >
      {/* Content Area - Swaps based on state */}
      <div className={`flex-1 flex items-center ${isOn ? 'justify-start pl-4' : 'justify-end pr-6'} h-full transition-all duration-300`}>
        {isOn ? (
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-left text-white text-sm font-medium focus:outline-none hover:text-gray-300 transition-colors">
                {date ? format(date, "dd/MM/yyyy") : "Pick a date"}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-auto bg-[#1c1c1c] border border-[#3b3b3b] text-white p-0"
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        ) : (
          <span className="text-white text-base font-medium whitespace-nowrap">Expiry date</span>
        )}
      </div>

      {/* Toggle Knob - Absolute positioned to animate/place correctly based on state */}
      <button
        onClick={handleToggle}
        className={`
          absolute top-0
          w-[38px] h-[38px]
          rounded-full text-white text-xs font-bold
          flex items-center justify-center
          shadow-md
          transition-all duration-300 
          ${isOn ? "right-0 bg-[#2d7a47]" : "left-0 bg-[#ef4444]"}
        `}
      >
        {isOn ? "ON" : "OFF"}
      </button>
    </div>
  )
}
