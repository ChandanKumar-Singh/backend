/* eslint-disable valid-jsdoc */
import Constants from '../config/constants.js';
import moment from "moment";
import { parse } from "dotenv";

/**
 *
 * @param date1
 * @param date2
 * @returns {Number}
 */


//  const timeZoneOffset = -4.5;
const timeZoneOffset = 5.5;
export const timeDifferenceInDays = function (date1, date2) {
    const t1 = new Date(date1);
    const t2 = new Date(date2);
    return parseInt((t2 - t1) / 86400000);
};

/**
 *
 * @param date1
 * @param date2
 * @returns {Number}
 */

export const timeDifferenceInHours = function (date1, date2) {
    const t1 = new Date(date1);
    const t2 = new Date(date2);
    return parseInt((t2 - t1) / 3600000);
};


/**
 *
 * @param date1
 * @param date2
 * @returns {Number}
 */

export const timeDifferenceInMinutes = function (date1, date2) {
    const t1 = new Date(date1);
    const t2 = new Date(date2);
    return parseInt((t2 - t1) / 60000);
};

export const timeDifferenceInMinutesForTime = function (time1, time2) {
    const t1 = new Date('2038-01-19 ' + time1 + ':00');
    const t2 = new Date('2038-01-19 ' + time2 + ':00');
    return parseInt((t2 - t1) / 60000);
};

/**
 *
 * @param date1
 * @param date2
 * @returns {Number}
 */
export const timeDifferenceInSeconds = function (date1, date2) {
    const t1 = new Date(date1);
    const t2 = new Date(date2);
    return parseInt((t2 - t1) / 1000);
};

export const timeDifferenceInSecondsByMilli = function (t1, t2) {
    return parseInt((t1 - t2) / 1000);
};

/**
 *
 * @param date
 * @returns {string}
 */
export const changeTimezoneFromIstToUtc = function (date) {
    const temp = new Date(date);
    return new Date(temp.getTime() - (3600000 * timeZoneOffset)).toISOString();
};

/**
 *
 * @param date
 * @returns {string}
 */
export const changeTimezoneFromUtcToIst = function (date) {
    const temp = new Date(date);
    return new Date(temp.getTime() + (3600000 * timeZoneOffset)).toISOString();
};

export const changeTimezoneFromUtcToLocal = function (date) {
    const temp = new Date(date);
    return new Date(temp.getTime() + (3600000 * Constants.TIME_ZONE)).toISOString();
};
export const changeTimezoneFromUtc = function (date, timeZone = Constants.TIME_ZONE, format = null) {
    const temp = new Date(date);
    const newDate = new Date(temp.getTime() + (3600000 * timeZone));
    if (format) {
        let tempMoment = moment(newDate);
        tempMoment.utcOffset(0);
        return tempMoment.format(format)
    } return newDate;
};

export const formattedTimeZone = function (date, time, tz) {
    let timeZone = tz;
    let sign = '+';
    if (timeZone < 0) {
        sign = '-';
        timeZone = timeZone * -1;
    }
    const totalMinutes = timeZone * 60;
    let hours = Math.floor(totalMinutes / 60) + '';
    let minutes = totalMinutes % 60 + '';

    if (hours.length < 2) {
        hours = '0' + hours;
    }

    if (minutes.length < 2) {
        minutes = '0' + minutes;
    }

    return `${date}T${time}${sign}${hours}${minutes}`;
}

export const getCurrentLocalTime = function () {
    const timeZone = Constants.TIME_ZONE;
    const format = 'DD-MM-YYYY, HH:mm';
    const temp = new Date();
    const newDate = new Date(temp.getTime() + (3600000 * timeZone));
    if (format) {
        let tempMoment = moment(newDate);
        tempMoment.utcOffset(0);
        return tempMoment.format(format)
    } return newDate;
}
export const changeTimezoneFromLocalToUtc = function (date, timeZone = Constants.TIME_ZONE, format = null) {
    const temp = new Date(date);
    const newDate = new Date(temp.getTime() - (3600000 * timeZone)).toISOString();
    if (format) {
        let tempMoment = moment(newDate);
        tempMoment.utcOffset(0);
        return tempMoment.format(format)
    } return newDate;
};

export const changeTimezoneFromUtcToLocalOnlyDate = function (date) {
    const temp = new Date(date);
    return new Date(temp.getTime() + (3600000 * Constants.TIME_ZONE));
};

export const getStartEndTimeInLocal = function (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return {
        start_date: new Date(startDate.getTime() + (3600000 * Constants.TIME_ZONE)),
        end_date: new Date(endDate.getTime() + (3600000 * Constants.TIME_ZONE)),
    };
};

/**
 *
 * @param jsDate
 * @returns {string}
 */
export const getMysqlStyleDateString = function (jsDate) {
    let year = jsDate.getFullYear().toString();
    let month = (jsDate.getMonth() + 1).toString();
    month = month.length == 1 ? '0' + month : month;
    let date = jsDate.getDate().toString();
    date = date.length == 1 ? '0' + date : date;
    return year + '-' + month + '-' + date;
};

/**
 *
 * @param time
 * @param flag
 * @returns {number}
 */
export const getTimeDifferenceInMinutes = function (time, flag) {
    const today = new Date();

    let diffMs = null;
    if (flag === 1) {
        diffMs = (time - today); // milliseconds between post date & now
    } else {
        diffMs = (today - time); // milliseconds between now & post date
    }

    const minutes = Math.floor(0.000016667 * diffMs);

    return minutes;
};


export const getDateObject = function (sDate = null) {
    var curr = new Date();
    if (sDate) {
        curr = new Date(sDate);
    }
    const month = changeTimezoneFromUtc(curr, Constants.TIME_ZONE, 'MM');
    const date = changeTimezoneFromUtc(curr, Constants.TIME_ZONE, 'DD');
    const year = changeTimezoneFromUtc(curr, Constants.TIME_ZONE, 'YYYY');
    return { date, month, year };
};

export const convertTimeToMinute = function (time) {
    const timeArr = time.split(':');
    let mins = parseInt(timeArr[0] * 60);
    mins += parseInt(timeArr[1]);
    return mins;
}


export const convertMinutesToHours = function (min) {
    let hours = (min / 60);
    let rhours = Math.floor(hours).toString();
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes).toString();

    rhours = rhours.length < 2 ? '0' + rhours : rhours;
    rminutes = rminutes.length < 2 ? '0' + rminutes : rminutes;
    return { hours: rhours, minutes: rminutes };
};
