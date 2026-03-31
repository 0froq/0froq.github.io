// Navigation Types
export interface NavItem {
  label: string
  url: string
  tooltip?: string
  current?: boolean
  children?: NavItem[]
}

export interface ContentNavItem {
  label: string
  url: string
  tooltip?: string
  children?: ContentNavItem[]
}

export interface RouteContext {
  current: ContentNavItem | null
  parent: ContentNavItem | null
}

// Route i18n Types
export interface RouteI18n {
  currentBasePath: string
  getLocaledPath: (basePath: string) => string
}
