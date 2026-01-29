import { ArrowLeft, Play, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/layouts/layout";
import { useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    DEFAULT_TEMPLATE,
    STORAGE_KEY,
    processTemplate,
    downloadHtml
} from "@/lib/templateProcessor";

export default function CredentialDesign() {
    const { credentialId } = useParams({ strict: false });
    const [credential, setCredential] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [htmlTemplate, setHtmlTemplate] = useState<string>(DEFAULT_TEMPLATE);
    const [processedHtml, setProcessedHtml] = useState<string>("");

    // Load saved template on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setHtmlTemplate(saved);
        }
    }, []);

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
                    const credData = data.credential || data;
                    setCredential(credData);
                })
                .catch((err) => {
                    console.error("Error fetching credential:", err);
                    toast.error("Failed to load credential data");
                })
                .finally(() => setLoading(false));
        }
    }, [credentialId]);

    const handlePreview = () => {
        if (!credential) {
            toast.error("Credential data not loaded yet");
            return;
        }

        const result = processTemplate(htmlTemplate, credential.vc?.credentialSubject);
        setProcessedHtml(result);
    };

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, htmlTemplate);
        toast.success("Design template saved successfully");
    };

    const handleDownload = () => {
        if (!processedHtml) {
            toast.error("Please render the preview first");
            return;
        }
        downloadHtml(processedHtml, `credential_design_${credentialId}.html`);
    };

    // Auto-render when credential loads
    useEffect(() => {
        if (credential) {
            handlePreview();
        }
    }, [credential]);

    if (loading) {
        return (
            <Layout>
                <div className="text-white flex justify-center items-center h-screen">
                    <p>Loading data...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="text-white flex flex-col p-8 gap-8 mt-12 w-full max-w-[1400px] mx-auto">
                <div className="flex items-center gap-2">
                    <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={() => window.history.back()} />
                    <h1 className="text-2xl font-semibold">HTML Template Preview</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="flex flex-col gap-4">
                        <label className="text-sm font-medium text-gray-400">HTML Template (Use {"{{subjectTable}}"} as placeholder)</label>
                        <textarea
                            className="w-full h-[500px] bg-[#1C1C1C] border border-gray-700 rounded-xl p-4 font-mono text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            value={htmlTemplate}
                            onChange={(e) => setHtmlTemplate(e.target.value)}
                        />
                        <div className="flex gap-4">
                            <Button onClick={handlePreview} className="w-fit px-8 py-2 rounded-full">
                                <Play className="w-4 h-4 mr-2" />
                                Render Preview
                            </Button>
                            <Button
                                onClick={handleSave}
                                variant="outline"
                                className="w-fit px-8 py-2 rounded-full border-gray-600 text-white hover:bg-gray-800"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Template
                            </Button>
                            <Button
                                onClick={handleDownload}
                                variant="outline"
                                className="w-fit px-8 py-2 rounded-full border-gray-600 text-white hover:bg-gray-800"
                                disabled={!processedHtml}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Design
                            </Button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="flex flex-col gap-4">
                        <label className="text-sm font-medium text-gray-400">Preview Result</label>
                        <div className="w-full h-[500px] bg-white rounded-xl overflow-hidden border border-gray-700">
                            {processedHtml ? (
                                <iframe
                                    title="HTML Preview"
                                    srcDoc={processedHtml}
                                    className="w-full h-full border-none"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    Click "Render Preview" to see the result
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
