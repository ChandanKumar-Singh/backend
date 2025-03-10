import Constants from "../config/constants.js";

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
