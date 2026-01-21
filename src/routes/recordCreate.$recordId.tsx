import { createFileRoute } from '@tanstack/react-router'
import RecordCreate from '@/pages/RecordCreate/RecordCreate'

export const Route = createFileRoute('/recordCreate/$recordId')({
    component: RecordCreate,
})
