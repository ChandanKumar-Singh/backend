/**
 * Created by charnjeetelectrovese@gmail.com on 7/14/2020.
 */
import moment from "moment";
import { changeTimezoneFromUtc, formattedTimeZone } from "./datetime.utils.js";
import Constants from "../config/constants.js";

class DateUtils {
  /**
   *  https://www.mongodb.com/docs/manual/reference/operator/aggregation/dateToString/
   */
  aggregate = (
    field,
    {
      format = Constants.DATE_TIME_FORMAT,
      timezone = Constants.TIME_ZONE_NAME,
      onNull = "Invalid date",
    } = {}
  ) => {
    return {
      $dateToString: {
        format: format, // The format to apply
        date: field, // The field to format
        timezone: timezone, // Desired timezone
        onNull: onNull, // Optional, if the field is missing
      },
    };
  };
  getPrevDatesArrFromDate = (date = null, count = 1, timezone = 0) => {
    let curr = this.changeTimezoneFromUtc(new Date(), timezone);
    if (date) {
      curr = this.changeTimezoneFromUtc(new Date(date), timezone);
    }
    const first = curr.getDate();
    const last = first + count;

    const firstday = new Date(new Date(curr).setDate(first));
    const lastday = new Date(new Date(curr).setDate(last));

    const dateArr = [];
    for (let i = 0; i < count; i++) {
      const temp = new Date(firstday);
      dateArr.push(
        moment(new Date(temp.setDate(temp.getDate() - i))).format("YYYY-MM-DD")
      );
    }
    return dateArr.reverse();
  };

  getWeeklyDates = function (date = null, timezone = Constants.TIME_ZONE) {
    let curr = this.changeTimezoneFromUtc(new Date(), timezone);
    if (date) {
      curr = this.changeTimezoneFromUtc(new Date(date), timezone);
    }
    const first = curr.getDate() - curr.getDay();
    const last = first + 6;

    const firstday = new Date(new Date(curr).setDate(first));
    const lastday = new Date(new Date(curr).setDate(last));

    const dateArr = [];
    for (let i = 0; i < 7; i++) {
      const temp = new Date(firstday);
      dateArr.push(
        moment(new Date(temp.setDate(temp.getDate() + i))).format("YYYY-MM-DD")
      );
    }
    return dateArr;
  };

  changeTimezoneFromUtc = function (
    date,
    timeZone = Constants.TIME_ZONE,
    format = null
  ) {
    const temp = new Date(date);
    const newDate = new Date(temp.getTime() + 3600000 * timeZone);
    if (format) {
      const tempMoment = moment(newDate);
      tempMoment.utcOffset(0);
      return tempMoment.format(format);
    }
    return newDate;
  };

  formatTimeFromUtc = (date, timeZone = Constants.TIME_ZONE) => {
    return date
      ? this.changeTimezoneFromUtc(
        date,
        Constants.TIME_ZONE,
        "DD/MM/YYYY HH:mm"
      )
      : "N/A";
  };

  formatTime = function (date, format = null) {
    const temp = new Date(date);
    if (format) {
      const tempMoment = moment(temp);
      tempMoment.utcOffset(0);
      return tempMoment.format(format);
    }
    return temp;
  };

  dateDiffInMinutes = (dt2, dt1) => {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
  };

  diffInHours = (dt1, dt2) => {
    const milliseconds = Math.abs(new Date(dt1) - new Date(dt2));
    return parseFloat((milliseconds / 36e5).toFixed(2));
  };

  addTime = (time) => {
    let updatedTime = moment(time).add(30, "minutes");
    return updatedTime;
  };

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

  getMinutesFromTime(time) {
    const arr = time.split(":");
    let mins = parseInt(arr[0] * 60);
    mins += parseInt(arr[1]);
    return mins;
  }

