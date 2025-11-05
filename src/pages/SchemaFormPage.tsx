import DynamicSchemaForm from "@/components/DynamicForm";
import credentialSchema from "@/schemas/credential.schema.json";

export default function SchemaFormPage() {
  const handleSubmit = (data: Record<string, any>) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center py-10 space-y-8">
      <DynamicSchemaForm schema={credentialSchema} onSubmit={handleSubmit} />
    </div>
  );
}
