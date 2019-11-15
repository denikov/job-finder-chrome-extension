'use strict'

export default class Services {

  constructor(config, model, store) {
    this._config = config;
    this._model = model;
    this._store = store;
  }

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


  runJobSearch() {
//show loading badge to user
    chrome.browserAction.getBadgeText({}, result => {
      this._store.initialBAtext = result;
      chrome.browserAction.setBadgeText({
        text: '...'
      })
    })

    let urlsToOpen = [...this._config.jobUrls];
    let omitted_sites = [...this._store.userPrefs.omitted_sites];

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
            this._store.workingWindowId = win.id;
            this._store.openTabCounter = urlsToOpen.length;
          }

        })
      })
    })
  }


//messages coming in from opened tabs
  handleMessages() {

    const msg = this._store.getQueue();
    if (msg.type === 'close') {
      const openTabCounter = this._store.minusTabCounter;

      if (openTabCounter > 0) {
        chrome.tabs.remove(msg.tabId);

      }else {
//remove window if only one tab left
        chrome.windows.remove(this._store.workingWindowId);
        this._store.workingWindowId = null;

      }

      if (msg.data) {
        processReturnedListings(msg.data);
      }

//continue handlings messages only after returned listings were processed to avoid conflict
      if (this._store.openTabsQueue.length > 0) {
        this.handleMessages();
      }

    }else if (msg.type === 'userPrefs') {
//content script is requesting user search parameters
      
      chrome.tabs.sendMessage(msg.tabId, {
        type: 'userPrefs',
        prefs: this._store.userPrefs
      });
    }
  }


//use new listings to update older ones
  processReturnedListings(listings) {

//allow this function to mutate _model.jobListings
    const count = this.findNewListings(listings, this._store.jobListings);
    const newCount = this._store.newListingsCount + count;
    this._store.newListingsCount = newCount;

//save when all tabs are finished
    if (this._store.openTabCounter === 0) {
//sort listings by date...allow mutate _model.jobListings
      const sortedListings = this.sortListings(this._store.jobListings);
      this._model.saveListings(sortedListings);

//send a message to popup in case it's open to finish updating listings
      chrome.runtime.sendMessage({
        listings: sortedListings
      }, response => {
        if (chrome.runtime.lastError) {
//error if popup is not open; alert user of new listings using the badge. Listings get updated if popup is open
          
//get current browserAction badge text
//update browserAction badge with new listings count
          chrome.browserAction.getBadgeText({}, result => {

//badge text could be ... while searching
            if (this._store.initialBAtext && /\w+/gi.test(this._store.initialBAtext)) {
              result = this._store.initialBAtext;
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
            this._store.newListingsCount = 0;
          })

        }else {
          chrome.browserAction.setBadgeText({
            text: ''
          })
        }
      })
    }
  }

}