  getWeeklyDates = function (date = null) {
    let curr = changeTimezoneFromUtc(new Date(), Constants.TIME_ZONE);
    if (date) {
      curr = changeTimezoneFromUtc(new Date(date), Constants.TIME_ZONE);
    }
    const first = curr.getDate() - curr.getDay();
    const last = first + 6;

    const firstday = new Date(new Date(curr).setDate(first));
    const lastday = new Date(new Date(curr).setDate(last));

    const dateArr = [];
    for (let i = 0; i < 7; i++) {
      const temp = new Date(firstday);
      dateArr.push(
        moment(new Date(temp.setDate(temp.getDate() + i))).format("YYYY-MM-DD")
      );
    }
    return dateArr;
  };

  twoDatesDiff(start, end) {
    console.log("start", start, "end", end);
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate - startDate;

    const minutes = Math.floor(0.000016667 * diffMs);

    return minutes;
  }

  timeFromMinutes(duration) {
    if (duration >= 60) {
      const hours = duration / 60;
      const rhours = Math.floor(hours);
      const minutes = (hours - rhours) * 60;
      const rminutes = Math.round(minutes);
      if (rminutes == 0) {
        return `${rhours} hrs`;
      } else {
        return `${rhours}:${rminutes} hrs`;
      }
    }
    return `${duration} min`;
  }

  getStartEndDateFromTime(startTime, endTime, timezone) {
    const tStartString = "1970-01-01";
    let tEndString = "1970-01-01";

    const startDate = this.formattedTimeZone(tStartString, startTime, timezone);
    let endDate = this.formattedTimeZone(tEndString, endTime, timezone);

    if (moment(endDate) < moment(startDate)) {
      tEndString = "1970-01-02";
      endDate = this.formattedTimeZone(tEndString, endTime, timezone);
    }

    return {
      start_date: startDate,
      end_date: endDate,
    };
  }

  getNearMinutes(minutes) {
    if (minutes == 0) {
      return 0;
    } else if (minutes < 15) {
      return 15;
    } else if (minutes < 30) {
      return 30;
    } else if (minutes < 45) {
      return 45;
    }
    return 60;
  }

  postedAgo(createdAt, addText = "") {
    const totalDiff =
      (new Date().getTime() - new Date(createdAt).getTime()) / 1000;
    const minuteDiff = Math.abs(Math.round(totalDiff / 60));
    if (minuteDiff < 1) {
      return "Just Now";
    } else if (minuteDiff < 60) {
      return `${minuteDiff} Mins ${addText}`;
    }

    const hourDiff = totalDiff / (60 * 60);
    const hours = Math.abs(Math.round(hourDiff));
    if (hours == 0) {
      return "Just Now";
    }
    if (hours < 24) {
      return `${hours} ${hours < 2 ? "Hour" : "Hours"} ${addText}`;
    }
    const days = Math.abs(Math.ceil(hours / 24));
    return `${days} ${days < 2 ? "Day" : "Days"} ${addText}`;
  }

  dateDiff(createdAt, currentDate = new Date(), addText = "") {
    const totalDiff =
      (currentDate.getTime() - new Date(createdAt).getTime()) / 1000;

    const hourDiff = totalDiff / (60 * 60);
    const hours = Math.abs(Math.round(hourDiff));
    if (hours < 24) {
      return `${hours} ${hours < 2 ? "Hour" : "Hours"} ${addText}`;
    }
    const days = Math.abs(Math.ceil(hours / 24));
    return `${days} ${days < 2 ? "Day" : "Days"} ${addText}`;
  }

  dateDiffDays(createdAt, currentDate = new Date(), addText = "") {
    const currDate = new Date(currentDate);
    currDate.setHours(23, 59, 59);
    const pastDate = new Date(createdAt);
    pastDate.setHours(0, 0, 0);
    const totalDiff = (currDate.getTime() - pastDate.getTime()) / 1000;

    const hourDiff = totalDiff / (60 * 60);
    const hours = Math.abs(hourDiff);
    // if (hours < 24) {
    //   return 0;
    // }
    const days = Math.abs((hours / 24).toFixed(2));
    return days;
  }

