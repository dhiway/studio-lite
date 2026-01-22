import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/layouts/layout";
import { useParams } from "@tanstack/react-router";
import { useOrgSettings } from "@/context/OrgSettingsContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import DateSwitch from "@/components/ui/DateSwitch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner"

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export default function RecordCreate() {
    const { recordId } = useParams({ from: '/recordCreate/$recordId' });
    const { registries } = useOrgSettings();

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [schema, setSchema] = useState<any>(null);
    const [registryTitle, setRegistryTitle] = useState("");
    const [errors, setErrors] = useState<any[]>([]);
    const [isProgress, setProgress] = useState<boolean>(false)

    // Expiry State
    const [isExpiryEnabled, setIsExpiryEnabled] = useState(false);
    const [expiryDate, setExpiryDate] = useState<Date | undefined>(new Date());

    // Consolidated effect for state management
    useEffect(() => {
        // Always start by resetting the form state
        setFormData({});
        setErrors([]);
        setIsExpiryEnabled(false);
        setExpiryDate(new Date());

        if (recordId && registries && registries.length > 0) {
            const registry = registries.find((r: any) => r.registryId === recordId);
            console.log("Found registry for ID:", recordId, registry);

            if (registry) {
                let parsedSchema = registry.schema;
                if (typeof registry.schema === 'string') {
                    try {
                        parsedSchema = JSON.parse(registry.schema);
                    } catch (e) {
                        console.error("Failed to parse schema", e);
                    }
                }

                // Handle VC schema structure
                if (parsedSchema?.properties?.credentialSubject?.properties) {
                    console.log("Flattening credentialSubject schema");
                    const flatSchema = {
                        ...parsedSchema,
                        properties: parsedSchema.properties.credentialSubject.properties,
                        required: parsedSchema.properties.credentialSubject.required
                    };
                    setSchema(flatSchema);
                } else {
                    setSchema(parsedSchema);
                }

                setRegistryTitle(parsedSchema?.title || registry.title || "Unknown Schema");
            } else {
                // Registry not found in list yet (or invalid ID)
                setSchema(null);
                setRegistryTitle("Loading or Not Found...");
            }
        } else {
            // Registries not ready
            setSchema(null);
            setRegistryTitle("Loading...");
        }
    }, [recordId, registries]);


    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors.length > 0) {
            setErrors(prev => prev.filter(err => {
                const path = err.instancePath.replace('/', '');
                return path !== key;
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);
        if (schema) {
            const validate = ajv.compile(schema);
            const valid = validate(formData);

            if (!valid) {
                console.log("Validation Errors:", validate.errors);
                setErrors(validate.errors || []);
                setProgress(false)
                return;
            }
            fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/v1/cred`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    schema: schema, address: `${import.meta.env.VITE_APP_PROFILE_ADDRESS}`,
                    registryId: recordId,
                    properties: formData
                }),
            }).then((response) => {
                if (response.status === 200 || response.status === 201) {
                    response.json().then(() => {
                        setProgress(false);
                        toast.success("Entry created successfully")
                    });
                } else if (response.status === 504) {
                    setProgress(false);
                    toast.error("The server is busy, please try again in a while'")

                } else {
                    response
                        .json()
                        .then((data) => {
                            setProgress(false);
                            toast.error("The server is busy, please try again in a while'")
                            toast("Error", {
                                description: `${data.error}`,
                            })
                        })
                        .catch((err) => {
                            toast("Error", {
                                description: `${err.message}`,
                            })
                        });
                }
            })
                .catch(() => {
                    setProgress(false);
                    toast("Error", {
                        description: `An error occured, please try again later!`,
                    })
                });

        }

        console.log("Form Submitted Successfully:", formData);
        console.log("Expiry Enabled:", isExpiryEnabled);
        console.log("Expiry Date:", expiryDate);

        // Add validation or API call here
        alert(`Form values validated.\nExpiry: ${isExpiryEnabled ? expiryDate?.toLocaleDateString() : 'OFF'}\nCheck console for details.`);
    };

    const getFieldError = (key: string) => {
        // Check for instancePath error or required property error
        const error = errors.find((err) => {
            const path = err.instancePath.replace('/', '');
            return path === key || (err.keyword === 'required' && err.params.missingProperty === key);
        });
        return error ? error.message : null;
    };

    const createCredential = () => {
        const form = document.getElementById("issue-credential-form") as HTMLFormElement;
        if (form) {
            setProgress(true)
            form.requestSubmit();
        } else {
            setProgress(false)
        }
    };

    return (
        <Layout>
            <div className="text-white flex flex-col items-center mt-12 w-full">
                <div className="w-full max-w-[1324px]">
                    {/* Header Section */}
                    <div className="flex items-center justify-start mb-8 w-full">
                        <div className="flex flex-row items-center">
                            {/* <ArrowLeft className="w-6 h-6 cursor-pointer text-gray-400 hover:text-white" onClick={() => window.history.back()} /> */}
                            <h1 className="text-3xl font-normal ml-5">{registryTitle}</h1>
                            <DateSwitch
                                className="ml-4"
                                onToggleChange={setIsExpiryEnabled}
                                onDateChange={setExpiryDate}
                            />
                        </div>
                        <Button
                            onClick={() => createCredential()}
                            disabled={isProgress ? true : false}
                            className="bg-white text-black hover:bg-gray-200 font-medium px-6 py-2 ml-2 rounded-full"
                        >
                            Issue Credential
                        </Button>
                    </div>

                    <Card className="bg-[#2a2a2a] border-none text-gray-300 rounded-[24px] shadow-lg w-full min-h-[500px] p-8 mx-5">
                        <CardContent className="p-0">
                            {schema && schema.properties ? (
                                <form id="issue-credential-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    {Object.entries(schema.properties).map(([key, prop]: [string, any]) => (
                                        <div key={key} className="flex flex-col space-y-3">
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor={key} className="text-white text-base font-medium capitalize flex items-center">
                                                    {prop.title || key}
                                                    {schema.required?.includes(key) && <span className="text-red-500 ml-1">*</span>}
                                                </Label>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Info className="w-4 h-4 text-gray-400" />
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-gray-800 text-white border-gray-700">
                                                            <p>{prop.description || `Enter value for ${key}`}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>

                                            {prop.type === 'integer' || prop.type === 'number' ? (
                                                <Input
                                                    id={key}
                                                    type="number"
                                                    placeholder={prop.title || key}
                                                    className={`bg-[#3b3b3b] border-transparent focus:border-gray-500 text-white placeholder:text-gray-500 h-12 rounded-xl px-4 ${getFieldError(key) ? 'border-red-500' : ''}`}
                                                    onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                                                />
                                            ) : prop.type === 'boolean' ? (
                                                <div className="flex items-center space-x-2 h-12">
                                                    <input
                                                        type="checkbox"
                                                        id={key}
                                                        className="w-5 h-5 rounded border-gray-600 bg-[#3b3b3b] text-white focus:ring-0 focus:ring-offset-0"
                                                        onChange={(e) => handleChange(key, e.target.checked)}
                                                    />
                                                    <span className="text-sm text-gray-400">{prop.description || 'Yes/No'}</span>
                                                </div>
                                            ) : (
                                                <Input
                                                    id={key}
                                                    type="text"
                                                    placeholder={prop.title || key}
                                                    className={`bg-[#3b3b3b] border-transparent focus:border-gray-500 text-white placeholder:text-gray-500 h-12 rounded-xl px-4 ${getFieldError(key) ? 'border-red-500' : ''}`}
                                                    onChange={(e) => handleChange(key, e.target.value)}
                                                />
                                            )}
                                            {getFieldError(key) && <span className="text-red-500 text-sm mt-1">{getFieldError(key)}</span>}
                                        </div>
                                    ))}
                                    {/* Action button moved to header, but we keep the form structure for grid alignment if needed */}
                                </form>
                            ) : (
                                <div className="text-center text-gray-500 py-10">No schema definition found to generate form.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
