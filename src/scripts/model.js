'use strict'

import { Config } from '../config.js';

export class Model {

  constructor() {

    const config = new Config();

//queue needed to eliminate a race condition if multiple tabs send "close" message at the same time
    this.openTabsQueue = [];
//keep count of still opened tabs
    this.openTabCounter = 0;

/*
//initialize user preferences
//keywords and location are search parameters
//frequency is how often in minutes to perform search
//omitted_sites removes sites which user unchecked
//listing_limit defaults to 50 listings per website
*/
    this.userPrefs = {
      keywords: null,
      location: null,
      aggregate_results: false,
      frequency: config.defaultFrequency,
      omitted_sites: [],
      listing_limit: config.listingLimit
    };
    this.getPrefs();

//for each search keep count and update the browserAction badge
    this.newListingsCount = 0;

//listings
    this.jobListings = [];
    this.getListings();

//used to temporarily store badge text when showing ... while searching
    this.initialBAtext;

//saving ID of the background window where searching is performed
//used to prevent content scripts from taking over user's current window if user navigates to a jobUrl
    this.workingWindowId;

  }


/* *,
 * EVERYTHING TO DO WITH PREFERENCES
* */
//initialize user preferences
  getPrefs(callback) {
    chrome.storage.local.get('preferences', prefs => {

      if (prefs && prefs.hasOwnProperty('preferences')) {
        this.userPrefs = prefs.preferences;

      }else {
//save initial preferences which will be used in popup
        chrome.storage.local.set({
          preferences: this.userPrefs
        })
      }

      if (callback && typeof callback == 'function') {
        callback(this.userPrefs);
      }
    })
  }


  updateSinglePreference(pref, value) {
    this.userPrefs[pref] = value;
    this.savePreferences();
  }


  savePreferences() {
    chrome.storage.local.set({
      preferences: this.userPrefs
    })
  }
/* *
 * EVERYTHING TO DO WITH PREFERENCES
* */


/* *
 * EVERYTHING TO DO WITH JOB LISTINGS
* */
//initialize job listings
  getListings(callback) {
    chrome.storage.local.get('job_listings', listings => {
      if (listings && listings.hasOwnProperty('job_listings')) {
        this.jobListings = listings.job_listings;
      }

      if (callback && typeof callback == 'function') {
        callback(this.jobListings);
      }
    })
  }


  saveListings() {
    chrome.storage.local.set({
      job_listings: this.jobListings
    })
  }


  getFirstListing() {
    return this.jobListings[0];
  }


  removeListings() {
    chrome.storage.local.remove('job_listings');
  }
/* *
 * EVERYTHING TO DO WITH JOB LISTINGS
* */


//set alarm interval
  setAlarm() {
    chrome.alarms.create('search_interval', {
      periodInMinutes: parseInt(this.userPrefs.frequency) * 60
    });
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

//save changes
    chrome.storage.local.set({
      job_listings: this.jobListings
    })
  }


  addToTabsQueue(msg) {
    this.openTabsQueue.push(msg);
  }


  getQueue() {
    return this.openTabsQueue.shift();
  }


  minusTabCounter() {
    return --this.openTabCounter;
  }

}
