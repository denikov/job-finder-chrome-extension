'use strict'

import { Store } from './store.js';

export class Model {

  constructor(config, store) {

    this._config = config;
    this._store = store;

    this.getListings();
    this.getPrefs();

  }

/* *,
 * EVERYTHING TO DO WITH PREFERENCES
* */
//initialize user preferences
  getPrefs() {
    chrome.storage.local.get('preferences', prefs => {

      if (prefs && prefs.hasOwnProperty('preferences')) {
        this._store.userPrefs = prefs.preferences;

      }else {
//save initial preferences which will be used in popup
        chrome.storage.local.set({
          preferences: this._store.userPrefs
        })
      }

    })
  }

  savePreferences() {
    chrome.storage.local.set({
      preferences: this._store.userPrefs
    })
  }
/* *
 * EVERYTHING TO DO WITH PREFERENCES
* */


/* *
 * EVERYTHING TO DO WITH JOB LISTINGS
* */
//initialize job listings
  getListings() {
    chrome.storage.local.get('job_listings', listings => {
      if (listings && listings.hasOwnProperty('job_listings')) {
        this._store.jobListings = listings.job_listings;
      }
    })
  }

  saveListings(listings) {
    chrome.storage.local.set({
      job_listings: listings
    })
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
      periodInMinutes: parseInt(this._store.userPrefs.frequency) * 60
    });
  }

}
