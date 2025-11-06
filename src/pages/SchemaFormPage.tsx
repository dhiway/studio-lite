import DynamicSchemaForm from "@/components/DynamicForm";
import credentialSchema from "@/schemas/credential.schema.json";

export default function SchemaFormPage() {
  const handleSubmit = (data: Record<string, any>) => {
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <div className="flex flex-col items-center">
      <DynamicSchemaForm schema={credentialSchema} onSubmit={handleSubmit} />
    </div>
  );
}
