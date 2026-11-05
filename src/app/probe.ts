import { createClient } from '@supabase/supabase-js'

export interface ProbeResult {
  where: string
  typeofGlobal: string
  wsConstructions: number
  transportIsWindowWebSocket: boolean
  transportIsLongPoll: boolean
  statuses: string[]
  verdict: string
}

// Dummy URL and key: we only check which transport is used. CHANNEL_ERROR is expected.
export function runProbe(where: string): Promise<ProbeResult> {
  const w = window as any
  const Native = w.__NativeWS ?? (w.__NativeWS = w.WebSocket)
  let constructions = 0
  const Wrapped: any = function (this: any, ...args: any[]) {
    constructions++
    return new Native(...args)
  }
  Wrapped.prototype = Native.prototype
  Object.assign(Wrapped, { CONNECTING: 0, OPEN: 1, CLOSING: 2, CLOSED: 3 })
  w.WebSocket = Wrapped

  const sb = createClient('http://127.0.0.1:54321', 'sb_publishable_dummy', {
    auth: { persistSession: true },
  })
  const statuses: string[] = []
  sb.channel('probe-' + where)
    .on('postgres_changes', { event: '*', schema: 'public', table: 't' }, () => {})
    .subscribe((s) => statuses.push(s))

  return new Promise((resolve) =>
    setTimeout(() => {
      const t = (sb.realtime as any).socketAdapter.socket.transport
      const isLP = !!t && t.name === 'LongPoll'
      const res: ProbeResult = {
        where,
        typeofGlobal: typeof (globalThis as any).global,
        wsConstructions: constructions,
        transportIsWindowWebSocket: t === w.WebSocket,
        transportIsLongPoll: isLP,
        statuses,
        verdict: isLP || constructions === 0 ? 'FAIL (issue reproduced)' : 'PASS (native WebSocket)',
      }
      ;(w.__results ??= []).push(res)
      resolve(res)
    }, 2000),
  )
}
