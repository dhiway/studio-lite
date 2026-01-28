import { createFileRoute } from '@tanstack/react-router'
import CredentialDesign from '@/pages/RecordDetails/CredentialDesign'

export const Route = createFileRoute('/credentialDesign/$credentialId')({
    component: CredentialDesign,
})
