import { createFileRoute } from '@tanstack/react-router'
import RecordDetails from '@/pages/RecordDetails/RecordDetails'

export const Route = createFileRoute('/recordShow/$recordId')({
  component: RecordDetails,
})


