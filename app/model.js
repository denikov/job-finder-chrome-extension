'use strict'

/* *
 *  CHECKING FOR window.chrome IS REQUIRED FOR TESTING PURPOSES
 *  BROWSER ENVIRONMENTS DO NOT HAVE Chrome API
 * */

export class Model {

  constructor(defaults) {
    this._defaults = defaults;
  }


/* *
 * EVERYTHING TO DO WITH PREFERENCES
 * */
  getPrefs() {
    return new Promise(resolve => {
      if (!window.chrome) {
        resolve(this._defaults.userPrefs());
      }
      chrome.storage.local.get('preferences', prefs => {
        prefs = prefs.preferences || this._defaults.userPrefs();
        resolve(prefs);
      })
    })
  }


/* *
 * @param {Object} prefs - user preferences
 * */
  savePreferences(prefs) {
    if (window.chrome) {
      chrome.storage.local.set({
        preferences: prefs
      })
    }
  }


/* *
 * EVERYTHING TO DO WITH JOB LISTINGS
* */

/* *
 * @returns {Object []} - array of job listings
 * */
  jobListings() {
    return new Promise(resolve => {
      if (!window.chrome) {
        resolve([]);
      }
      chrome.storage.local.get('job_listings', listings => {
        resolve(listings.job_listings || []);
      })
    })
  }


/* *
 * @param {Object []} listings - array of job listings
 * */
  saveListings(listings) {
    if (window.chrome) {
      chrome.storage.local.set({
        job_listings: listings
      })
    }
  }


/* *
 * When the user performs a search with new parameters AND user preferences indicate not to aggregate results, previous listings are deleted
 * */
  removeListings() {
    if (window.chrome) {
      chrome.storage.local.remove('job_listings');
    }
  }


/* *
 * Set alarm interval
 * */
  async setAlarm() {
    const userPrefs = await this.getPrefs();

//do not set an alarm if user has not performed a search
    if (!userPrefs.keywords || !userPrefs.location) {
      return;
    }

    const frequency = userPrefs.frequency || this._defaults.defaultFrequency();
    if (window.chrome) {
      chrome.alarms.create('search_interval', {
        periodInMinutes: parseInt(frequency) * 60
      });
    }
  }


/* *
 * @returns {number} - amount of new listings found
 * */
  newListingsCount() {
    return new Promise(resolve => {
      if (!window.chrome) {
        resolve(0);
      }
      chrome.storage.local.get('new_listings_count', count => {
        resolve(count.new_listings_count || 0);
      });
    });
  }


/* *
 * @param {number} value - amount of new listings found
 * */
  saveNewListingsCount(value) {
    if (window.chrome) {
      chrome.storage.local.set({
        new_listings_count: value || 0
      });
    }
  }


/* *
 * Get saved badge action text
 * @returns {string}
 * */
  initialBAtext() {
    return new Promise(resolve => {
      if (!window.chrome) {
        resolve('');
      }
      chrome.storage.local.get('initial_BA_test', text => {
        resolve(text.initial_BA_test || '');
      });
    });
  }


/* *
 * @param {string} value - text that was set on the Badge Action button before a job search was started
 * */
  saveInitialBAtext(value) {
    if (window.chrome) {
      chrome.storage.local.set({
        initial_BA_test: value
      });
    }
  }


/* *
 * @returns {Object []} - array of messages from open tabs
 * */
  openTabsQueue() {
    return new Promise(resolve => {
      if (!window.chrome) {
        resolve([]);
      }
      chrome.storage.local.get('open_tabs_queue', tabs => {
        resolve(tabs.open_tabs_queue || []);
      });
    });
  }


/* *
 * @returns {Object []} - first message from open tabs
 * */
  openTabsQueueFirst() {
    return new Promise(resolve => {
      if (!window.chrome) {
        resolve();
      }
      chrome.storage.local.get('open_tabs_queue', tabs => {
        if (tabs && tabs.open_tabs_queue) {
          const firstQueue = tabs.open_tabs_queue.shift();

          //queue modified...save
          this.saveOpenTabsQueue(tabs.open_tabs_queue);

          resolve(firstQueue);
        }else {
          resolve([]);
        }
      });
    });
  }


/* *
 * Adds and returns messages from tabs
 * @returns {Object []} - array of messages from open tabs
 * */
  async addToTabsQueue(msg) {
    const openTabsQueue = await this.openTabsQueue();
    return new Promise(resolve => {
      if (!window.chrome) {
        resolve();
      }
      openTabsQueue.push(msg);
      this.saveOpenTabsQueue(openTabsQueue);
      resolve(openTabsQueue);
    });
  }


/* *
 * Saves messages from the tabs
 * @param {Object []} queue - array of messages
 * */
  saveOpenTabsQueue(queue) {
    if (window.chrome) {
      chrome.storage.local.set({
        open_tabs_queue: queue
      });
    }
  }


/* *
 * @returns {number|null} - saved window ID of the window where the job search is being performed
 * */
  workingWindowId() {
    return new Promise(resolve => {
      if (!window.chrome) {
        resolve(null);
      }
      chrome.storage.local.get('working_window_id', winId => {
        resolve(winId.working_window_id || null);
      });
    });
  }


/* *
 * @param {number} winId
 * */
  saveWorkingWindowId(winId) {
    if (window.chrome) {
      chrome.storage.local.set({
        working_window_id: winId
      });
    }
  }


/* *
 * A tab was has finished searching and closed
 * @returns {number} minusCounter - amount of open tabs performing job search
 * */
  minusTabCounter() {
    return new Promise(resolve => {
      if (!window.chrome) {
        resolve(0);
      }
      chrome.storage.local.get('tab_counter', count => {
        const minusCounter = --count.tab_counter;

        //counter modified...save
        this.saveOpenTabCounter(minusCounter);

        resolve(minusCounter);
      });
    });
  }


/* *
 * @return {number} - amount of currently opened tabs performing job search
 * */
  openTabCounter() {
    return new Promise(resolve => {
      if (!window.chrome) {
        resolve(0);
      }
      chrome.storage.local.get('open_tab_counter', count => {
        resolve(count.open_tab_counter || 0);
      });
    });
  }


/* *
 * @param {number} count - amount of currently opened tabs performing job search
 * */
  saveOpenTabCounter(count) {
    if (window.chrome) {
      chrome.storage.local.set({
        tab_counter: count
      });
    }
  }

}
