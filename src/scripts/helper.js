'use strict'

export default class Helper {

  constructor() {}

//compare returned listings to saved ones
  findNewListings(listings, oldListings) {
    let newListingsCount = 0;

    listings.forEach((newListing, n) => {
      let listingFound = false;

      oldListings.forEach((oldListing, o) => {
        if (oldListing.link == newListing.link) {
          oldListing.date = newListing.date;
          oldListing['last_updated'] = newListing.last_updated;
          listingFound = true;
          return;
        }
      })

      if (!listingFound) {
        newListingsCount++;
        oldListings.unshift(newListing);
      }
    })

    return newListingsCount;
  }


//function to extract and calculate the exact date
  formatDate(date) {
    if (/today/gi.test(date)) {
      return new Date().getTime();
    }else if (/[0-9]-+/g.test(date)) {
//in case the date is 2019-11-11
      return new Date(date).getTime();
    }else {
      if (/hour/gi.test(date)) {
        return new Date().getTime() - (parseInt(date.match(/\d+/g)[0]) * 60000 * 60); //2 hours ago: today-(extract number * 1min * 1hr)
      }else if (/day/gi.test(date)) {
        return new Date().getTime() - (parseInt(date.match(/\d+/g)[0]) * 60000 * 60 * 24); //2 days ago: today-(extract number * 1min * 1hr * 1day)
      }else if (/week/gi.test(date)) {
        return new Date().getTime() - (parseInt(date.match(/\d+/g)[0]) * 60000 * 60 * 24 * 7); //2 days ago: today-(extract number * 1min * 1hr * 1day * 7days)
      }else if (/month/gi.test(date)) {
        return new Date().getTime() - (parseInt(date.match(/\d+/g)[0]) * 60000 * 60 * 24 * 7 * 4); //2 days ago: today-(extract number * 1min * 1hr * 1day * 7days * 4 weeks)
      }
    }
  }

  
//sort listings by date
  sortListings(listings) {

//get the date for a, b listing
//convert into timestamps and compare
    
    return listings.sort( (a, b) => this.formatDate(b.date) - this.formatDate(a.date))
  }

}
