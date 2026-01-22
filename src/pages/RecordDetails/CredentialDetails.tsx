import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/layouts/layout";
import dayjs from "dayjs";
import { useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function CredentialDetails() {
    const { credentialId } = useParams({ strict: false });
    const [credential, setCredential] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [displayTitle, setDisplayTitle] = useState("Credential Details");

    useEffect(() => {
        if (credentialId) {
            setLoading(true);
            fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/v1/cred/${credentialId}`)
                .then(async (res) => {
                    if (res.ok) return res.json();
                    const text = await res.text();
                    throw new Error(text || "Failed to fetch credential details");
                })
                .then((data) => {
                    console.log("Fetched credential details:", data);
                    // The API response wraps the data in a "credential" property
                    const credData = data.credential || data;
                    setCredential(credData);

                    // Try to extract title from schema in vc
                    if (credData.vc?.credentialSchema?.title) {
                        setDisplayTitle(credData.vc.credentialSchema.title);
                    } else if (credData.title) {
                        setDisplayTitle(credData.title);
                    }
                })
                .catch((err) => {
                    console.error("Error fetching credential:", err);
                    toast.error("Failed to load credential details");
                })
                .finally(() => setLoading(false));
        }
    }, [credentialId]);

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

    // Extract display entries
    const getDisplayEntries = () => {
        if (!credential) return [];

        const entries = [];

        // Standard Fields
        if (credential.credId) entries.push(["Credential ID", credential.credId]);
        if (credential.active !== undefined) entries.push(["Status", credential.active ? "Active" : "Inactive"]);
        if (credential.createdAt) entries.push(["Created At", dayjs(credential.createdAt).format('DD MMM, YYYY HH:mm')]);

        // Subject Data
        if (credential.vc?.credentialSubject) {
            Object.entries(credential.vc.credentialSubject).forEach(([key, value]) => {
                if (key !== '@context' && key !== 'id' && key !== 'type') {
                    entries.push([key, value]);
                }
            });
        }

        return entries;
    };

    const entries = getDisplayEntries();

    const handleDownload = () => {
        if (!credential) return;
        const blob = new Blob([JSON.stringify(credential, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `credential_${credential.credId || credentialId}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <Layout>
                <div className="text-white flex justify-center items-center h-screen">
                    <p>Loading credential details...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="text-white flex flex-col justify-center align-middle mt-12">
                {/* Header */}
                <div className="mx-auto w-[1324px]" >
                    <div className="mx-auto flex justify-between items-center ">
                        <div className="flex items-start gap-2 ">
                            <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={() => window.history.back()} />
                            <h1 className="text-lg font-medium">{displayTitle}</h1>
                        </div>
                        {credential?.createdAt && (
                            <div>
                                <p className="text-sm text-white pr-4">
                                    Created On:{" "}
                                    <span className="text-gray-400">{dayjs(credential.createdAt).format('DD MMM, YYYY')}</span>
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
                                <p className="text-gray-500 col-span-2">
                                    {credential ? "No specific data found to display." : "Credential not found."}
                                </p>
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
                            disabled={!credential}
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
