import { ArrowLeft } from "lucide-react";
import Layout from "@/layouts/layout";
import { useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import CredentialDesigner from "@/components/shared/CredentialDesigner";

export default function CredentialDesign() {
    const { credentialId } = useParams({ strict: false });
    const [credential, setCredential] = useState<any>(null);
    const [loading, setLoading] = useState(false);

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

                <CredentialDesigner
                    credential={credential}
                    credentialId={credentialId as string}
                />
            </div>
        </Layout>
    );
}
