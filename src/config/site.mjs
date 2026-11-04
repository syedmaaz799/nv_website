/**
 * NeuralVarsity — site configuration (single source of truth)
 * ------------------------------------------------------------------
 * Every organisation detail rendered anywhere on the site (header, footer,
 * contact page, WhatsApp buttons, application form, PDF brochures, SEO tags)
 * is read from this file. Edit it, then run `npm run build`.
 *
 * ⚠️  Values written as "[ ... ]" are PLACEHOLDERS. They could not be pulled
 *     from the current neuralvarsity.ai site because the build environment
 *     could not reach it. The build prints a checklist of any that remain.
 */

export const site = {
  name: 'NeuralVarsity',
  legalName: 'NeuralVarsity',
  domain: 'neuralvarsity.ai',
  url: 'https://neuralvarsity.ai', // used for canonical URLs, sitemap & social cards
  tagline: 'Learn AI by building it.',
  description:
    'NeuralVarsity offers industry-focused programs in Data Analytics, Data Science, Applied AI & Machine Learning, and AI Agents & Automation — with Generative AI built into every curriculum.',

  contact: {
    // Shown on the contact page, footer, brochures and application flow.
    email: '[Email address]',              // e.g. admissions@neuralvarsity.ai
    phoneDisplay: '[Phone number]',        // e.g. +91 98765 43210 (as you want it displayed)
    phoneHref: '',                         // e.g. +919876543210 (digits for tel: links)
    whatsapp: '',                          // digits only incl. country code, e.g. 919876543210
    whatsappDisplay: '[WhatsApp number]',  // e.g. +91 98765 43210
    hours: '[Office hours]',               // e.g. Mon–Sat · 10:00 AM – 7:00 PM
  },

  // Add one object per campus / office. Leave `mapUrl` empty to hide the map link.
  locations: [
    {
      name: '[Campus name]',
      address: '[Street address]',
      city: '[City, State, Postcode]',
      mapUrl: '',
    },
  ],

  // Leave a network empty ('') to hide its icon.
  social: {
    linkedin: '',
    instagram: '',
    youtube: '',
    facebook: '',
    x: '',
  },

  forms: {
    // Optional. When set, the Apply & Contact forms POST here (Formspree, Getform,
    // Web3Forms, a Google Apps Script web app, your own API...).
    // When empty, submissions are handed off to WhatsApp (if configured) or email.
    endpoint: '',
    accessKey: '', // only needed for services such as Web3Forms
  },

  whatsappGreeting: 'Hi NeuralVarsity! I would like to know more about your programs.',
};

/** True when a value is still a "[placeholder]" or empty. */
export const isPlaceholder = (v) => !v || /^\[.*\]$/.test(String(v).trim());
