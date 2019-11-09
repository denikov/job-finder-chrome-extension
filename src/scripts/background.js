'use strict'

import { Config } from '../config.js';
import { Model } from './model.js';
import Helper from './helper.js';

//declare globally...these will get defined when extension has installed/started
let config;
let model;
let helper;
let newListingsCount = 0;


//use new listings to update older ones
function processReturnedListings(listings) {

//allow this function to mutate model.jobListings
  const count = helper.findNewListings(listings, model.jobListings);
  newListingsCount += count;

//save when all tabs are finished
  if (model.openTabCounter === 0) {
//sort listings by date...allow mutate model.jobListings
    const sortedListings = helper.sortListings(model.jobListings);
    model.saveListings();

//send a message to popup in case it's open to finish updating listings
    chrome.runtime.sendMessage({
      listings: model.jobListings
    }, response => {
      if (chrome.runtime.lastError) {
//error if popup is not open; alert user of new listings using the badge. Listings get updated if popup is open
        
//get current browserAction badge text
//update browserAction badge with new listings count
        chrome.browserAction.getBadgeText({}, result => {

//badge text could be ... while searching
          console.log(model.initialBAtext)
          if (model.initialBAtext && /\w+/gi.test(model.initialBAtext)) {
            result = model.initialBAtext;
          }else {
//badge could be empty...set to 0
            result = '0';
          }
          if (result.indexOf('+') > -1) {
            return;
          }

          const badgeText = parseInt(result) + newListingsCount;
          if (badgeText === 0) {
            chrome.browserAction.setBadgeText({
              text: ''
            })
            return;
          }

          chrome.browserAction.setBadgeText({
            text: badgeText > 99 ? '99+' : badgeText.toString()
          })
          newListingsCount = 0;
        })

      }else {
        chrome.browserAction.setBadgeText({
          text: ''
        })
      }
    })
  }
}


//messages coming in from opened tabs
function handleMessages() {

  const msg = model.getQueue();
  if (msg.type === 'close') {
    const openTabCounter = model.minusTabCounter();

    if (openTabCounter > 0) {
      chrome.tabs.remove(msg.tabId);

    }else {
//remove window if only one tab left
      chrome.windows.remove(model.workingWindowId);
      model.workingWindowId = null;

    }

    if (msg.data) {
      processReturnedListings(msg.data);
    }

//continue handlings messages only after returned listings were processed to avoid conflict
    if (model.openTabsQueue.length > 0) {
      handleMessages();
    }

  }else if (msg.type === 'userPrefs') {
//content script is requesting user search parameters
    
    chrome.tabs.sendMessage(msg.tabId, {
      type: 'userPrefs',
      prefs: model.userPrefs
    });
  }
}


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  if (!model.workingWindowId || model.workingWindowId != tab.windowId) {
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
            model.addToTabsQueue(msg);

//if more than one message queued up, handleMessages function is already running and will handle the incoming message after completing current run
            if (model.openTabsQueue.length === 1) {
              handleMessages();
            }

          })
        }
      }
  })
})


function runJobSearch() {

//show loading badge to user
  chrome.browserAction.getBadgeText({}, result => {
    model.initialBAtext = result;
    chrome.browserAction.setBadgeText({
      text: '...'
    })
  })

  let urlsToOpen = [...config.jobUrls];
  let omitted_sites = [...model.userPrefs.omitted_sites];

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
          model.workingWindowId = win.id;
          model.openTabCounter = urlsToOpen.length;
        }

      })
    })
  })
}


//listen for messages coming from popup page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if (request.task === 'searchJobs') {
//user initiated search
    
    model.getPrefs(userPrefs => {
//check if user does not want to aggregate results and search parameters are different
      if (!userPrefs.aggregate_results && (userPrefs.keywords != request.prefs[0] || userPrefs.location != request.prefs[1])) {
        model.removeListings();
      }

//push back alarm if user triggers a manual search
      model.setAlarm();
      runJobSearch();
    })

  }else if (request.task === 'searching') {
//popup is asking if searching in progress
    sendResponse({
      searching: model.openTabCounter > 0
    })

  }
})


chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === 'search_interval') {

    model.getPrefs(userPrefs => {
//check if user input any search parameters
      if (!userPrefs.keywords || !model.userPrefs.location) {
        return;
      }

      if (model.openTabCounter === 0) {
//make sure user has not initiated search
        runJobSearch();
      }
    })
  }

})


function init() {

//config contains global values
  config = new Config();

//model deals with global data
  model = new Model();
  model.setAlarm();

//helper contain all working functions
  helper = new Helper();

}

//called when chrome first starts up
chrome.runtime.onStartup.addListener(() => {
  init();
})

//called when refreshed/installed plugin
chrome.runtime.onInstalled.addListener(details => {
  init();
})
