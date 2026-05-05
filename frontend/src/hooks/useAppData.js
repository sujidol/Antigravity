import { useState, useEffect } from 'react'
import { fetchAllData } from '../lib/api.js'

// Module-level cache: fetched once, shared across all pages
let _cache = null

export function useAppData() {
  const [data,    setData]    = useState(_cache)
  const [loading, setLoading] = useState(!_cache)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (_cache) return
    fetchAllData()
      .then(d  => { _cache = d; setData(d); setLoading(false) })
      .catch(e => { setError(e.message);     setLoading(false) })
  }, [])

  return { data, loading, error }
}
