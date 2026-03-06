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

    // 1. Default locale (br) + secondary locale (en)
    await prisma.locale.upsert({
        where: { code: 'br' },
        update: {},
        create: { code: 'br', name: 'Português (Brasil)', language: 'pt-BR', isDefault: true, isActive: true },
    })
    await prisma.locale.upsert({
        where: { code: 'en' },
        update: {},
        create: { code: 'en', name: 'English', language: 'en-US', isDefault: false, isActive: true },
    })
    console.log('  ✓ Default locale (br) + English (en) created')

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
                create: [{ canView: true, canCreate: true, canEdit: true, canPublish: true, canArchive: true }],
            },
        },
    })

    await prisma.role.upsert({
        where: { name: 'Publisher' },
        update: {},
        create: {
            name: 'Publisher',
            description: 'Can create, edit, and publish entries but cannot archive.',
            isSystem: true,
            permissions: {
                create: [{ canView: true, canCreate: true, canEdit: true, canPublish: true, canArchive: false }],
            },
        },
    })

    const editor = await prisma.role.upsert({
        where: { name: 'Editor' },
        update: {},
        create: {
            name: 'Editor',
            description: 'Can create and edit entries but cannot publish or archive.',
            isSystem: true,
            permissions: {
                create: [{ canView: true, canCreate: true, canEdit: true, canPublish: false, canArchive: false }],
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
                create: [{ canView: true, canCreate: false, canEdit: false, canPublish: false, canArchive: false }],
            },
        },
    })
    console.log('  ✓ System roles seeded (Super Admin, Publisher, Editor, Viewer)')

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

    // 6. News Categories parent entry + blueprint + 3 categories
    const categoriesParent = await prisma.entry.create({
        data: {
            slug: 'news-categories',
            title: 'News Categories',
            order: 0,
            createdBy: adminUser.id,
        },
    })

    const categoriesBlueprint = await prisma.blueprint.create({
        data: {
            entryId: categoriesParent.id,
            description: 'Blueprint for news categories',
            fields: {
                create: [
                    { key: 'name', label: 'Name', type: FieldType.STRING, order: 0, isRequired: true },
                    { key: 'description', label: 'Description', type: FieldType.RICH_TEXT, order: 1 },
                    { key: 'color', label: 'Color', type: FieldType.COLOR, order: 2 },
                ],
            },
        },
        include: { fields: true },
    })

    const catNameField = categoriesBlueprint.fields.find(f => f.key === 'name')!
    const catDescField = categoriesBlueprint.fields.find(f => f.key === 'description')!
    const catColorField = categoriesBlueprint.fields.find(f => f.key === 'color')!

    const categoriesData = [
        {
            slug: 'technology',
            title: 'Technology',
            names: { br: 'Tecnologia', en: 'Technology' },
            descriptions: { br: '<p>Notícias sobre tecnologia e inovação.</p>', en: '<p>News about technology and innovation.</p>' },
            color: '#3B82F6',
        },
        {
            slug: 'business',
            title: 'Business',
            names: { br: 'Negócios', en: 'Business' },
            descriptions: { br: '<p>Notícias sobre negócios e economia.</p>', en: '<p>News about business and economy.</p>' },
            color: '#10B981',
        },
        {
            slug: 'lifestyle',
            title: 'Lifestyle',
            names: { br: 'Estilo de vida', en: 'Lifestyle' },
            descriptions: { br: '<p>Notícias sobre estilo de vida e cultura.</p>', en: '<p>News about lifestyle and culture.</p>' },
            color: '#F59E0B',
        },
    ]

    const categoryEntries: Record<string, string> = {}
    for (const cat of categoriesData) {
        const entry = await prisma.entry.create({
            data: {
                slug: cat.slug,
                title: cat.title,
                parentId: categoriesParent.id,
                order: categoriesData.indexOf(cat),
                createdBy: adminUser.id,
            },
        })
        categoryEntries[cat.slug] = entry.id
        for (const locale of ['br', 'en'] as const) {
            await prisma.fieldValue.createMany({
                data: [
                    { entryId: entry.id, blueprintFieldId: catNameField.id, localeCode: locale, valueText: cat.names[locale] },
                    { entryId: entry.id, blueprintFieldId: catDescField.id, localeCode: locale, valueText: cat.descriptions[locale] },
                    { entryId: entry.id, blueprintFieldId: catColorField.id, localeCode: locale, valueText: cat.color },
                ],
            })
        }
    }
    console.log('  ✓ 3 news categories seeded')

    // 7. News parent entry + blueprint + 15 news articles
    const newsParent = await prisma.entry.create({
        data: {
            slug: 'news',
            title: 'News',
            order: 1,
            createdBy: adminUser.id,
        },
    })

    const newsBlueprint = await prisma.blueprint.create({
        data: {
            entryId: newsParent.id,
            description: 'Blueprint for news articles',
            fields: {
                create: [
                    { key: 'headline', label: 'Headline', type: FieldType.STRING, order: 0, isRequired: true },
                    { key: 'excerpt', label: 'Excerpt', type: FieldType.STRING, order: 1 },
                    { key: 'body', label: 'Body', type: FieldType.RICH_TEXT, order: 2, isRequired: true },
                    { key: 'published_at', label: 'Published at', type: FieldType.DATETIME, order: 3, config: { includeTime: true, timezone: 'UTC' } },
                    { key: 'is_featured', label: 'Featured', type: FieldType.BOOLEAN, order: 4 },
                    { key: 'category', label: 'Category', type: FieldType.RELATION_ONE, order: 5, config: { relatedBlueprintEntryId: categoriesParent.id, displayField: 'title' } },
                ],
            },
        },
        include: { fields: true },
    })

    const headlineField = newsBlueprint.fields.find(f => f.key === 'headline')!
    const excerptField = newsBlueprint.fields.find(f => f.key === 'excerpt')!
    const bodyField = newsBlueprint.fields.find(f => f.key === 'body')!
    const publishedAtField = newsBlueprint.fields.find(f => f.key === 'published_at')!
    const isFeaturedField = newsBlueprint.fields.find(f => f.key === 'is_featured')!
    const categoryField = newsBlueprint.fields.find(f => f.key === 'category')!

    const newsArticles = [
        {
            slug: 'ai-revolutionizes-healthcare',
            title: 'AI Revolutionizes Healthcare',
            category: 'technology',
            featured: true,
            daysAgo: 1,
            br: {
                headline: 'IA revoluciona a saúde',
                excerpt: 'Novas ferramentas de inteligência artificial estão transformando diagnósticos médicos.',
                body: '<p>A inteligência artificial está mudando fundamentalmente a forma como os médicos diagnosticam e tratam doenças. Novos algoritmos de aprendizado de máquina podem detectar padrões em exames de imagem com precisão superior à dos especialistas humanos.</p><p>Hospitais em todo o Brasil já estão adotando essas tecnologias para melhorar o atendimento aos pacientes.</p>',
            },
            en: {
                headline: 'AI Revolutionizes Healthcare',
                excerpt: 'New artificial intelligence tools are transforming medical diagnostics.',
                body: '<p>Artificial intelligence is fundamentally changing how doctors diagnose and treat diseases. New machine learning algorithms can detect patterns in imaging exams with accuracy surpassing human specialists.</p><p>Hospitals worldwide are already adopting these technologies to improve patient care.</p>',
            },
        },
        {
            slug: 'startup-funding-record',
            title: 'Startup Funding Hits Record',
            category: 'business',
            featured: true,
            daysAgo: 2,
            br: {
                headline: 'Financiamento de startups bate recorde',
                excerpt: 'Investimentos em startups brasileiras atingem valores históricos em 2026.',
                body: '<p>O ecossistema de startups brasileiro registrou um recorde de investimentos no primeiro trimestre de 2026. Mais de R$ 15 bilhões foram aportados em empresas de tecnologia em estágio inicial.</p><p>Os setores de fintech e healthtech lideram as rodadas de investimento.</p>',
            },
            en: {
                headline: 'Startup Funding Hits Record',
                excerpt: 'Investments in Brazilian startups reach historic values in 2026.',
                body: '<p>The Brazilian startup ecosystem recorded a record level of investment in the first quarter of 2026. Over R$15 billion was invested in early-stage tech companies.</p><p>The fintech and healthtech sectors lead the investment rounds.</p>',
            },
        },
        {
            slug: 'remote-work-new-normal',
            title: 'Remote Work Is the New Normal',
            category: 'lifestyle',
            featured: true,
            daysAgo: 3,
            br: {
                headline: 'Trabalho remoto é o novo normal',
                excerpt: 'Pesquisa mostra que 70% dos profissionais preferem o modelo híbrido.',
                body: '<p>Uma pesquisa realizada com mais de 10 mil profissionais brasileiros revela que o trabalho remoto se consolidou como preferência. Cerca de 70% dos entrevistados afirmam preferir o modelo híbrido.</p><p>Empresas estão adaptando seus escritórios para espaços de colaboração em vez de estações de trabalho individuais.</p>',
            },
            en: {
                headline: 'Remote Work Is the New Normal',
                excerpt: 'Survey shows 70% of professionals prefer the hybrid model.',
                body: '<p>A survey of over 10,000 Brazilian professionals reveals that remote work has become the preferred choice. About 70% of respondents say they prefer the hybrid model.</p><p>Companies are adapting their offices into collaboration spaces rather than individual workstations.</p>',
            },
        },
        {
            slug: 'quantum-computing-breakthrough',
            title: 'Quantum Computing Breakthrough',
            category: 'technology',
            featured: false,
            daysAgo: 4,
            br: {
                headline: 'Avanço na computação quântica',
                excerpt: 'Pesquisadores alcançam novo marco em processadores quânticos.',
                body: '<p>Cientistas anunciaram um avanço significativo na computação quântica, demonstrando um processador capaz de realizar cálculos que levariam milhares de anos em computadores tradicionais.</p><p>A descoberta abre portas para aplicações práticas em criptografia e simulação molecular.</p>',
            },
            en: {
                headline: 'Quantum Computing Breakthrough',
                excerpt: 'Researchers achieve new milestone in quantum processors.',
                body: '<p>Scientists announced a significant breakthrough in quantum computing, demonstrating a processor capable of performing calculations that would take thousands of years on traditional computers.</p><p>The discovery opens doors for practical applications in cryptography and molecular simulation.</p>',
            },
        },
        {
            slug: 'green-energy-investments-surge',
            title: 'Green Energy Investments Surge',
            category: 'business',
            featured: false,
            daysAgo: 5,
            br: {
                headline: 'Investimentos em energia verde disparam',
                excerpt: 'Brasil se torna líder em investimentos em energia renovável na América Latina.',
                body: '<p>O Brasil consolidou sua posição como líder em investimentos em energia renovável na América Latina. O setor de energia solar cresceu 45% em relação ao ano anterior.</p><p>Novas políticas governamentais e incentivos fiscais têm atraído investidores internacionais para projetos de energia limpa no país.</p>',
            },
            en: {
                headline: 'Green Energy Investments Surge',
                excerpt: 'Brazil becomes the leader in renewable energy investments in Latin America.',
                body: '<p>Brazil has consolidated its position as the leader in renewable energy investments in Latin America. The solar energy sector grew 45% compared to the previous year.</p><p>New government policies and tax incentives have attracted international investors to clean energy projects in the country.</p>',
            },
        },
        {
            slug: 'digital-nomad-visas-expand',
            title: 'Digital Nomad Visas Expand',
            category: 'lifestyle',
            featured: false,
            daysAgo: 6,
            br: {
                headline: 'Vistos para nômades digitais se expandem',
                excerpt: 'Mais países oferecem vistos especiais para trabalhadores remotos.',
                body: '<p>O número de países que oferecem vistos para nômades digitais cresceu significativamente. Em 2026, mais de 60 nações possuem programas dedicados a atrair trabalhadores remotos.</p><p>O Brasil lançou seu próprio programa, oferecendo vistos de até dois anos para profissionais estrangeiros que trabalham remotamente.</p>',
            },
            en: {
                headline: 'Digital Nomad Visas Expand',
                excerpt: 'More countries offer special visas for remote workers.',
                body: '<p>The number of countries offering digital nomad visas has grown significantly. In 2026, over 60 nations have dedicated programs to attract remote workers.</p><p>Brazil launched its own program, offering visas of up to two years for foreign professionals who work remotely.</p>',
            },
        },
        {
            slug: 'cybersecurity-threats-rise',
            title: 'Cybersecurity Threats on the Rise',
            category: 'technology',
            featured: false,
            daysAgo: 7,
            br: {
                headline: 'Ameaças de cibersegurança em alta',
                excerpt: 'Ataques cibernéticos aumentaram 300% no último ano.',
                body: '<p>Relatórios de segurança digital apontam um aumento de 300% nos ataques cibernéticos globais no último ano. Ransomware e phishing continuam sendo as principais ameaças.</p><p>Especialistas recomendam que empresas invistam em treinamento de funcionários e adotem autenticação multifator em todos os sistemas.</p>',
            },
            en: {
                headline: 'Cybersecurity Threats on the Rise',
                excerpt: 'Cyberattacks increased by 300% in the last year.',
                body: '<p>Digital security reports indicate a 300% increase in global cyberattacks in the last year. Ransomware and phishing remain the main threats.</p><p>Experts recommend that companies invest in employee training and adopt multi-factor authentication across all systems.</p>',
            },
        },
        {
            slug: 'ecommerce-growth-continues',
            title: 'E-Commerce Growth Continues',
            category: 'business',
            featured: false,
            daysAgo: 8,
            br: {
                headline: 'Crescimento do e-commerce continua',
                excerpt: 'Comércio eletrônico brasileiro cresce 25% e supera expectativas.',
                body: '<p>O comércio eletrônico brasileiro registrou um crescimento de 25% no primeiro semestre de 2026, superando as previsões dos analistas. O setor movimentou mais de R$ 90 bilhões.</p><p>A expansão da logística de entrega rápida e a popularização dos pagamentos via Pix impulsionaram as vendas online.</p>',
            },
            en: {
                headline: 'E-Commerce Growth Continues',
                excerpt: 'Brazilian e-commerce grows 25% and surpasses expectations.',
                body: '<p>Brazilian e-commerce recorded a 25% growth in the first half of 2026, surpassing analyst forecasts. The sector moved over R$90 billion.</p><p>The expansion of fast delivery logistics and the popularization of Pix payments boosted online sales.</p>',
            },
        },
        {
            slug: 'mental-health-awareness-grows',
            title: 'Mental Health Awareness Grows',
            category: 'lifestyle',
            featured: false,
            daysAgo: 9,
            br: {
                headline: 'Conscientização sobre saúde mental cresce',
                excerpt: 'Empresas brasileiras adotam programas de bem-estar para funcionários.',
                body: '<p>A conscientização sobre saúde mental no ambiente de trabalho tem crescido significativamente no Brasil. Mais de 60% das grandes empresas agora oferecem programas de bem-estar emocional.</p><p>Psicólogos destacam a importância de criar ambientes de trabalho que promovam a saúde mental e reduzam o burnout.</p>',
            },
            en: {
                headline: 'Mental Health Awareness Grows',
                excerpt: 'Brazilian companies adopt wellness programs for employees.',
                body: '<p>Mental health awareness in the workplace has grown significantly in Brazil. Over 60% of large companies now offer emotional wellness programs.</p><p>Psychologists highlight the importance of creating work environments that promote mental health and reduce burnout.</p>',
            },
        },
        {
            slug: '5g-rollout-accelerates',
            title: '5G Rollout Accelerates',
            category: 'technology',
            featured: false,
            daysAgo: 10,
            br: {
                headline: 'Expansão do 5G acelera',
                excerpt: 'Cobertura 5G atinge 80% das capitais brasileiras.',
                body: '<p>A cobertura 5G no Brasil atingiu 80% das capitais, marcando um avanço significativo na infraestrutura de telecomunicações do país.</p><p>As operadoras planejam expandir a cobertura para cidades do interior até o final do ano, possibilitando novas aplicações em IoT e indústria 4.0.</p>',
            },
            en: {
                headline: '5G Rollout Accelerates',
                excerpt: '5G coverage reaches 80% of Brazilian state capitals.',
                body: '<p>5G coverage in Brazil has reached 80% of state capitals, marking a significant advancement in the country\'s telecommunications infrastructure.</p><p>Carriers plan to expand coverage to inland cities by the end of the year, enabling new applications in IoT and Industry 4.0.</p>',
            },
        },
        {
            slug: 'sustainable-fashion-trend',
            title: 'Sustainable Fashion on the Rise',
            category: 'lifestyle',
            featured: false,
            daysAgo: 11,
            br: {
                headline: 'Moda sustentável em alta',
                excerpt: 'Consumidores brasileiros buscam marcas com práticas ecológicas.',
                body: '<p>A moda sustentável ganhou força no mercado brasileiro. Pesquisas indicam que 55% dos consumidores estão dispostos a pagar mais por roupas produzidas de forma sustentável.</p><p>Marcas nacionais estão investindo em materiais reciclados e processos de produção com menor impacto ambiental.</p>',
            },
            en: {
                headline: 'Sustainable Fashion on the Rise',
                excerpt: 'Brazilian consumers seek brands with eco-friendly practices.',
                body: '<p>Sustainable fashion has gained momentum in the Brazilian market. Research indicates that 55% of consumers are willing to pay more for sustainably produced clothing.</p><p>National brands are investing in recycled materials and production processes with lower environmental impact.</p>',
            },
        },
        {
            slug: 'fintech-revolution-banking',
            title: 'Fintech Revolution in Banking',
            category: 'business',
            featured: false,
            daysAgo: 12,
            br: {
                headline: 'Revolução fintech no setor bancário',
                excerpt: 'Bancos digitais conquistam 40% do mercado brasileiro.',
                body: '<p>Os bancos digitais conquistaram 40% do mercado bancário brasileiro, desafiando as instituições financeiras tradicionais. O Pix processou mais de 4 bilhões de transações por mês.</p><p>A tendência de open banking também ganha força, permitindo que consumidores compartilhem dados entre instituições para obter melhores condições.</p>',
            },
            en: {
                headline: 'Fintech Revolution in Banking',
                excerpt: 'Digital banks capture 40% of the Brazilian market.',
                body: '<p>Digital banks have captured 40% of the Brazilian banking market, challenging traditional financial institutions. Pix processed over 4 billion transactions per month.</p><p>The open banking trend is also gaining strength, allowing consumers to share data between institutions for better terms.</p>',
            },
        },
        {
            slug: 'space-tourism-becomes-reality',
            title: 'Space Tourism Becomes Reality',
            category: 'technology',
            featured: false,
            daysAgo: 13,
            br: {
                headline: 'Turismo espacial se torna realidade',
                excerpt: 'Primeiros voos comerciais para o espaço são anunciados para 2027.',
                body: '<p>Empresas de turismo espacial anunciaram os primeiros voos comerciais regulares para 2027. Os pacotes incluem experiências em órbita terrestre com duração de até três dias.</p><p>Embora os preços ainda sejam elevados, especialistas preveem que o custo cairá significativamente na próxima década.</p>',
            },
            en: {
                headline: 'Space Tourism Becomes Reality',
                excerpt: 'First commercial space flights announced for 2027.',
                body: '<p>Space tourism companies announced the first regular commercial flights for 2027. Packages include experiences in Earth orbit lasting up to three days.</p><p>Although prices are still high, experts predict costs will drop significantly in the next decade.</p>',
            },
        },
        {
            slug: 'food-delivery-market-evolves',
            title: 'Food Delivery Market Evolves',
            category: 'business',
            featured: false,
            daysAgo: 14,
            br: {
                headline: 'Mercado de delivery se transforma',
                excerpt: 'Dark kitchens e entregas por drones mudam o setor alimentício.',
                body: '<p>O mercado de delivery de alimentos está passando por uma transformação profunda. Dark kitchens — cozinhas exclusivas para entregas — proliferam nas grandes cidades brasileiras.</p><p>Testes com entregas por drones já estão em andamento em São Paulo e Brasília, prometendo reduzir o tempo de entrega para menos de 15 minutos.</p>',
            },
            en: {
                headline: 'Food Delivery Market Evolves',
                excerpt: 'Dark kitchens and drone deliveries reshape the food industry.',
                body: '<p>The food delivery market is undergoing a profound transformation. Dark kitchens — delivery-only kitchens — are proliferating in major Brazilian cities.</p><p>Tests with drone deliveries are already underway in São Paulo and Brasília, promising to reduce delivery times to under 15 minutes.</p>',
            },
        },
        {
            slug: 'plant-based-diets-mainstream',
            title: 'Plant-Based Diets Go Mainstream',
            category: 'lifestyle',
            featured: false,
            daysAgo: 15,
            br: {
                headline: 'Dietas plant-based se tornam populares',
                excerpt: 'Mercado de alimentos à base de plantas cresce 35% no Brasil.',
                body: '<p>O mercado de alimentos à base de plantas cresceu 35% no Brasil em 2025. Supermercados dedicam cada vez mais espaço para produtos veganos e vegetarianos.</p><p>Redes de fast food também ampliaram seus cardápios com opções plant-based, atendendo à crescente demanda dos consumidores por alternativas mais saudáveis.</p>',
            },
            en: {
                headline: 'Plant-Based Diets Go Mainstream',
                excerpt: 'Plant-based food market grows 35% in Brazil.',
                body: '<p>The plant-based food market grew 35% in Brazil in 2025. Supermarkets are dedicating more shelf space to vegan and vegetarian products.</p><p>Fast food chains have also expanded their menus with plant-based options, meeting growing consumer demand for healthier alternatives.</p>',
            },
        },
    ]

    const now = new Date()
    for (let i = 0; i < newsArticles.length; i++) {
        const article = newsArticles[i]
        const entry = await prisma.entry.create({
            data: {
                slug: article.slug,
                title: article.title,
                parentId: newsParent.id,
                order: i,
                createdBy: adminUser.id,
            },
        })

        const publishDate = new Date(now)
        publishDate.setDate(publishDate.getDate() - article.daysAgo)

        for (const locale of ['br', 'en'] as const) {
            const loc = article[locale]
            await prisma.fieldValue.createMany({
                data: [
                    { entryId: entry.id, blueprintFieldId: headlineField.id, localeCode: locale, valueText: loc.headline },
                    { entryId: entry.id, blueprintFieldId: excerptField.id, localeCode: locale, valueText: loc.excerpt },
                    { entryId: entry.id, blueprintFieldId: bodyField.id, localeCode: locale, valueText: loc.body },
                    { entryId: entry.id, blueprintFieldId: publishedAtField.id, localeCode: locale, valueJson: { iso: publishDate.toISOString() } },
                    { entryId: entry.id, blueprintFieldId: isFeaturedField.id, localeCode: locale, valueBool: article.featured },
                ],
            })
        }

        // Create the category relation
        await prisma.entryRelation.create({
            data: {
                sourceEntryId: entry.id,
                targetEntryId: categoryEntries[article.category],
                blueprintFieldId: categoryField.id,
            },
        })
    }
    console.log('  ✓ 15 news articles seeded with bilingual content')

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
