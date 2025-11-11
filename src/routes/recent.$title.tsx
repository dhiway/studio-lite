import Dashboard from '@/pages/Dashboard/Dashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(`/recent/$title`)({
  component: Dashboard,
})
