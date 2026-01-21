import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/layouts/layout";
import dayjs from "dayjs";
import { useParams, useLocation } from "@tanstack/react-router";
import { useOrgSettings } from "@/context/OrgSettingsContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

// Existing static data (kept for view mode)
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
  const { recordId } = useParams({ from: '/recordShow/$recordId' });
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode');
  const { registries } = useOrgSettings();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [schema, setSchema] = useState<any>(null);
  const [registryTitle, setRegistryTitle] = useState("");

  useEffect(() => {
    if (recordId && registries) {
      const registry = registries.find((r: any) => r.id === recordId);
      if (registry) {
        let parsedSchema = registry.schema;
        if (typeof registry.schema === 'string') {
          try {
            parsedSchema = JSON.parse(registry.schema);
          } catch (e) {
            console.error("Failed to parse schema", e);
          }
        }
        setSchema(parsedSchema);
        setRegistryTitle(parsedSchema?.title || registry.title || "Unknown Schema");
      }
    }
  }, [recordId, registries]);


  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
    // Add validation or API call here
    alert("Form values logged to console (Simulation)");
  };


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

  // --- RENDER DYNAMIC FORM ---
  if (mode === 'issue') {
    return (
      <Layout>
        <div className="text-white flex flex-col justify-center align-middle mt-12">
          <div className="mx-auto w-[1324px]">
            <div className="flex items-start gap-2 mb-6">
              <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={() => window.history.back()} />
              <h1 className="text-lg font-medium">Issue {registryTitle}</h1>
            </div>

            <Card className="bg-[#1C1C1C] border border-gray-700 text-gray-300 rounded-2xl shadow-lg w-full min-h-[500px] p-6">
              <CardContent>
                {schema && schema.properties ? (
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(schema.properties).map(([key, prop]: [string, any]) => (
                      <div key={key} className="flex flex-col space-y-2">
                        <Label htmlFor={key} className="text-white capitalize">
                          {prop.title || key}
                          {schema.required?.includes(key) && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {prop.type === 'integer' || prop.type === 'number' ? (
                          <Input
                            id={key}
                            type="number"
                            placeholder={prop.description || `Enter ${key}`}
                            className="bg-[#2a2a2a] border-gray-600 text-white"
                            onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                          />
                        ) : prop.type === 'boolean' ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={key}
                              className="w-4 h-4"
                              onChange={(e) => handleChange(key, e.target.checked)}
                            />
                            <span className="text-sm">{prop.description || 'Yes/No'}</span>
                          </div>
                        ) : (
                          <Input
                            id={key}
                            type="text"
                            placeholder={prop.description || `Enter ${key}`}
                            className="bg-[#2a2a2a] border-gray-600 text-white"
                            onChange={(e) => handleChange(key, e.target.value)}
                          />
                        )}
                      </div>
                    ))}
                    <div className="col-span-1 md:col-span-2 mt-6">
                      <Button type="submit" className="w-full md:w-auto bg-white text-black hover:bg-gray-200">
                        Issue Credential
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center text-gray-500">No schema definition found to generate form.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  // --- RENDER DEFAULT VIEW (Existing Code) ---
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
