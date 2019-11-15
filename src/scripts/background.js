'use strict'

import { Config } from '../config.js';
import { Model } from './model.js';
import Services from './services.js';
import { Store } from './store.js';

let background;


class Background {

  constructor(config, model, services, store) {
    this._config = config;
    this._model = model;
    this._services = services;
    this._store = store;
  }

  alarmCalled(alarm) {
    if (alarm.name === 'search_interval') {

      this._model.getPrefs(userPrefs => {
  //check if user input any search parameters
        if (!userPrefs.keywords || !_model.userPrefs.location) {
          return;
        }

        if (this._store.openTabCounter === 0) {
  //make sure user has not initiated search
          runJobSearch();
        }
      })
    }
  }

  get openTabCounter() {
    return this._store.openTabCounter;
  }

  getPrefs() {
    return this._store.userPrefs;
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

  workingWindowId() {
    return this._store.workingWindowId;
  }

  addToTabsQueue(msg) {
    this._store.addToTabsQueue(msg);
  }

  openTabsQueue() {
    return this._store.openTabsQueue();
  }

  handleMessages() {
    this._services.handleMessages();
  }

}



chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  const workingWindowId = background.workingWindowId;

  if (!workingWindowId || workingWindowId != tab.windowId) {
    return;
  }

//insert proper content script for tab
  chrome.tabs.executeScript(tab.id,
    {
      file: 'scripts/content_script.js',
      runAt: 'document_start'
    }, result => {

      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      }else {

        if (result[0] === 'injected') {

//content script inserted...connecting, passing message with tab ID and setting up listener for messages from content scripts
          const port = chrome.tabs.connect(tab.id);
          port.postMessage({tabId: tab.id});

          port.onMessage.addListener(msg => {

//add message to queue
            background.addToTabsQueue(msg);

//if more than one message queued up, handleMessages function is already running and will handle the incoming message after completing current run
            const openTabsQueue = background.openTabsQueue();
            if (openTabsQueue.length === 1) {
              background.handleMessages();
            }

          })
        }
      }
  })
})



//listen for messages coming from popup page
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
    })

  }
})

chrome.alarms.onAlarm.addListener(function(alarm) {
  background.alarmCalled(alarm);
})


function init() {
  const config = new Config();
  const store = new Store(config);
  const model = new Model(store, config);
  const services = new Services(config, model, store);
  background = new Background(config, model, services, store);
}


//called when chrome first starts up
chrome.runtime.onStartup.addListener(() => {
  init();
})

//called when refreshed/installed plugin
chrome.runtime.onInstalled.addListener(details => {
  init();
})
