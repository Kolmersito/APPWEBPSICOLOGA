import { createClient } from './server'

type CacheEntry = { ts: number; data: any }

const CACHE_TTL = 60 * 1000 // 60 seconds
const cache = new Map<string, CacheEntry>()

async function fetchAndCache(key: string, fetcher: () => Promise<any>) {
  const data = await fetcher()
  cache.set(key, { ts: Date.now(), data })
  return data
}

export async function getPatients(opts: { force?: boolean } = {}) {
  const key = 'patients:list'
  const entry = cache.get(key)
  if (!opts.force && entry && (Date.now() - entry.ts) < CACHE_TTL) {
    return entry.data
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  return fetchAndCache(key, async () => data || [])
}

export function invalidatePatientsCache() {
  cache.delete('patients:list')
}

export async function getReports(opts: { force?: boolean } = {}) {
  const key = 'reports:list'
  const entry = cache.get(key)
  if (!opts.force && entry && (Date.now() - entry.ts) < CACHE_TTL) return entry.data

  const supabase = await createClient()
  const { data } = await supabase
    .from('reports')
    .select('*, patients(nombre, apellido)')
    .order('created_at', { ascending: false })

  return fetchAndCache(key, async () => data || [])
}

export async function getMaterials(opts: { force?: boolean } = {}) {
  const key = 'materials:list'
  const entry = cache.get(key)
  if (!opts.force && entry && (Date.now() - entry.ts) < CACHE_TTL) return entry.data

  const supabase = await createClient()
  const { data } = await supabase
    .from('support_materials')
    .select('*')
    .order('created_at', { ascending: false })

  return fetchAndCache(key, async () => data || [])
}

export function invalidateMaterialsCache() {
  cache.delete('materials:list')
}

export function invalidateReportsCache() {
  cache.delete('reports:list')
}

// future helpers (reports, sessions) can be added here following same pattern
