/**
 * Lets apiClient (outside React) notify AuthContext (inside React) that the
 * refresh token was rejected, without the two modules importing each other.
 */
type Listener = () => void

let listener: Listener | null = null

export function onSessionExpired(fn: Listener) {
  listener = fn
}

export function emitSessionExpired() {
  listener?.()
}
