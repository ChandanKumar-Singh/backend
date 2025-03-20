import { ExpressValidator } from "express-validator";
import Constants from "../config/constants.js";
import moment from "moment";
import { logg } from "./logger.js";

const valida = new ExpressValidator();
export const generateVerificationCode = (len) => {
  if (Constants.envs.production) {
    let text = '';
    const possible = '0123456789';
    for (let i = 0; i < len ?? 6; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  } return '777777';
}

export const isEmail = (email) => {
  var regEx = new RegExp(r = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
  return regEx.test(email);
}

export const isPhone = (phone) => {
  const regEx = new RegExp(r = /^\d{6,14}$/);
  return regEx.test(phone);
}

export const isCountryPhone = (phone) => {
  const regEx = new RegExp(r = /^\+\d{1,3} \d{6,14}$/);
  return regEx.test(phone);
}

export const isCountryCode = (code) => {
  const regEx = new RegExp(r = /^\+\d{1,3}$/);
  return regEx.test(code);
}

export const createDateId = (prefix, seperator = "") => {
  /// date in DDMMYYYYHHMMSS format 
  const format = `DD${seperator}MM${seperator}YYYY${seperator}HH${seperator}mm${seperator}ss`;
  logg(format);
  const date = moment(new Date()).format(format);
  if (prefix) return `${prefix}_${date}`;
  return date;
}
