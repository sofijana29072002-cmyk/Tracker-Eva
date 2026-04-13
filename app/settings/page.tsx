import AppShell from '@/components/layout/AppShell'
import SettingsClient from '@/components/settings/SettingsClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <AppShell>
      <SettingsClient profile={profile} userEmail={user.email ?? ''} />
    </AppShell>
  )
}
