import type { Location } from 'react-router-dom'

/** Shape of location.state when redirecting through /login (see ProtectedRoute, ProductCard). */
export interface RedirectState {
  from?: Location
}
