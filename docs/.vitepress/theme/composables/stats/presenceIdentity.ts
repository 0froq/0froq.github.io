import { useGitHubAuth } from '~/composables/useGitHubAuth'
import { getAnonId } from './useAnonId'
import { usePresenceAsAnon } from './useAnonPersona'

/** GitHub avatar by login (no API). */
export function githubAvatarUrl(login: string): string {
  return `https://github.com/${encodeURIComponent(login)}.png?size=64`
}

/**
 * Current presence display identity for HTTP heartbeat + ghost WS.
 * When authenticated and not "as anon", return ghLogin; else undefined.
 */
export function usePresenceGhLogin() {
  const { user } = useGitHubAuth()
  const { presenceAsAnon } = usePresenceAsAnon()

  function getGhLogin(): string | undefined {
    if (presenceAsAnon.value)
      return undefined
    const login = user.value?.login?.trim()
    return login || undefined
  }

  return { getGhLogin, user, presenceAsAnon }
}

/** Non-composable snapshot for module-level callers (e.g. recordVisit). */
let resolveGhLogin: () => string | undefined = () => undefined

export function bindPresenceGhLoginResolver(fn: () => string | undefined): void {
  resolveGhLogin = fn
}

export function currentPresenceGhLogin(): string | undefined {
  return resolveGhLogin()
}

export function getPresenceAnonId(): string {
  return getAnonId()
}
