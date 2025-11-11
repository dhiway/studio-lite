import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/layouts/layout";
import dayjs from "dayjs";

let data = {
  title: "Sujith",
  expiryLabel: "Credential Expiry",
  expiryDate: "12/12/2025",
  recordsData: {
    name: "Sujith Baruve",
    age: 30,
    email: "sujith@dhiway.com",
    phoneNumbers: [
      "555-1234",
      "555-5678"
    ],
    isActive: true
  }
};

export default function RecordDetails() {
  console.log("Received data:", data);

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data.recordsData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.title.replace(/\s+/g, "_")}_data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const entries = data.recordsData && Object.entries(data.recordsData);

  return (
    <Layout>
      <div className="text-white flex flex-col justify-center align-middle mt-12">
        {/* Header */}
        <div className="mx-auto w-[1324px]" >
          <div className="mx-auto flex justify-between items-center ">
          <div className="flex items-start gap-2 ">
            <ArrowLeft className="w-5 h-5 cursor-pointer" />
            <h1 className="text-lg font-medium">{data?.title}</h1>
          </div>
          {data.expiryDate && (
            <div>
            <p className="text-sm text-white pr-4">
              {data.expiryLabel}:{" "}
              <span className="text-gray-400">{dayjs(data.expiryDate).format('DD MMM, YYYY')}</span>
              </p>
            </div>
            )}
            </div>
        </div>

        {/* Card */}
        <div className="flex justify-center">
        <Card className="bg-[#1C1C1C] border border-gray-700 text-gray-300 rounded-2xl shadow-lg w-[1324px] min-h-[500px] text-left  mt-6">
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 m-10">
            {entries.length > 0 ? (
              entries.map(([key, value], index) => (
                <div key={index}>
                  <h3 className="text-sm font-semibold text-white">
                    {formatKey(key)}
                  </h3>
                  <p className="break-words">{formatValue(value)}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-2">No data available</p>
            )}
          </CardContent>
        </Card>
        </div>
        {/* Download Button */}
        <div className="flex justify-start text-left mt-8">
          <div className="mx-auto w-[1324px]">
          <Button
            variant="outline"
            className="border-gray-600 text-white hover:bg-gray-800 rounded-full px-6 py-2"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download JSON
            </Button>
            </div>
        </div>
      </div>
    </Layout>
  );
}

// Helper to prettify keys
function formatKey(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, " ");
}

// Helper to handle nested/array values
function formatValue(value: any) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object" && value !== null)
    return JSON.stringify(value, null, 2);
  return String(value);
}
