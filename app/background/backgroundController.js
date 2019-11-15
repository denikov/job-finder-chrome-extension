'use strict'

import { Defaults } from './../defaults.js';
import { Model } from './../model.js';
import Services from './backgroundServices.js';

let background;


class Background {

  constructor(defaults, model, services) {
    this._defaults = defaults;
    this._model = model;
    this._services = services;
  }


  async alarmCalled(alarm) {
    if (alarm.name === 'search_interval') {

      const userPrefs = await this._model.getPrefs();
//check if user input any search parameters
      if (!userPrefs.keywords || !userPrefs.location) {
        return;
      }

      const openTabCounter = await this._model.openTabCounter();
      if (this._model.openTabCounter() === 0) {
//make sure user has not initiated search
        this.runJobSearch();
      }
    }
  }


  async openTabCounter() {
    return await this._model.openTabCounter();
  }


  async getPrefs() {
    return await this._model.getPrefs();
  }
  

  removeListings() {
    this._model.removeListings();
  }


  runJobSearch() {
    this._services.runJobSearch();
  }


  setAlarm() {
    this._model.setAlarm();
  }


  async workingWindowId() {
    return await this._model.workingWindowId();
  }


  async addToTabsQueue(msg) {
    return await this._model.addToTabsQueue(msg);
  }


  async openTabsQueue() {
    return await this._model.openTabsQueue();
  }


  handleMessages() {
    this._services.handleMessages();
  }

}



chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  background.workingWindowId().then(workingWindowId => {
    if (!workingWindowId || workingWindowId != tab.windowId) {
      return;
    }

//insert proper content script for tab
    chrome.tabs.executeScript(tab.id,
      {
        file: 'background/contentScript.js',
        runAt: 'document_start'
      }, result => {

        if (chrome.runtime.lastError) {
          console.warn(chrome.runtime.lastError.message);
        }else {

          if (result[0] === 'injected') {

//content script inserted...connecting, passing message with tab ID and setting up listener for messages from content scripts
            const port = chrome.tabs.connect(tab.id);
            port.postMessage({tabId: tab.id});

            port.onMessage.addListener(msg => {

//add message to queue
              background.addToTabsQueue(msg)
                .then((queues) => {

//if more than one message queued up, handleMessages function is already running and will handle the incoming message after completing current run
                  if (queues.length === 1) {
                    background.handleMessages();
                  }
                });
            });
          }
        }
    })
  });
});


/* *
 * Listen for messages coming from popup page
 * */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.task === 'searchJobs') {
//user initiated search
    
    const userPrefs = background.getPrefs();
//check if user does not want to aggregate results and search parameters are different
    if (!userPrefs.aggregate_results && (userPrefs.keywords != request.prefs[0] || userPrefs.location != request.prefs[1])) {
      background.removeListings();
    }

//push back alarm if user triggers a manual search
    background.setAlarm();
    background.runJobSearch();

  }else if (request.task === 'searching') {
//popup is asking if searching in progress
    sendResponse({
      searching: background.openTabCounter > 0
    });

  }
});


chrome.alarms.onAlarm.addListener(function(alarm) {
  background.alarmCalled(alarm);
});


function init() {
  const defaults = new Defaults();
  const model = new Model(defaults);
  const services = new Services(defaults, model);
  background = new Background(defaults, model, services);
  background.setAlarm();

}


/* *
 * On chrome://extension page, if you turn extension OFF and then ON, neither chrome onStartup nor onInstalled will fire; "background" will not be instantiated.
 * Following setTimeout checks if "background" exists
 * */
setTimeout(() => {
  if (!background) {
    init();
  }
}, 2000);


/* *
 * Called when chrome first starts up
 * */
chrome.runtime.onStartup.addListener(() => {
  init();
});


/* *
 * Called when refreshed/installed plugin
 * */
chrome.runtime.onInstalled.addListener(details => {
  init();
});
