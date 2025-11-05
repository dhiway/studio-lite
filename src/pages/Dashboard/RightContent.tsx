import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Search } from "lucide-react";
import { useRouter } from "@tanstack/react-router";

export default function RightContent() {
   const router = useRouter();
  const SchemaCards = () => {
    return (
      <div className="grid grid-cols-6 gap-4 mt-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="bg-[#3B3B3B] p-1 rounded-full flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() =>
                      router.navigate({
                        to: `/record_create`
                      })
                    }
          >
            <h2 className="text-white font-regular text-base">
              Schema Title {item}
            </h2>
          </div>
        ))}
      </div>
    );
  }
  return (
<div className="flex flex-col mx-auto my-auto items-center justify-center h-screen">
  <h1 className="text-white text-center font-regular text-[34px]">
    What Do you want to issue?
  </h1>

  <div className="relative w-[976px] max-w-full mt-6">
    <div className="relative">
      <Input
        type="search"
        placeholder="Search or Paste the schema URL"
        className="p-6 pr-44 rounded-full border border-border bg-background text-foreground focus-visible:ring-1 focus-visible:ring-ring w-full"
      />

      <Button
        className="absolute top-1/2 right-3 -translate-y-1/2 px-6 py-2 rounded-full bg-transparent border-2 border-[#303030] hover:bg-[#2a2a2a] text-white cursor-pointer"
        onClick={() => open('https://schema.marketplace.dhiway.net')}
      >
        Create Schema
      </Button>
    </div>

    <SchemaCards />
  </div>
</div>


  );
}
