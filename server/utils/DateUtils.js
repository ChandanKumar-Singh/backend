import moment from "moment";
import Constants from "../config/constants.js";
const TIME_ZONE_OFFSET = parseFloat(Constants.TIME_ZONE || 5.5); // Default: IST (UTC+5:30)

class DateUtils {
  /**
   *  https://www.mongodb.com/docs/manual/reference/operator/aggregation/dateToString/
   */
  aggregate = (
    field,
    {
      timezone = Constants.TIME_ZONE_NAME,
      format = Constants.DATE_TIME_FORMAT,
      onNull = "Invalid date",
    } = {}
  ) => {
    return {
      $dateToString: {
        format: format,
        date: field,
        timezone: timezone,
        onNull: onNull,
      },
    };
  };


  /**
   * Format date-time to a specific format.
   */
  formatTime(date, format = "YYYY-MM-DD HH:mm:ss") {
    return moment(date).format(format);
  }

  formattedTimeZone = (date, time, tz) => {
    let timeZone = tz;
    let sign = "+";
    if (timeZone < 0) {
      sign = "-";
      timeZone = timeZone * -1;
    }
    const totalMinutes = timeZone * 60;
    let hours = Math.floor(totalMinutes / 60) + "";
    let minutes = (totalMinutes % 60) + "";

    if (hours.length < 2) {
      hours = "0" + hours;
    }

    if (minutes.length < 2) {
      minutes = "0" + minutes;
    }

    return `${date}T${time}${sign}${hours}${minutes}`;
  };

  /**
   * Convert UTC to Local Time.
   */
  convertUtcToLocal(date, timeZone = TIME_ZONE_OFFSET) {
    return moment.utc(date).utcOffset(timeZone * 60).format("YYYY-MM-DD HH:mm:ss");
  }

  /**
   * Convert Local Time to UTC.
   */
  convertLocalToUtc(date, timeZone = TIME_ZONE_OFFSET) {
    return moment(date).utcOffset(0).subtract(timeZone, "hours").format("YYYY-MM-DD HH:mm:ss");
  }

  /**
   * Get the start and end date of a week from a given date.
   */
  getWeeklyDates(date = null, timeZone = TIME_ZONE_OFFSET) {
    let currentDate = date ? moment(date) : moment();
    currentDate.utcOffset(timeZone * 60);
    let startOfWeek = currentDate.startOf("week").format("YYYY-MM-DD");
    let endOfWeek = currentDate.endOf("week").format("YYYY-MM-DD");
    return { startOfWeek, endOfWeek };
  }

  /**
   * Get an array of dates for a week.
   */
  getWeeklyDatesArray(date = null, timeZone = TIME_ZONE_OFFSET) {
    let currentDate = date ? moment(date) : moment();
    currentDate.utcOffset(timeZone * 60);
    let weekDates = [];
    for (let i = 0; i < 7; i++) {
      weekDates.push(currentDate.startOf("week").add(i, "days").format("YYYY-MM-DD"));
    }
    return weekDates;
  }

  /**
   * Get time difference in minutes between two dates.
   */
  dateDiffInMinutes(date1, date2) {
    return Math.abs(moment(date2).diff(moment(date1), "minutes"));
  }

  /**
   * Get financial year from a given date.
   */
  getFinancialYear(date, timeZone = TIME_ZONE_OFFSET) {
    let newDate = moment(date).utcOffset(timeZone * 60);
    let year = newDate.year();
    return newDate.month() < 3 ? `${year - 1}-${year}` : `${year}-${year + 1}`;
  }

  /**
   * Convert minutes to a human-readable format (e.g., "1 hr 30 min").
   */
  timeFromMinutes(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return hours > 0 ? `${hours} hr ${mins > 0 ? `${mins} min` : ""}` : `${mins} min`;
  }

  /**
   * Get start and end times of a given date in the local timezone.
   */
  getStartEndTimeInLocal(date, timeZone = TIME_ZONE_OFFSET) {
    return {
      start_date: moment(date).utcOffset(timeZone * 60).startOf("day").toDate(),
      end_date: moment(date).utcOffset(timeZone * 60).endOf("day").toDate(),
    };
  }

  /**
   * Calculate the difference between two dates in years.
   */
  yearsDifference(date1, date2) {
    return Math.abs(moment(date2).diff(moment(date1), "years"));
  }

  /**
   * Determine if a date is less than another date.
   */
  isDateLess(date1, date2) {
    return moment(date1).isBefore(moment(date2));
  }
}

export default new DateUtils();
