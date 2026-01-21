import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Search } from "lucide-react";
// import { useRouter } from "@tanstack/react-router";
import SchemaFormPage from "../SchemaFormPage";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useOrgSettings } from "@/context/OrgSettingsContext";
import { useNavigate } from "@tanstack/react-router";


export default function RightContent() {
  // const router = useRouter();
  const { open, setOpen } = useOrgSettings();
  const [openSchemaCreate, setOpenSchemaCreate] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const navigate = useNavigate();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const SchemaCards = () => {
    return (
      <div className="grid grid-cols-6 gap-4 mt-6">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="bg-[#3B3B3B] p-1 rounded-full flex flex-col items-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => {
              setOpenSchemaCreate(true);
            }}
          >
            <h2 className="text-white font-regular text-base">
              Schema Title {item}
            </h2>
          </div>
        ))}
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saved:", { logo, orgName });
    // You can handle the API call or save logic here
  };

  return (
    <div className="flex flex-col mx-auto my-auto items-center justify-center h-screen">
      {!openSchemaCreate ? (
        <>
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
                onClick={() =>
                  navigate({
                    to: "/schema_create",
                  })
                }
              >
                Create Schema
              </Button>
            </div>

            <SchemaCards />
          </div>
        </>
      ) : (
        <SchemaFormPage />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-[672px] min-h-[500px] bg-[#303030] border border-gray-700 text-white rounded-xl p-0 m-0">
          <DialogHeader>
            <DialogTitle className="text-lg font-regular text-white mt-10 ml-10">
              Organisation Settings
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center mx-10"
          >
            {/* Card Content */}
            <div className="w-full rounded-lg ">
              <div className="flex flex-col items-start gap-4">
                {/* Logo Upload */}
                <label className="w-[151px] h-[151px] bg-gray-600 border border-white flex items-center justify-center rounded-lg cursor-pointer overflow-hidden">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Logo"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <span className="text-sm text-gray-300">Upload logo</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>

                {/* Organisation Name Input */}
                <div className="flex-1 flex flex-col justify-center mt-10">
                  <label className="text-white font-regular text-[16px] w-[600px] mb-1">
                    Enter Organisation Name
                  </label>
                  <input
                    type="text"
                    placeholder="Dhiway Networks PVT LTD"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full bg-[#3B3B3B] text-gray-200 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <button
              type="submit"
              className="mt-6 bg-white text-black font-semibold rounded-full py-3 hover:bg-gray-100 transition-all mt-10 w-[600px]"
            >
              Save
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
