// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2026-02-28',

    devtools: { enabled: true },

    modules: [
        '@nuxt/ui',
        '@nuxt/content',
        '@pinia/nuxt',
        '@nuxt/image',
        '@nuxtjs/i18n',
        '@vueuse/nuxt',
        '@nuxtjs/google-fonts',
    ],

    css: ['~/assets/css/main.css', '~/assets/scss/main.scss'],

    // ---------------------------------------------------------------------------
    // i18n – locale is handled via URL prefix /en/, /pt/, etc.
    // Supported locales are loaded at runtime from the DB (see server/utils/locales.ts)
    // ---------------------------------------------------------------------------
    i18n: {
        strategy: 'prefix',
        defaultLocale: 'en',
        locales: [
            { code: 'br', language: 'pt-BR', name: 'Português (BR)' },
            { code: 'en', language: 'en-US', name: 'English' },
        ],
        detectBrowserLanguage: true,
    },

    // ---------------------------------------------------------------------------
    // Runtime config – all secrets via .env, public keys exposed to client
    // ---------------------------------------------------------------------------
    runtimeConfig: {
        // Server-only secrets
        databaseUrl: '',
        sessionSecret: '',
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
        smtpPass: '',
        smtpFrom: 'SnapCMS <noreply@snapcms.io>',
        firebaseServiceAccount: '',     // JSON string of service account key
        firebaseStorageBucket: '',

        // Exposed to client
        public: {
            firebaseApiKey: '',
            firebaseAuthDomain: '',
            firebaseProjectId: '',
            firebaseStorageBucket: '',
            firebaseAppId: '',
            googlePlacesApiKey: '',
            appName: 'SnapCMS',
        },
    },

    // ---------------------------------------------------------------------------
    // Nuxt UI configuration
    // ---------------------------------------------------------------------------
    ui: {
        colorMode: true,
    },

    // ---------------------------------------------------------------------------
    // View transitions (slide animation between pages)
    // ---------------------------------------------------------------------------
    experimental: {
        viewTransition: true,
    },

    // ---------------------------------------------------------------------------
    // Nitro / server
    // ---------------------------------------------------------------------------
    nitro: {
        experimental: {
            database: false,
        },
    },

    // ---------------------------------------------------------------------------
    // TypeScript
    // ---------------------------------------------------------------------------
    typescript: {
        strict: true,
        typeCheck: false,
    },

    // ---------------------------------------------------------------------------
    // @nuxt/image
    // ---------------------------------------------------------------------------
    image: {
        quality: 80,
        format: ['webp', 'jpeg'],
    },

    // ---------------------------------------------------------------------------
    // Pinia
    // ---------------------------------------------------------------------------
    pinia: {
        storesDirs: ['./app/stores/**'],
    },

    // ---------------------------------------------------------------------------
    // Google Fonts – downloaded and self-hosted at build time
    // ---------------------------------------------------------------------------
    googleFonts: {
        families: {
            Inter: [300, 400, 500, 600, 700],
            'JetBrains Mono': [400, 500],
        },
        display: 'swap',
        download: true,
        preload: true,
    },
})
