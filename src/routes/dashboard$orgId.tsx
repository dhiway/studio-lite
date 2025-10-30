import { createFileRoute } from '@tanstack/react-router'
import Dashboard from 'src/pages/Dashboard/Dashboard';

export const Route = createFileRoute('/dashboard$orgId')({
  component: Dashboard,
})
