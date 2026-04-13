import AppShell from '@/components/layout/AppShell'
import LogClient from '@/components/forms/LogClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LogPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <AppShell>
      <LogClient userId={user.id} />
    </AppShell>
  )
}
