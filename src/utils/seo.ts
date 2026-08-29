/**
 * Central SEO constants.
 *
 * Titles and descriptions live here rather than inline in each page so the
 * whole site's search presence can be reviewed (and kept keyword-consistent)
 * in one place. Google truncates around ~60 chars for titles and ~155 for
 * descriptions, so each string below is written to stay under those limits
 * with the most important words first.
 */

export const SITE_NAME = 'RajwadiTukda'
export const SITE_URL = 'https://rajwaditukda.in'
export const BUSINESS_PHONE = '+917014253541'
export const BUSINESS_EMAIL = 'adityakp215@gmail.com'
export const INSTAGRAM_URL = 'https://www.instagram.com/rajwaditukda'

/** Jaipur, Rajasthan - used for LocalBusiness geo/address structured data. */
export const BUSINESS_ADDRESS = {
  locality: 'Jaipur',
  region: 'Rajasthan',
  country: 'IN',
  street: 'Bani Park',
  postalCode: '302016',
} as const

/** Approx. Bani Park, Jaipur - helps Google associate the business with the area. */
export const BUSINESS_GEO = { latitude: 26.9276, longitude: 75.7093 } as const

/**
 * The searches this store actually wants to win. Not stuffed into a
 * `<meta name="keywords">` (Google has ignored that tag since 2009) - these
 * are the phrases the titles, descriptions, headings and body copy below
 * are written around, and the list doubles as documentation of intent.
 */
export const TARGET_KEYWORDS = [
  'rajasthani chocolate',
  'kunafa chocolate',
  'kunafa chocolate jaipur',
  'rajwadi tukda',
  'jaipur chocolates',
  'chocolate shop in jaipur',
  'handmade chocolate jaipur',
  'north indian chocolate',
  'kunafa lollipop',
  'biscoff lollipop',
  'chocolate delivery jaipur',
  'gift chocolate jaipur',
] as const

export const DEFAULT_DESCRIPTION =
  'Handcrafted Kunafa chocolate and Rajasthani-inspired chocolates, made fresh in small batches in Jaipur with same-day delivery across the Pink City.'
