import { ExpressValidator } from "express-validator";
import Constants from "../config/constants.js";

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