  yearsDifference(dt2, dt1) {
    let diff = (dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60 * 60 * 24;
    return Math.abs(Math.floor(diff / 365.25));
  }

  isDateLess(mainDate, refDate) {
    const dt1 = new Date(mainDate);
    const dt2 = new Date(refDate);
    return dt1.getTime() < dt2.getTime();
  }

  getFinancialYear(date, timeZone = Constants.TIME_ZONE) {
    const temp = new Date(date);
    const newDate = new Date(temp.getTime() + 3600000 * timeZone);

    if (newDate.getMonth() + 1 <= 3) {
      return newDate.getFullYear() - 1 + "-" + newDate.getFullYear();
    }
    return newDate.getFullYear() + "-" + (newDate.getFullYear() + 1);
  }

  getPreviousDateFromDate(
    date = new Date(),
    number,
    calendrical,
    timeZone = Constants.TIME_ZONE
  ) {
    const temp = new Date(date);
    const newDate = new Date(temp.getTime() + 3600000 * timeZone);

    return moment(newDate).subtract(number, calendrical);
  }

  getDateObj = (date = new Date(), timezone = Constants.TIME_ZONE) => {
    const day = this.changeTimezoneFromUtc(new Date(date), timezone, "DD");
    const month = this.changeTimezoneFromUtc(new Date(date), timezone, "MM");
    const year = this.changeTimezoneFromUtc(new Date(date), timezone, "YYYY");
    return {
      day,
      month,
      year,
    };
  };

  getDateQuery = (date = new Date(), timezone = Constants.TIME_ZONE) => {
    const dateObj = this.getDateObj(date, timezone);
    return {
      "date_obj.day": dateObj.day,
      "date_obj.month": dateObj.month,
      "date_obj.year": dateObj.year,
    };
  };

  addZero = (num) => {
    return num > 9 ? num : `0${num}`;
  };

  getDateFromObj = (dateObj) => {
    return `${dateObj.year}-${this.addZero(dateObj.month)}-${this.addZero(
      dateObj.day
    )}`;
  };

  getMonthStartEndDates = (datePr, timezone = Constants.TIME_ZONE) => {
    const date = datePr ? new Date(datePr) : new Date();
    const firstDay = this.changeTimezoneFromUtc(
      new Date(date.getFullYear(), date.getMonth(), 1),
      timezone,
      "YYYY-MM-DD"
    );
    const lastDay = this.changeTimezoneFromUtc(
      new Date(date.getFullYear(), date.getMonth() + 1, 0),
      timezone,
      "YYYY-MM-DD"
    );

    const monthStart = new Date(
      this.formattedTimeZone(firstDay, "00:00:00", timezone)
    );
    const monthEnd = new Date(
      this.formattedTimeZone(lastDay, "23:59:59", timezone)
    );
    return {
      start: monthStart,
      end: monthEnd,
    };
  };
  getMonthDates = (month = 1, year = 1997, timezone = Constants.TIME_ZONE) => {
    const date = new Date(`${year}-${month}-01`);
    const currDate = new Date(this.changeTimezoneFromUtc(new Date(), timezone));
    const { end, start } = this.getMonthStartEndDates(date);
    let endDate = end;
    if (
      date.getMonth() === currDate.getMonth() &&
      date.getFullYear() === currDate.getFullYear()
    ) {
      endDate = currDate;
    }
    const dateArr = [];
    for (let i = 1; i <= endDate.getDate(); i++) {
      const temp = new Date(start);
      dateArr.push(
        moment(new Date(temp.setDate(temp.getDate() + i))).format("YYYY-MM-DD")
      );
    }
    return dateArr;
  };

  getRangeDates = (startDate, endDate, timezone = Constants.TIME_ZONE) => {
    const date = new Date(this.changeTimezoneFromUtc(startDate));
    const endTime = new Date(this.changeTimezoneFromUtc(endDate));
    const dateArr = [];
    for (let i = 0; date.getTime() < endTime.getTime(); i++) {
      // const temp = new Date(date);
      dateArr.push(
        moment(new Date(date.setDate(date.getDate() + (i > 0 ? 1 : 0)))).format(
          "YYYY-MM-DD"
        )
      );
    }
    return dateArr;
  };
}

export default new DateUtils();
