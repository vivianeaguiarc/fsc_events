// Interface de domínio define quais campos um evento pode ter
export interface OnSiteEvent {
  id: string
  name: string
  ownerId: string
  ticketPriceInCents: number
  latitude: number
  longitude: number
  date: Date
}
