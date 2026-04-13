import AppShell from '@/components/layout/AppShell'
import AnalyticsClient from '@/components/analytics/AnalyticsClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch 60 days of data for correlation analysis
  const since = new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0]

  const [
    { data: skinEntries },
    { data: foodEntries },
    { data: contactEntries },
  ] = await Promise.all([
    supabase.from('skin_entries').select('id, date, severity').eq('user_id', user.id).gte('date', since).order('date'),
    supabase.from('food_entries').select('id, date, food_name, category, is_new_product').eq('user_id', user.id).gte('date', since).order('date'),
    supabase.from('contact_entries').select('id, date, contact_name, contact_type').eq('user_id', user.id).gte('date', since).order('date'),
  ])

  return (
    <AppShell>
      <AnalyticsClient
        skinEntries={skinEntries ?? []}
        foodEntries={foodEntries ?? []}
        contactEntries={contactEntries ?? []}
      />
    </AppShell>
  )
}
