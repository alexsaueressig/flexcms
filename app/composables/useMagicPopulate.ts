import type { BlueprintField } from '@prisma/client'

interface FieldValue {
  blueprintFieldId: string
  valueText?: string | null
  valueNumber?: number | null
  valueBool?: boolean | null
  valueJson?: unknown
  valueMedia?: string | null
}

export function useMagicPopulate(entryId: string, localeCode: string) {
  const loading = ref(false)

  async function populate(fields: BlueprintField[], existingValues: FieldValue[]) {
    const { faker } = await import('@faker-js/faker')

    const filledIds = new Set(
      existingValues
        .filter(v => v.valueText || v.valueNumber != null || v.valueBool != null || v.valueJson || v.valueMedia)
        .map(v => v.blueprintFieldId),
    )

    // Only populate empty fields
    const emptyFields = fields.filter(f => !filledIds.has(f.id))
    if (!emptyFields.length) return

    const values: FieldValue[] = emptyFields.map((field) => {
      const base = { blueprintFieldId: field.id }
      switch (field.type) {
        case 'STRING': return { ...base, valueText: faker.lorem.sentence() }
        case 'RICH_TEXT': return { ...base, valueText: `<p>${faker.lorem.paragraph()}</p>` }
        case 'NUMBER': return { ...base, valueNumber: faker.number.float({ min: 1, max: 1000, fractionDigits: 2 }) }
        case 'BOOLEAN': return { ...base, valueBool: faker.datatype.boolean() }
        case 'DATETIME': return { ...base, valueJson: { datetime: faker.date.recent().toISOString(), timezone: 'UTC' } }
        case 'DATE_RANGE': {
          const start = faker.date.recent()
          const end = faker.date.soon({ refDate: start })
          return { ...base, valueJson: { start: start.toISOString(), end: end.toISOString() } }
        }
        case 'SELECT_SINGLE': {
          const cfg = field.config as { choices?: { value: string }[] }
          const choices = cfg.choices ?? []
          return { ...base, valueText: choices.length ? faker.helpers.arrayElement(choices).value : 'option1' }
        }
        case 'SELECT_MULTI': {
          const cfg = field.config as { choices?: { value: string }[] }
          const choices = cfg.choices ?? []
          const picked = faker.helpers.arrayElements(choices, Math.min(2, choices.length)).map(c => c.value)
          return { ...base, valueText: JSON.stringify(picked) }
        }
        case 'TAGS': return { ...base, valueText: JSON.stringify([faker.word.noun(), faker.word.noun(), faker.word.noun()]) }
        case 'COLOR': return { ...base, valueText: faker.internet.color() }
        case 'GEO': return {
          ...base,
          valueJson: {
            lat: faker.location.latitude(),
            lng: faker.location.longitude(),
            address: faker.location.streetAddress(),
          },
        }
        case 'JSON': return { ...base, valueJson: { sample: faker.lorem.word(), count: faker.number.int({ max: 100 }) } }
        default: return { ...base, valueText: faker.lorem.word() }
      }
    })

    loading.value = true
    try {
      await $fetch(`/api/entries/${entryId}/values`, {
        method: 'PUT',
        body: { localeCode, values },
      })
    }
    finally {
      loading.value = false
    }
  }

  return { loading, populate }
}
