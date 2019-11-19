# job-finder-chrome-extension
Chrome browser extension to help automate searching and staying up to date with job listings

## Description
This extension was created to automate the job searching process.  It opens a window in the background, inserts a content script into the pages and returns the most recent listings, notifying you the amount of newly found listings.  It's not perfect, there are caveats listed below.

## Install
`git clone https://github.com/denikov/job-finder-chrome-extension.git`

## Tests - BDD methodology
`npm test` - Run all tests

`node_modules/.bin/babel-node node_modules/.bin/jasmine --config=test/jasmine.json {individual spec file}` - Run individual test file
Tools used:
- Gulp - needed to transpile `.js` files in order to test with JSDOM
- - Babel 7
- - Babelify
- - Browserify
- Jasmine - testing framework
- JSDOM - browser emulator for NodeJS

## Usage
Open a tab inside Google Chrome, navigate to `chrome://extensions`, turn on `Developer mode`, click on `Load unpacked` and find the `app/` directory which contains the `manifest.json` file.  Click `Select` and the extension will pop up in the list.

In order for the extension to work in the background, you need to run an inital search.  Inside the settings, you can specify how often the search should be performed, which sites to use, how many results to return from each site, and whether to combine results (eg: combine most recent search results for `chef` in `miami florida` and new search results for `construction` in `los angeles california`???)

#### Caveats
- When signed into LinkedIn, they check if the click event `isTrusted`.  Currently only returns listings if user is not signed in.
- - Programmatically searching may be possible with [Chrome's debugger API](https://developer.chrome.com/extensions/debugger).
- - Or dynamically creating the necessary URL parameters.
- Tested on macOs Chrome V78. When user clicks the search button, the window flashes and gets minimized.  This is the only way to keep the popup window opened.  Problem is when the extension closes the last window, there is an `Untitiled` window still left in the tray.  Only way to remove it is by clicking on it.  Bad UX...
- - One solutions is to bring the initial window into focus after the working window is opened but the popup will be closed.  Also bad UX...

### ToDo
- Add a `remove` option for users to delete listing of not interest; keep track of deleted listings
- Add an option for users to mark listings which already applied for

It's possible to add any number of websites to get job listings.  Will add more in the future.  Looking forward to any contributions if someone finds this project useful!
