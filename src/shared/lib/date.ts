const formatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDateTime(value: string | Date) {
  return formatter.format(new Date(value))
}
