import moment from 'moment'
import Constants from '../config/constants.js';

const TIME_ZONE_OFFSET = parseFloat(Constants.TIME_ZONE|| 5.5); // Default: IST (UTC+5:30)

/**
 * Calculate the difference between two dates in days.
 */
const timeDifferenceInDays = (date1, date2) => {
    return Math.abs(moment(date2).diff(moment(date1), "days"));
};

/**
 * Calculate the difference between two dates in hours.
 */
const timeDifferenceInHours = (date1, date2) => {
    return Math.abs(moment(date2).diff(moment(date1), "hours"));
};

/**
 * Calculate the difference between two dates in minutes.
 */
const timeDifferenceInMinutes = (date1, date2) => {
    return Math.abs(moment(date2).diff(moment(date1), "minutes"));
};

/**
 * Convert a given UTC date-time to IST (or a custom time zone).
 */
const convertUtcToLocal = (date, timeZone = TIME_ZONE_OFFSET) => {
    return moment.utc(date).utcOffset(timeZone * 60).format("YYYY-MM-DD HH:mm:ss");
};

/**
 * Convert IST (or local time) to UTC.
 */
const convertLocalToUtc = (date, timeZone = TIME_ZONE_OFFSET) => {
    return moment(date).utcOffset(0).subtract(timeZone, "hours").format("YYYY-MM-DD HH:mm:ss");
};

/**
 * Get the current local time formatted.
 */
const getCurrentLocalTime = (format = "DD-MM-YYYY, HH:mm") => {
    return moment().utcOffset(TIME_ZONE_OFFSET * 60).format(format);
};

/**
 * Convert minutes into hours and minutes (HH:mm).
 */
const convertMinutesToHours = (totalMinutes) => {
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
    const minutes = String(totalMinutes % 60).padStart(2, "0");
    return `${hours}:${minutes}`;
};

module.exports = {
    timeDifferenceInDays,
    timeDifferenceInHours,
    timeDifferenceInMinutes,
    convertUtcToLocal,
    convertLocalToUtc,
    getCurrentLocalTime,
    convertMinutesToHours,
};
