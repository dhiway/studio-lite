import { ArrowLeft, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/layouts/layout";
import dayjs from "dayjs";
import { useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    DEFAULT_TEMPLATE,
    STORAGE_KEY,
    processTemplate,
    downloadPdf
} from "@/lib/templateProcessor";
import CredentialDesigner from "@/components/shared/CredentialDesigner";
import { cn } from "@/lib/utils";

export default function CredentialDetails() {
    const { credentialId } = useParams({ strict: false });
    const [credential, setCredential] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [displayTitle, setDisplayTitle] = useState("Credential Details");
    const [activeTab, setActiveTab] = useState<"details" | "designer" | "raw">("details");

    // ── Size-picker dialog ──────────────────────────────────────────────────
    interface PagePreset { label: string; width: number; height: number; unit: "mm" | "px"; }
    const PAGE_PRESETS: PagePreset[] = [
        { label: "A4 Portrait (210 × 297 mm)",  width: 210,  height: 297,  unit: "mm" },
        { label: "A4 Landscape (297 × 210 mm)", width: 297,  height: 210,  unit: "mm" },
        { label: "Letter (216 × 279 mm)",        width: 216,  height: 279,  unit: "mm" },
        { label: "ID Card (85.6 × 54 mm)",       width: 85.6, height: 54,   unit: "mm" },
        { label: "Custom",                        width: 0,    height: 0,    unit: "mm" },
    ];
    const [showSizeDialog, setShowSizeDialog] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<PagePreset>(PAGE_PRESETS[0]);
    const [sizeUnit, setSizeUnit]             = useState<"mm" | "px">("mm");
    const [customWidth,  setCustomWidth]      = useState("210");
    const [customHeight, setCustomHeight]     = useState("297");
    const [pdfDownloading, setPdfDownloading] = useState(false);

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
        if (!credential || !credential.vc) {
            toast.error("No VC data available to download");
            return;
        }
        const blob = new Blob([JSON.stringify(credential.vc, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `vc_${credential.credId || credentialId}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const getEffectiveDimensions = () => {
        if (selectedPreset.label === "Custom") {
            const w = parseFloat(customWidth);
            const h = parseFloat(customHeight);
            if (!w || !h || w <= 0 || h <= 0) return null;
            return { width: w, height: h, unit: sizeUnit };
        }
        // Preset sizes are always in mm; honour the current unit toggle
        if (sizeUnit === "px") {
            const MM_TO_PX = 3.7795275591;
            return { width: Math.round(selectedPreset.width * MM_TO_PX), height: Math.round(selectedPreset.height * MM_TO_PX), unit: "px" as const };
        }
        return { width: selectedPreset.width, height: selectedPreset.height, unit: "mm" as const };
    };

    const handleDownloadDesign = async () => {
        const dims = getEffectiveDimensions();
        if (!dims) { toast.error("Please enter valid width and height values."); return; }
        if (!credential?.vc) { toast.error("No credential data available."); return; }

        setPdfDownloading(true);
        setShowSizeDialog(false);
        const html = processTemplate(
            localStorage.getItem(STORAGE_KEY) || DEFAULT_TEMPLATE,
            credential.vc.credentialSubject
        );
        try {
            toast.loading("Generating PDF…", { id: "pdf-gen" });
            await downloadPdf(html, `credential_design_${credentialId}.pdf`, dims.width, dims.height, dims.unit);
            toast.success("PDF downloaded successfully", { id: "pdf-gen" });
        } catch {
            toast.error("Failed to generate PDF", { id: "pdf-gen" });
        } finally {
            setPdfDownloading(false);
        }
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

                {/* Tabs */}
                <div className="mx-auto w-[1324px] mt-8 flex border-b border-gray-800">
                    <button
                        onClick={() => setActiveTab("details")}
                        className={cn(
                            "px-8 py-4 text-sm font-medium transition-all duration-200 relative",
                            activeTab === "details" ? "text-blue-500" : "text-gray-400 hover:text-gray-200"
                        )}
                    >
                        Details
                        {activeTab === "details" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("designer")}
                        className={cn(
                            "px-8 py-4 text-sm font-medium transition-all duration-200 relative",
                            activeTab === "designer" ? "text-blue-500" : "text-gray-400 hover:text-gray-200"
                        )}
                    >
                        Credential Designer
                        {activeTab === "designer" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("raw")}
                        className={cn(
                            "px-8 py-4 text-sm font-medium transition-all duration-200 relative",
                            activeTab === "raw" ? "text-blue-500" : "text-gray-400 hover:text-gray-200"
                        )}
                    >
                        VC
                        {activeTab === "raw" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="mx-auto w-[1324px]">
                    {activeTab === "details" && (
                        <>
                            {/* Card */}
                            <div className="flex justify-center">
                                <Card className="bg-[#1C1C1C] border border-gray-700 text-gray-300 rounded-2xl shadow-lg w-full min-h-[500px] text-left mt-6">
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
                            {/* Action buttons */}
                            <div className="flex justify-start text-left mt-8">
                                <div className="flex flex-wrap gap-4">
                                    <Button
                                        variant="outline"
                                        className="border-gray-600 text-white hover:bg-gray-800 rounded-full px-6 py-2"
                                        onClick={handleDownload}
                                        disabled={!credential}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download VC
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={!credential || pdfDownloading}
                                        onClick={() => setShowSizeDialog(true)}
                                        className="border-blue-600 text-blue-400 hover:bg-blue-900/30 rounded-full px-6 py-2"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        {pdfDownloading ? "Generating…" : "Download Design (PDF)"}
                                    </Button>
                                </div>
                            </div>

                            {/* ── Size-picker dialog ── */}
                            {showSizeDialog && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <div className="bg-[#1c1c1c] border border-[#393939] rounded-2xl p-8 w-full max-w-md shadow-2xl">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <h3 className="text-white text-lg font-semibold">Choose PDF Size</h3>
                                            <button onClick={() => setShowSizeDialog(false)} className="text-gray-400 hover:text-white transition-colors">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {/* Unit toggle */}
                                        <div className="flex gap-2 mb-5">
                                            <button
                                                onClick={() => setSizeUnit("mm")}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                                                    sizeUnit === "mm"
                                                        ? "border-blue-500 bg-blue-900/30 text-blue-300"
                                                        : "border-[#393939] text-gray-400 hover:border-gray-500"
                                                }`}
                                            >
                                                Millimeters (mm)
                                            </button>
                                            <button
                                                onClick={() => setSizeUnit("px")}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                                                    sizeUnit === "px"
                                                        ? "border-blue-500 bg-blue-900/30 text-blue-300"
                                                        : "border-[#393939] text-gray-400 hover:border-gray-500"
                                                }`}
                                            >
                                                Pixels (px)
                                            </button>
                                        </div>

                                        {/* Preset buttons */}
                                        <div className="flex flex-col gap-2 mb-5">
                                            {PAGE_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.label}
                                                    onClick={() => setSelectedPreset(preset)}
                                                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                                                        selectedPreset.label === preset.label
                                                            ? "border-blue-500 bg-blue-900/30 text-blue-300"
                                                            : "border-[#393939] text-gray-300 hover:border-gray-500 hover:bg-[#252525]"
                                                    }`}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Custom inputs */}
                                        {selectedPreset.label === "Custom" && (
                                            <div className="flex gap-4 mb-5">
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-400 mb-1 block">Width ({sizeUnit})</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={customWidth}
                                                        onChange={(e) => setCustomWidth(e.target.value)}
                                                        className="w-full bg-[#0d0d0d] border border-[#393939] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                                        placeholder={sizeUnit === "mm" ? "e.g. 210" : "e.g. 794"}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-400 mb-1 block">Height ({sizeUnit})</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={customHeight}
                                                        onChange={(e) => setCustomHeight(e.target.value)}
                                                        className="w-full bg-[#0d0d0d] border border-[#393939] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                                                        placeholder={sizeUnit === "mm" ? "e.g. 297" : "e.g. 1123"}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        <div className="flex gap-3 justify-end">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowSizeDialog(false)}
                                                className="rounded-full border-gray-600 text-gray-300 hover:bg-gray-800"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleDownloadDesign}
                                                className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download PDF
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === "designer" && (
                        <div className="mt-6">
                            <CredentialDesigner
                                credential={credential}
                                credentialId={credentialId as string}
                            />
                        </div>
                    )}

                    {activeTab === "raw" && (
                        <div className="mt-6">
                            <Card className="bg-[#1C1C1C] border border-gray-700 text-gray-300 rounded-2xl shadow-lg w-full min-h-[500px] text-left overflow-hidden">
                                <CardContent className="p-0">
                                    <pre className="p-8 font-mono text-sm overflow-auto max-h-[700px] text-blue-300 bg-[#0d0d0d]">
                                        {JSON.stringify(credential?.vc, null, 2)}
                                    </pre>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
