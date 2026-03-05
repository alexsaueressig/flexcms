import FieldString from '~/components/fields/FieldString.vue'
import FieldRichText from '~/components/fields/FieldRichText.vue'
import FieldNumber from '~/components/fields/FieldNumber.vue'
import FieldBoolean from '~/components/fields/FieldBoolean.vue'
import FieldMedia from '~/components/fields/FieldMedia.vue'
import FieldDateTime from '~/components/fields/FieldDateTime.vue'
import FieldDateRange from '~/components/fields/FieldDateRange.vue'
import FieldSelectSingle from '~/components/fields/FieldSelectSingle.vue'
import FieldSelectMulti from '~/components/fields/FieldSelectMulti.vue'
import FieldTags from '~/components/fields/FieldTags.vue'
import FieldRelation from '~/components/fields/FieldRelation.vue'
import FieldGeo from '~/components/fields/FieldGeo.vue'
import FieldJson from '~/components/fields/FieldJson.vue'
import FieldColor from '~/components/fields/FieldColor.vue'

const componentMap: Record<string, any> = {
    STRING: FieldString,
    RICH_TEXT: FieldRichText,
    NUMBER: FieldNumber,
    BOOLEAN: FieldBoolean,
    MEDIA_IMAGE: FieldMedia,
    MEDIA_VIDEO: FieldMedia,
    MEDIA_FILE: FieldMedia,
    DATETIME: FieldDateTime,
    DATE_RANGE: FieldDateRange,
    SELECT_SINGLE: FieldSelectSingle,
    SELECT_MULTI: FieldSelectMulti,
    TAGS: FieldTags,
    RELATION_ONE: FieldRelation,
    RELATION_MANY: FieldRelation,
    GEO: FieldGeo,
    JSON: FieldJson,
    COLOR: FieldColor,
}

const typeLabelMap: Record<string, string> = {
    STRING: 'Text', RICH_TEXT: 'Rich text', NUMBER: 'Number', BOOLEAN: 'Boolean',
    MEDIA_IMAGE: 'Image', MEDIA_VIDEO: 'Video', MEDIA_FILE: 'File',
    DATETIME: 'Date/time', DATE_RANGE: 'Date range',
    SELECT_SINGLE: 'Select', SELECT_MULTI: 'Multi-select',
    TAGS: 'Tags', RELATION_ONE: 'Relation', RELATION_MANY: 'Relations',
    GEO: 'Geo', JSON: 'JSON', COLOR: 'Color',
}

export function useFieldTypes() {
    function fieldComponent(type: string) {
        return componentMap[type] ?? FieldString
    }
    function typeLabel(type: string): string {
        return typeLabelMap[type] ?? type
    }
    return { fieldComponent, typeLabel }
}
