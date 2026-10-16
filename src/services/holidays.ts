export interface PublicHoliday {
  name: string
  localName: string
  date: string
}

const ENDPOINT = 'https://date.nager.at/api/v3/PublicHolidays'

async function fetchYear(year: number, countryCode: string, signal?: AbortSignal): Promise<PublicHoliday[]> {
  const response = await fetch(`${ENDPOINT}/${year}/${countryCode}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`Feiertage konnten nicht geladen werden (HTTP ${response.status}).`)
  }
  return (await response.json()) as PublicHoliday[]
}

export async function getNextPublicHoliday(countryCode: string, signal?: AbortSignal): Promise<PublicHoliday> {
  const year = new Date().getFullYear()
  const [thisYear, nextYear] = await Promise.all([
    fetchYear(year, countryCode, signal),
    fetchYear(year + 1, countryCode, signal),
  ])
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = [...thisYear, ...nextYear]
    .filter((holiday) => holiday.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
  const next = upcoming[0]
  if (!next) {
    throw new Error('Keine bevorstehenden Feiertage gefunden.')
  }
  return next
}
