
import { createFileRoute } from '@tanstack/react-router'
import SchemaEditor from "@/pages/SchemaEditor";

export const Route = createFileRoute('/schema_create')({
  component: SchemaEditor,
})


