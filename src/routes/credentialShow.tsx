import { createFileRoute } from '@tanstack/react-router'
import CredentialShow from '@/pages/CredentialShowTable/CredentialShowTable';

export const Route = createFileRoute('/credentialShow')({
  component: CredentialShow,
})

