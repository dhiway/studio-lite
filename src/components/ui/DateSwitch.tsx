import  { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { format } from "date-fns"


type DateSwitchProps = {
  className?: string;
};

export default function DateSwitch({ className }: DateSwitchProps) {
  const [isOn, setIsOn] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div
      className={`${className} +  
        flex items-center justify-between
        w-[166px] h-[48px]
        px-3 pr-0
        rounded-full
        border border-[#3b3b3b]
        bg-[#2b2b2b]
        transition-all duration-300
      `}
    >
      {/* ✅ Clickable date area opens datepicker */}
      {isOn ?
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex-1 text-left text-white text-base font-medium focus:outline-none">
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
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        : <p className="font-regular text-white">{date ? format(date, "dd/MM/yyyy") : "Pick a date"}</p>
      }

      {/* ✅ Toggle Switch */}
      <button
        onClick={() => setIsOn(!isOn)}
        className={`
          w-[48px] h-[48px]
          flex items-center justify-center
          rounded-full text-white font-semibold
          transition-all duration-300
          ${isOn ? "bg-[#2d7a47]" : "bg-[#444]"}
        `}
      >
        {isOn ? "ON" : "OFF"}
      </button>
    </div>
  )
}
