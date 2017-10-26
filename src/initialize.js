import 'styles/index';
import 'babel-polyfill';
import 'modernizr';
import querystring from 'querystring';

import store from 'src/store.js';
import campaignOptions from 'src/campaigns.js';

import Header from 'components/Header';
import Footer from 'components/Footer';
import EventMap from 'components/EventMap';
import EventList from 'components/EventList';

//Save the initial hash of the window when Vue initializes.
//We'll use these values to populate the initial store filter values
const initialHash = querystring.parse(
  window.location.hash.replace(/^#/, '') ||
    window.location.search.replace(/^\?/, ''))

let options = campaignOptions();

// Load events data
store.dispatch('loadEvents')
const ONE_MINUTE = 60000;

// And then keep grabbing events data once per minute
// the rate at which the data feed is regenerated.
setInterval(() => {store.dispatch('loadEvents')}, ONE_MINUTE);

// Load valid zipcodes
store.dispatch('loadZips')

// Load valid US states
store.dispatch('loadUSStates')

// Set initial event filters based on campaign
if (Object.keys(options.filters).length) {
  store.state.initialFilters = options.filters
} else {
  store.state.initialFilters = initialHash
}

// Initialize Vue instances with the store.
Header(store, options);
EventMap(store, options);
EventList(store, options);
Footer(options);

// Allow HMR updates
if (module.hot) {
  module.hot.accept();
}
