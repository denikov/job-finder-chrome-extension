export class Store {

/* *
 * initializing default values
 * */

//used to temporarily store badge text when showing ... while searching
  initialBAtext = '';

//saving ID of the background window where searching is performed
//used to prevent content scripts from taking over user's current window if user navigates to a jobUrl
  workingWindowId;

/*
//initialize user preferences
//keywords and location are search parameters
//frequency is how often in minutes to perform search
//omitted_sites removes sites which user unchecked
//listing_limit defaults to 50 listings per website
*/
  userPrefs = {
    keywords: null,
    location: null,
    aggregate_results: false,
    frequency: null,
    omitted_sites: [],
    listing_limit: null
  };

  jobListings = [];

//for each search keep count and update the browserAction badge
  newListingsCount = 0;

//queue needed to eliminate a race condition if multiple tabs send "close" message at the same time
  openTabsQueue = [];

//keep count of still opened tabs
  openTabCounter = 0;



  constructor(config) {

    this._config = config;

    this.userPrefs.frequency = this._config.defaultFrequency();
    this.userPrefs.listing_limit = this._config.listingLimit();

  }


  get initialBAText() {
    return this.initialBAtext;
  }

  set initialBAText(value) {
    this.initialBAtext = value;
  }


  get workingWindowId() {
    return this.workingWindowId;
  }

  set workingWindowId(value) {
    this.workingWindowId = value;
  }

  get userPrefs() {
    return this.userPrefs;
  }

  set userPrefs(value) {
    if (typeof value == 'object') {
//value could be an array [key, value]
      this.userPrefs[value[0]] = value[1];
    }else {
//or value could be full userPrefs object
      this.userPrefs = value;
    }
  }


  get jobListings() {
    return this.jobListings;
  }

  set jobListings(value) {
    this.jobListings = value;
  }

  getFirstListing() {
    return this.jobListings[0];
  }

  get newListingsCount() {
    return this.newListingsCount;
  }

  set newListingsCount(value) {
    this.newListingsCount = value;
  }


  get openTabsQueue() {
    return this.openTabsQueue;
  }

  set openTabsQueue(value) {
    this.openTabsQueue.push(value);
  }

  addToTabsQueue(msg) {
    this.openTabsQueue.push(msg);
  }

  getQueue() {
    return this.openTabsQueue.shift();
  }


  get openTabCounter() {
    return this.openTabCounter;
  }

  set openTabCounter(value) {
    this.openTabCounter = value;
  }

  minusTabCounter() {
    return --this.openTabCounter;
  }

    
  updateBookmarks(request) {
    this.jobListings.forEach( (listing, index) => {
      if (listing.link === request.reference) {
        if (request.remove) {
          delete listing.saved;
        }else {
          listing.saved = true;
        }
        return;
      }
    })
  }

}
