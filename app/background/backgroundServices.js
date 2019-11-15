'use strict'

export default class Services {

  constructor(defaults, model) {
    this._defaults = defaults;
    this._model = model;
  }


/* *
 * Compare returned listings to saved ones
 * @param {Object []} listings - array of newly returned job listings
 * @param {Object []} oldListings - array of saved job listings
 * */
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


/* *
 * Function to extract and calculate the exact date
 * @param {string} date - date text from each website specifying when the listing was posted
 * */
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


/* *
 * Sort listings by date
 * @param {Object []} listings - array of job listings in a random order
 * */
  sortListings(listings) {

//get the date for a, b listing
//convert into timestamps and compare
    return listings.sort( (a, b) => this.formatDate(b.date) - this.formatDate(a.date))
  }


/* *
 * User initiated a job search
 * */
  async runJobSearch() {

//show loading badge to user
    chrome.browserAction.getBadgeText({}, result => {
      this._model.saveInitialBAtext(result);
      chrome.browserAction.setBadgeText({
        text: '...'
      })
    })

    let urlsToOpen = [...this._defaults.jobUrls()];

    const userPrefs = await this._model.getPrefs();
    let omitted_sites = [...userPrefs.omitted_sites];

//sort omitted sites in order to splice the lowest index first
    if (omitted_sites.length > 0) {
      omitted_sites.sort();
    }

    for (let i = omitted_sites.length - 1; i >= 0; i--) {
      const siteIndex = parseInt(omitted_sites[i].match(/\d+/g)[0]);
      urlsToOpen.splice(siteIndex, 1);
    }

//check if incognito is activated by user
    chrome.extension.isAllowedIncognitoAccess(isAllowedAccess => {

//get current window...setting focused: false for the working window does not open in background on MAC
      chrome.windows.getCurrent(winCurrent => {
        chrome.windows.create({
          incognito: isAllowedAccess,
          state: 'minimized',
          focused: false,
          url: urlsToOpen
        }, win => {

          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            chrome.windows.remove(win.id);
          }else {
//keeping count of currently opened URLs
            this._model.saveWorkingWindowId(win.id);
            this._model.saveOpenTabCounter(urlsToOpen.length);
          }

        })
      })
    })
  }


/* *
 * Messages coming in from opened tabs
 * */
  async handleMessages() {

    const msg = await this._model.openTabsQueueFirst();
    if (msg.type === 'close') {
      const openTabCounter = await this._model.minusTabCounter();

      if (openTabCounter > 0) {
        chrome.tabs.remove(msg.tabId);

      }else {
//remove window if only one tab left
        const workingWindowId = await this._model.workingWindowId();
        chrome.windows.remove(workingWindowId);
        this._model.saveWorkingWindowId();

      }

      if (msg.data) {
        this.processReturnedListings(msg.data);
      }

//continue handlings messages only after returned listings were processed to avoid conflict
      const openTabsQueue = await this._model.openTabsQueue();
      if (openTabsQueue.length > 0) {
        this.handleMessages();
      }

    }else if (msg.type === 'userPrefs') {
//content script is requesting user search parameters
      
      const userPrefs = await this._model.getPrefs();
      chrome.tabs.sendMessage(msg.tabId, {
        type: 'userPrefs',
        prefs: userPrefs
      });
    }
  }


/* *
 * Send a message to popup in case it's open to finish updating listings
 * @param {Object []} listings - array of job listings to send to the popup page
 * @param {number} newCount - amount of new job listings found
 * */
  messageToPopup(listings, newCount) {

    chrome.runtime.sendMessage({
      listings: listings
    }, response => {
      if (chrome.runtime.lastError) {
//error if popup is not open; alert user of new listings using the badge. Listings get updated if popup is open
        
//get current browserAction badge text
//update browserAction badge with new listings count
        chrome.browserAction.getBadgeText({}, result => {

//badge text could be ... while searching
          this._model.initialBAtext()
            .then(initialBAtext => {
              if (initialBAtext && /\w+/gi.test(initialBAtext)) {
                result = initialBAtext;
              }else {
//badge could be empty...set to 0
                result = '0';
              }
              if (result.indexOf('+') > -1) {
                return;
              }

              const badgeText = parseInt(result) + newCount;
              if (badgeText === 0) {
                chrome.browserAction.setBadgeText({
                  text: ''
                })
                return;
              }
              chrome.browserAction.setBadgeText({
                text: badgeText > 99 ? '99+' : badgeText.toString()
              })
              this._model.saveNewListingsCount();
            });
        })

      }else {
        chrome.browserAction.setBadgeText({
          text: ''
        })
      }
    })
  }


/* *
 * Use new listings to update older ones
 * @param {Object []} listings - array of saved job listings
 * */
  async processReturnedListings(listings) {

//allow this function to mutate _model.jobListings
    const jobListings = await this._model.jobListings();
    const count = this.findNewListings(listings, jobListings);
    const newListingsCount = await this._model.newListingsCount();

    const newCount = newListingsCount + count;
    this._model.saveNewListingsCount(newCount);

//save when all tabs are finished
    if (await this._model.openTabCounter() === 0) {

//sort listings by date...allow mutate _model.jobListings
      const sortedListings = this.sortListings(jobListings);
      this._model.saveListings(sortedListings);

      this.messageToPopup(sortedListings, newCount);
    }
  }

}
