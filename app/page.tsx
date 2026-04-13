import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const today = new Date().toISOString().split('T')[0]

  // Fetch today's summary data in parallel
  const [
    { data: skinEntries },
    { data: foodEntries },
    { data: contactEntries },
    { data: profile },
    { data: weekSkin },
  ] = await Promise.all([
    supabase.from('skin_entries').select('*').eq('user_id', user.id).eq('date', today).order('created_at', { ascending: false }),
    supabase.from('food_entries').select('id, food_name, time').eq('user_id', user.id).eq('date', today),
    supabase.from('contact_entries').select('id, contact_name, time').eq('user_id', user.id).eq('date', today),
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('skin_entries').select('date, severity').eq('user_id', user.id).gte('date', new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0]).order('date'),
  ])

  return (
    <AppShell>
      <DashboardClient
        profile={profile}
        skinEntries={skinEntries ?? []}
        foodCount={foodEntries?.length ?? 0}
        contactCount={contactEntries?.length ?? 0}
        weekSkin={weekSkin ?? []}
        today={today}
      />
    </AppShell>
  )
}
