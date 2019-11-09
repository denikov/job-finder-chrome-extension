/*
  global configuration variables are defined here
*/

'use strict'

export class Config {
  
  constructor() {

    this.defaultFrequency = '6';
    this.listingLimit = 50;

    this.jobUrls = [
      'https://www.indeed.com/worldwide',
      'https://www.linkedin.com/jobs',
      'https://www.careerbuilder.com/'
    ]

//define pagination limit
    this.listingsPageLimit = 15;

//used for error checking if user deselects all sites
    this.supportedSitesAmount = 3;

  }

}
