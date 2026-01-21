export interface ActivityProcess {
  name: string
  windowTitle: string
  iconUrl: string
}

export interface ActivityMedia {
  coverImg: string
  title: string
  artist?: string
  duration?: number
  elapsedTime?: number
  processName?: string
}

export interface Activity {
  active: boolean
  timestamp?: string
  updatedAt?: string
  process?: ActivityProcess | null
  media?: ActivityMedia | null
}
