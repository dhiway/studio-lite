import { createFileRoute } from '@tanstack/react-router'
import CredentialDetails from '@/pages/RecordDetails/CredentialDetails'

export const Route = createFileRoute('/credential/$credentialId')({
    component: CredentialDetails,
})
