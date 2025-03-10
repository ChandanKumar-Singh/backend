import Constants from '../config/constants.js';

class RolesUtil {
    calculateRole = (departmentId, empCode) => {
        if (['EMP/001', 'EMP/007', 'EMP/322', 'EMP/2391', 'EMP/900'].includes(empCode)) {
            return Constants.roles.userRoles.OWNER;
        } else if (['EMP/330'].includes(empCode)) {
            return Constants.roles.role.SHOWROOM_MANAGER;
        } else {
            return Constants.roles.role.OTHERS;
        }

        // if (Constants.CORPORATE_HR_CODES.indexOf(empCode) >= 0) {
        //   return Constants.ROLES.CORPORATE_HR;
        // } else if (Constants.HR_ADMIN_CODES.indexOf(empCode) >= 0 || Constants.env === 'development') { //Constants.DEFAULT_HR_ID === departmentId.toString()
        //   return Constants.ROLES.ADMIN;
        // } else if (Constants.RECRUITER_CODES.indexOf(empCode) >= 0) {
        //   return Constants.ROLES.RECRUITER;
        // } else if (Constants.OLR_CODES.indexOf(empCode) >= 0) {
        //   return Constants.ROLES.OLR;
        // } else {
        //   return Constants.ROLES.OTHERS;
        // }
    };

    isUserCorporateHr = (empCode) => {
        const role = this.calculateRole(null, empCode);
        return role === Constants.roles.role.CORPORATE_HR;
    };
}

export default new RolesUtil();
