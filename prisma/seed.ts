/**
 * prisma/seed.ts
 *
 * Bootstraps the database with all required reference data:
 *  - FieldTypeDefinition rows (one per FieldType enum value)
 *  - Default locale (en)
 *  - Site-wide settings
 *  - System roles (Super Admin, Editor, Viewer)
 *  - Initial super admin user (set ADMIN_EMAIL env var or uses default)
 */

import { PrismaClient, FieldType } from '@prisma/client'

const prisma = new PrismaClient()

// ─── Field type definitions ───────────────────────────────────────────────────

const fieldTypeDefs: {
    type: FieldType
    label: string
    icon: string
    description: string
    configSchema: object
}[] = [
        {
            type: FieldType.STRING,
            label: 'Short text',
            icon: 'i-lucide-type',
            description: 'A single-line text input.',
            configSchema: {
                type: 'object',
                properties: {
                    minLength: { type: 'integer', minimum: 0 },
                    maxLength: { type: 'integer', minimum: 1 },
                    placeholder: { type: 'string' },
                },
            },
        },
        {
            type: FieldType.RICH_TEXT,
            label: 'Rich text',
            icon: 'i-lucide-pilcrow',
            description: 'A full WYSIWYG editor (Tiptap) supporting headings, lists, links, and code.',
            configSchema: {
                type: 'object',
                properties: {
                    toolbar: {
                        type: 'array',
                        items: { type: 'string' },
                        default: ['bold', 'italic', 'underline', 'strike', 'link', 'bulletList', 'orderedList', 'codeBlock'],
                    },
                },
            },
        },
        {
            type: FieldType.NUMBER,
            label: 'Number',
            icon: 'i-lucide-hash',
            description: 'An integer or decimal number field.',
            configSchema: {
                type: 'object',
                properties: {
                    min: { type: 'number' },
                    max: { type: 'number' },
                    step: { type: 'number', default: 1 },
                    prefix: { type: 'string' },
                    suffix: { type: 'string' },
                    isInteger: { type: 'boolean', default: false },
                },
            },
        },
        {
            type: FieldType.BOOLEAN,
            label: 'Boolean',
            icon: 'i-lucide-toggle-left',
            description: 'A true / false toggle.',
            configSchema: {
                type: 'object',
                properties: {
                    labelTrue: { type: 'string', default: 'Yes' },
                    labelFalse: { type: 'string', default: 'No' },
                },
            },
        },
        {
            type: FieldType.MEDIA_IMAGE,
            label: 'Image',
            icon: 'i-lucide-image',
            description: 'Auto-scaling image upload stored in Firebase Storage.',
            configSchema: {
                type: 'object',
                properties: {
                    maxSizeKb: { type: 'integer', default: 10240 },
                    allowedFormats: {
                        type: 'array',
                        items: { type: 'string' },
                        default: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
                    },
                    maxWidth: { type: 'integer' },
                    maxHeight: { type: 'integer' },
                },
            },
        },
        {
            type: FieldType.MEDIA_VIDEO,
            label: 'Video',
            icon: 'i-lucide-video',
            description: 'Video file upload stored in Firebase Storage.',
            configSchema: {
                type: 'object',
                properties: {
                    maxSizeKb: { type: 'integer', default: 512000 },
                    allowedFormats: {
                        type: 'array',
                        items: { type: 'string' },
                        default: ['mp4', 'webm', 'mov'],
                    },
                },
            },
        },
        {
            type: FieldType.MEDIA_FILE,
            label: 'File attachment',
            icon: 'i-lucide-paperclip',
            description: 'Generic file attachment (PDF, ZIP, etc.) stored in Firebase Storage.',
            configSchema: {
                type: 'object',
                properties: {
                    maxSizeKb: { type: 'integer', default: 51200 },
                    allowedFormats: {
                        type: 'array',
                        items: { type: 'string' },
                        default: ['pdf', 'zip', 'doc', 'docx', 'xls', 'xlsx', 'csv'],
                    },
                },
            },
        },
        {
            type: FieldType.DATETIME,
            label: 'Date & time',
            icon: 'i-lucide-calendar',
            description: 'Date + time picker with timezone support.',
            configSchema: {
                type: 'object',
                properties: {
                    includeTime: { type: 'boolean', default: true },
                    timezone: { type: 'string', default: 'UTC' },
                    minDate: { type: 'string', format: 'date-time' },
                    maxDate: { type: 'string', format: 'date-time' },
                },
            },
        },
        {
            type: FieldType.DATE_RANGE,
            label: 'Date range',
            icon: 'i-lucide-calendar-range',
            description: 'A start + end date pair with native timezone support.',
            configSchema: {
                type: 'object',
                properties: {
                    includeTime: { type: 'boolean', default: false },
                    timezone: { type: 'string', default: 'UTC' },
                },
            },
        },
        {
            type: FieldType.SELECT_SINGLE,
            label: 'Single select',
            icon: 'i-lucide-chevron-down',
            description: 'Pick one option from a predefined list.',
            configSchema: {
                type: 'object',
                required: ['choices'],
                properties: {
                    choices: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['value', 'label'],
                            properties: {
                                value: { type: 'string' },
                                label: { type: 'string' },
                                color: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
        {
            type: FieldType.SELECT_MULTI,
            label: 'Multi select',
            icon: 'i-lucide-list-checks',
            description: 'Pick multiple options from a predefined list.',
            configSchema: {
                type: 'object',
                required: ['choices'],
                properties: {
                    choices: {
                        type: 'array',
                        items: {
                            type: 'object',
                            required: ['value', 'label'],
                            properties: {
                                value: { type: 'string' },
                                label: { type: 'string' },
                                color: { type: 'string' },
                            },
                        },
                    },
                    maxSelections: { type: 'integer' },
                },
            },
        },
        {
            type: FieldType.TAGS,
            label: 'Tags',
            icon: 'i-lucide-tag',
            description: 'Free-form tag input with autocomplete from existing values.',
            configSchema: {
                type: 'object',
                properties: {
                    maxTags: { type: 'integer' },
                    allowNew: { type: 'boolean', default: true },
                },
            },
        },
        {
            type: FieldType.RELATION_ONE,
            label: 'Relation (one)',
            icon: 'i-lucide-link',
            description: 'Links this entry to exactly one other entry.',
            configSchema: {
                type: 'object',
                properties: {
                    relatedBlueprintEntryId: { type: 'string' },
                    displayField: { type: 'string', default: 'title' },
                },
            },
        },
        {
            type: FieldType.RELATION_MANY,
            label: 'Relation (many)',
            icon: 'i-lucide-link-2',
            description: 'Links this entry to multiple other entries.',
            configSchema: {
                type: 'object',
                properties: {
                    relatedBlueprintEntryId: { type: 'string' },
                    displayField: { type: 'string', default: 'title' },
                    maxRelations: { type: 'integer' },
                },
            },
        },
        {
            type: FieldType.GEO,
            label: 'Geospatial',
            icon: 'i-lucide-map-pin',
            description: 'Latitude/longitude with Google Places address autocomplete.',
            configSchema: {
                type: 'object',
                properties: {
                    restrictCountries: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'ISO 3166-1 alpha-2 country codes to restrict autocomplete to',
                    },
                    types: {
                        type: 'array',
                        items: { type: 'string' },
                        default: ['geocode'],
                    },
                },
            },
        },
        {
            type: FieldType.JSON,
            label: 'JSON blob',
            icon: 'i-lucide-braces',
            description: 'Free-form JSON for developers. Rendered with syntax highlighting.',
            configSchema: {
                type: 'object',
                properties: {
                    defaultValue: { type: 'object' },
                    schema: {
                        type: 'object',
                        description: 'Optional JSON Schema to validate the value against',
                    },
                },
            },
        },
        {
            type: FieldType.COLOR,
            label: 'Color',
            icon: 'i-lucide-palette',
            description: 'Color picker outputting a hex string.',
            configSchema: {
                type: 'object',
                properties: {
                    format: {
                        type: 'string',
                        enum: ['hex', 'rgb', 'hsl'],
                        default: 'hex',
                    },
                    allowAlpha: { type: 'boolean', default: false },
                    presets: {
                        type: 'array',
                        items: { type: 'string' },
                    },
                },
            },
        },
    ]

// ─── Site settings ────────────────────────────────────────────────────────────

const defaultSettings = [
    { key: 'site_name', value: '"SnapCMS"', label: 'Site name', group: 'general' },
    { key: 'otp_expiry_minutes', value: '15', label: 'OTP expiry (minutes)', group: 'auth' },
    { key: 'session_duration_days', value: '30', label: 'Session duration (days)', group: 'auth' },
    { key: 'max_upload_size_kb', value: '51200', label: 'Max upload size (KB)', group: 'media' },
    { key: 'supported_image_formats', value: '["jpg","jpeg","png","webp","gif","svg"]', label: 'Supported image formats', group: 'media' },
    { key: 'pagination_default_limit', value: '25', label: 'Default entries per page', group: 'ui' },
    { key: 'pagination_max_limit', value: '200', label: 'Maximum entries per page', group: 'ui' },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🌱 Seeding SnapCMS database…')

    // 1. Default locale
    await prisma.locale.upsert({
        where: { code: 'en' },
        update: {},
        create: { code: 'en', name: 'English', language: 'en-US', isDefault: true, isActive: true },
    })
    console.log('  ✓ Default locale (en) created')

    // 2. Field type definitions
    for (const def of fieldTypeDefs) {
        await prisma.fieldTypeDefinition.upsert({
            where: { type: def.type },
            update: { label: def.label, icon: def.icon, description: def.description, configSchema: def.configSchema },
            create: { ...def, configSchema: def.configSchema as object },
        })
    }
    console.log(`  ✓ ${fieldTypeDefs.length} field type definitions seeded`)

    // 3. Site settings
    for (const setting of defaultSettings) {
        await prisma.siteSetting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        })
    }
    console.log(`  ✓ ${defaultSettings.length} site settings seeded`)

    // 4. System roles
    const superAdmin = await prisma.role.upsert({
        where: { name: 'Super Admin' },
        update: {},
        create: {
            name: 'Super Admin',
            description: 'Full access to everything. Cannot be deleted.',
            isSystem: true,
            permissions: {
                create: [{ canView: true, canCreate: true, canEdit: true, canArchive: true }],
            },
        },
    })

    const editor = await prisma.role.upsert({
        where: { name: 'Editor' },
        update: {},
        create: {
            name: 'Editor',
            description: 'Can create and edit entries but cannot archive.',
            isSystem: true,
            permissions: {
                create: [{ canView: true, canCreate: true, canEdit: true, canArchive: false }],
            },
        },
    })

    await prisma.role.upsert({
        where: { name: 'Viewer' },
        update: {},
        create: {
            name: 'Viewer',
            description: 'Read-only access to all entries.',
            isSystem: true,
            permissions: {
                create: [{ canView: true, canCreate: false, canEdit: false, canArchive: false }],
            },
        },
    })
    console.log('  ✓ System roles seeded (Super Admin, Editor, Viewer)')

    // 5. Initial super admin user
    const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@snapcms.io'
    const adminName = process.env.ADMIN_NAME ?? 'System Admin'

    const adminUser = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: { email: adminEmail, name: adminName, status: 'ACTIVE' },
    })

    await prisma.userRole.upsert({
        where: { userId_roleId: { userId: adminUser.id, roleId: superAdmin.id } },
        update: {},
        create: { userId: adminUser.id, roleId: superAdmin.id },
    })
    console.log(`  ✓ Admin user created: ${adminEmail}`)

    console.log('✅ Seeding complete.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
