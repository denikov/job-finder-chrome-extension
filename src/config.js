/*
  global configuration variables are defined here
*/

'use strict'

export class Config {
  
  jobUrls() {
    return [
      'https://www.indeed.com/worldwide',
      'https://www.linkedin.com/jobs',
      'https://www.careerbuilder.com/'
    ];
  }

  defaultFrequency() {
    return '6';
  }

  listingLimit() {
    return 50;
  }

  supportedSitesAmount() {
    return 3;
  }

  listingsPageLimit() {
    return 15;
  }

}
