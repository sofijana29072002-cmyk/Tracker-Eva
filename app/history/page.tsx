import AppShell from '@/components/layout/AppShell'
import HistoryClient from '@/components/history/HistoryClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HistoryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch last 30 days
  const since = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

  const [
    { data: foodEntries },
    { data: contactEntries },
    { data: skinEntries },
    { data: medications },
    { data: envEntries },
  ] = await Promise.all([
    supabase.from('food_entries').select('*').eq('user_id', user.id).gte('date', since).order('date', { ascending: false }).order('time', { ascending: false }),
    supabase.from('contact_entries').select('*').eq('user_id', user.id).gte('date', since).order('date', { ascending: false }),
    supabase.from('skin_entries').select('*').eq('user_id', user.id).gte('date', since).order('date', { ascending: false }),
    supabase.from('medications').select('*').eq('user_id', user.id).gte('date', since).order('date', { ascending: false }),
    supabase.from('environment_entries').select('*').eq('user_id', user.id).gte('date', since).order('date', { ascending: false }),
  ])

  return (
    <AppShell>
      <HistoryClient
        userId={user.id}
        foodEntries={foodEntries ?? []}
        contactEntries={contactEntries ?? []}
        skinEntries={skinEntries ?? []}
        medications={medications ?? []}
        envEntries={envEntries ?? []}
      />
    </AppShell>
  )
}
