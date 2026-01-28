import { ArrowLeft, Play, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; // Assuming a textarea component exists or using standard textarea
import Layout from "@/layouts/layout";
import { useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function CredentialDesign() {
    const { credentialId } = useParams({ strict: false });
    const [credential, setCredential] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [htmlTemplate, setHtmlTemplate] = useState<string>(
        `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Credential Design</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body { 
            font-family: 'Inter', sans-serif; 
            margin: 0;
            padding: 40px; 
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .container { 
            background: rgba(255, 255, 255, 0.05); 
            backdrop-filter: blur(10px);
            padding: 40px; 
            border-radius: 24px; 
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4); 
            max-width: 800px;
            width: 100%;
        }

        h1 { 
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            background: linear-gradient(90deg, #60a5fa, #a855f7);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        p {
            color: #9ca3af;
            margin-bottom: 32px;
        }

        table { 
            width: 100%; 
            border-collapse: separate; 
            border-spacing: 0;
            margin-top: 20px; 
        }

        th, td { 
            padding: 16px; 
            text-align: left; 
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        th { 
            color: #60a5fa;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.05em;
        }

        td {
            font-size: 15px;
        }

        .id-badge {
            background: rgba(96, 165, 250, 0.1);
            color: #60a5fa;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Credential Subject</h1>
        <p>Verified Information</p>
        {{subjectTable}}
    </div>
</body>
</html>`
    );
    const [processedHtml, setProcessedHtml] = useState<string>("");

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

    const generateSubjectTable = (subject: any) => {
        if (!subject) return "<p>No subject data available</p>";

        let tableHtml = "<table><thead><tr><th>Attribute</th><th>Value</th></tr></thead><tbody>";

        Object.entries(subject).forEach(([key, value]) => {
            if (key !== '@context' && key !== 'id' && key !== 'type') {
                const displayKey = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).replace(/_/g, " ");
                const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
                tableHtml += `<tr><td>${displayKey}</td><td>${displayValue}</td></tr>`;
            }
        });

        tableHtml += "</tbody></table>";
        return tableHtml;
    };

    const handlePreview = () => {
        if (!credential) {
            toast.error("Credential data not loaded yet");
            return;
        }

        const subjectTable = generateSubjectTable(credential.vc?.credentialSubject);
        const result = htmlTemplate.replace("{{subjectTable}}", subjectTable);
        setProcessedHtml(result);
    };

    const handleDownload = () => {
        if (!processedHtml) {
            toast.error("Please render the preview first");
            return;
        }
        const blob = new Blob([processedHtml], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `credential_design_${credentialId}.html`;
        link.click();
        URL.revokeObjectURL(url);
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
