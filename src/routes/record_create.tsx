import SchemaFormPage from '@/pages/SchemaFormPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/record_create')({
  component: SchemaFormPage,
})

