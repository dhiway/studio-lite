import { Play, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    DEFAULT_TEMPLATE,
    STORAGE_KEY,
    processTemplate,
} from "@/lib/templateProcessor";

import { useOrgSettings } from "@/context/OrgSettingsContext";

interface CredentialDesignerProps {
    credential: any;
    credentialId: string;
}

export default function CredentialDesigner({ credential, credentialId }: CredentialDesignerProps) {
    const [htmlTemplate, setHtmlTemplate] = useState<string>(DEFAULT_TEMPLATE);
    const [processedHtml, setProcessedHtml] = useState<string>("");

    // Load saved template on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            setHtmlTemplate(saved);
        }
    }, []);

    const handlePreview = () => {
        if (!credential) {
            toast.error("Credential data not loaded yet");
            return;
        }
    };

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, htmlTemplate);
        toast.success("Design template saved successfully");
    };

    const { registries } = useOrgSettings();
    const [qrUrl, setQrUrl] = useState<string>("");

    const SHORT_URL = "https://verifydemo.dhiway.com";
    const iKey = "m";

    // Auto-render when credential loads
    useEffect(() => {
        if (credential) {
            handlePreview();
            console.log("credential", credential);
            const url = `https://hashcodedemo.dhiway.com/?text=${SHORT_URL}/${iKey}/${credential?.credId}&id=frameless&format=png`;
            setQrUrl(url);
            // Re-render preview with QR code once we have it
        }
    }, [credential]);

    useEffect(() => {
        if (credential && qrUrl) {
            const result = processTemplate(htmlTemplate, credential.vc?.credentialSubject, qrUrl);
            setProcessedHtml(result);
        } else if (credential) {
            // Initial render without QR
            const result = processTemplate(htmlTemplate, credential.vc?.credentialSubject, "");
            setProcessedHtml(result);
        }
    }, [qrUrl, htmlTemplate, credential]);

    return (
        <div className="flex flex-col gap-8 w-full">
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
    );
}
