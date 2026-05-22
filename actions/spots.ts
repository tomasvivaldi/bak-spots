'use server'
import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import type { SpotInsert, SpotUpdate, SpotStatus } from '@/types/spot'

export async function createSpot(data: SpotInsert) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('spots').insert(data)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateSpot(data: SpotUpdate) {
  const supabase = createServiceClient()
  const { id, ...rest } = data
  const { error } = await supabase.from('spots').update(rest).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function deleteSpot(id: string) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('spots').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function updateSpotStatus(id: string, status: SpotStatus) {
  const supabase = createServiceClient()
  const { error } = await supabase.from('spots').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}
