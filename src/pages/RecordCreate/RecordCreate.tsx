import { ArrowLeft } from "lucide-react";
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

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export default function RecordCreate() {
    const { recordId } = useParams({ from: '/recordCreate/$recordId' });
    const { registries } = useOrgSettings();

    const [formData, setFormData] = useState<Record<string, any>>({});
    const [schema, setSchema] = useState<any>(null);
    const [registryTitle, setRegistryTitle] = useState("");
    const [errors, setErrors] = useState<any[]>([]);

    // Consolidated effect for state management
    useEffect(() => {
        // Always start by resetting the form state
        setFormData({});
        setErrors([]);

        if (recordId && registries && registries.length > 0) {
            const registry = registries.find((r: any) => r.id === recordId);
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
                return;
            }
        }

        console.log("Form Submitted Successfully:", formData);
        // Add validation or API call here
        alert("Form values validated and logged to console.");
    };

    const getFieldError = (key: string) => {
        // Check for instancePath error or required property error
        const error = errors.find((err) => {
            const path = err.instancePath.replace('/', '');
            return path === key || (err.keyword === 'required' && err.params.missingProperty === key);
        });
        return error ? error.message : null;
    };

    return (
        <Layout>
            <div className="text-white flex flex-col justify-center align-middle mt-12">
                <div className="mx-auto w-[1324px]">
                    <div className="flex items-start gap-2 mb-6">
                        <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={() => window.history.back()} />
                        <h1 className="text-lg font-medium">{registryTitle}</h1>
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
                                                    className={`bg-[#2a2a2a] border-gray-600 text-white ${getFieldError(key) ? 'border-red-500' : ''}`}
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
                                                    className={`bg-[#2a2a2a] border-gray-600 text-white ${getFieldError(key) ? 'border-red-500' : ''}`}
                                                    onChange={(e) => handleChange(key, e.target.value)}
                                                />
                                            )}
                                            {getFieldError(key) && <span className="text-red-500 text-sm">{getFieldError(key)}</span>}
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
