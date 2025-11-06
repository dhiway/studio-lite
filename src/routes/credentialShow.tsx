import { createFileRoute } from '@tanstack/react-router'
import CredentialShow from '@/pages/CredentialShow/CredentialShow';

export const Route = createFileRoute('/credentialShow')({
  component: CredentialShow,
})

