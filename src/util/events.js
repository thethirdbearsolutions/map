import moment from 'moment';

const metersToMiles = (meters) => meters * 0.00062137;

export function getFilteredEvents(events, filters, zipcodes) {
  // Bail out early if possible. Huge array!
  if (!filters.eventType && !filters.startDate && !filters.endDate && !filters.zipcode) {
    return events;
  }

  const zipcodesLength = (Object.keys(zipcodes) || []).length;
  const validZipcode = zipcodesLength && !!zipcodes[filters.zipcode];

  // We do not yet have zipcodes to filter against, or the selected
  // zipcode is not valid...so there can be no valid events. Bail early.
  if (filters.zipcode && (!zipcodes || !zipcodesLength || !validZipcode)) {
    return [];
  }

  return events.filter(function(event) {

    if (filters.eventType) {
      if (!event.categories) {
        return false;
      }

      const allCategories = event.categories.split(',');
      const allEventTypes = filters.eventType.split(',');

      const eventIsInNoSelectedCategories = allEventTypes.every(type =>
        !allCategories.includes(type)
      );

      if (eventIsInNoSelectedCategories) {
        return false;
      }
    }

    // note: there is also a utc timestamp, this one is localized
    const localDatetime = moment(event.start_datetime);

    if (filters.startDate) {
      const startDate = moment(filters.startDate, 'YYYY-MM-DD');

      if (localDatetime.isBefore(startDate, 'day')) {
        return false;
      }
    }

    if (filters.endDate) {
      const endDate = moment(filters.endDate, 'YYYY-MM-DD');

      if (localDatetime.isAfter(endDate, 'day')) {
        return false;
      }
    }

    if (filters.zipcode) {
      const zipcodeLatLng = L.latLng(zipcodes[filters.zipcode]);

      const milesFromZipcode = metersToMiles(
         zipcodeLatLng.distanceTo([event.lat, event.lng])
      );

      const MAX_MILES_FROM_ZIPCODE = 50;

      if (milesFromZipcode > MAX_MILES_FROM_ZIPCODE) {
        return false;
      }
    }

    return true;
  });
}

export const eventTypes = {
  freedomcities: "Freedom Cities Action",
  muslimban: "Muslim Ban Action",
  protestrally: "Protest/Rally",
  townmeeting: "Town Meeting",
  organizing: "Organizing Meeting",
  healthcareaction: "Health Care Action",
  other: "Other"
};
