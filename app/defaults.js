/* *
 * Global default settings are defined here
 * */

export class Defaults {
  

/* *
 * Websites currently supported
 * */
  jobUrls() {
    return [
      'https://www.indeed.com/worldwide',
      'https://www.linkedin.com/jobs',
      'https://www.careerbuilder.com/'
    ];
  }


/* *
 * Amount of "jobUrls" - used for comparing to the amount of tabs opened while searching
 * */
  supportedSitesAmount() {
    return 3;
  }


/* *
 * How often to perform searches in the background (in HOURS)
 * */
  defaultFrequency() {
    return '6';
  }


/* *
 * Limiting the amount of job listings returned from each website
 * */
  listingLimit() {
    return 50;
  }


/* *
 * Amount of job listings pagination
 * */
  listingsPageLimit() {
    return 15;
  }


/* *
 * Initialize user preferences
 * {string} keywords - job search parameters
 * {string} location - job search parameters
 * {string} frequency - how often in minutes to perform search
 * {Object []} omitted_sites - removes sites which user unchecked
 * {number} listing_limit - defaults to 50 listings per website
 * */
  userPrefs() {
    return {
      keywords: null,
      location: null,
      aggregate_results: false,
      frequency: null,
      omitted_sites: [],
      listing_limit: null
    };
  }

}
