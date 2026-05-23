'use server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import { isAuthenticated } from '@/lib/auth/session'
import type { SpotInsert, SpotUpdate, SpotStatus } from '@/types/spot'

export async function createSpot(data: SpotInsert) {
  if (!await isAuthenticated()) throw new Error('Unauthorized')
  const supabase = createServiceClient()
  const { error } = await supabase.from('spots').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateSpot(data: SpotUpdate) {
  if (!await isAuthenticated()) throw new Error('Unauthorized')
  const supabase = createServiceClient()
  const { id, ...rest } = data
  const { error } = await supabase.from('spots').update(rest).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function deleteSpot(id: string) {
  if (!await isAuthenticated()) throw new Error('Unauthorized')
  const supabase = createServiceClient()
  const { error } = await supabase.from('spots').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateSpotStatus(id: string, status: SpotStatus) {
  if (!await isAuthenticated()) throw new Error('Unauthorized')
  const supabase = createServiceClient()
  const { error } = await supabase.from('spots').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}
