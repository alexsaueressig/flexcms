// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2026-02-28',

    devtools: { enabled: true },

    modules: [
        '@nuxt/ui',
        '@pinia/nuxt',
        '@nuxt/image',
        '@nuxtjs/i18n',
        '@vueuse/nuxt',
    ],

    css: ['~/assets/scss/main.scss'],

    // ---------------------------------------------------------------------------
    // i18n – locale is handled via URL prefix /en/, /pt/, etc.
    // Supported locales are loaded at runtime from the DB (see server/utils/locales.ts)
    // ---------------------------------------------------------------------------
    i18n: {
        strategy: 'no_prefix',
        defaultLocale: 'en',
        locales: [
            { code: 'en', language: 'en-US', name: 'English' },
        ],
        vueI18n: './i18n/i18n.config.ts',
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
})
