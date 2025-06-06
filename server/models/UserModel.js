import mongoose from "mongoose";
import Constants from "../config/constants.js";
import moment from "moment";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String },
    country_code: { type: String },
    contact: { type: String, unique: true },
    company_name: { type: String },
    state: { type: String },
    city: { type: String },
    email: { type: String, lowercase: true, unique: true },
    title: { type: String },
    reg_id: { type: String },
    image: { type: String, default: Constants.DEFAULT_USER_IMAGE },
    type: {
      type: String,
      enum: Object.values(Constants.roles.type),
    },
    role: {
      type: String,
      enum: [...Object.values(Constants.roles.adminRole), ...Object.values(Constants.roles.userRole)],
      default: Constants.roles.userRole.GENERAL,
    },
    password: { type: String },
    member_id: { type: Schema.Types.ObjectId, ref: "members" },
    is_member: { type: Boolean, default: false },
    is_admin: { type: Boolean, default: false },
    is_participant: { type: Boolean, default: false },
    qr_code: { type: String },
    vcf: { type: String },
    status: {
      type: String,
      enum: Object.keys(Constants.USER_STATUS),
      default: Constants.USER_STATUS.ACTIVE,
    },
    is_auto: { type: Boolean, default: false },
    approved_by: { type: Schema.Types.ObjectId },
    approved_on: { type: Date },
    created_by: { type: Schema.Types.ObjectId },
    last_login: { type: Date },
    otp: { type: String },
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: "devices" },
    fcmToken: { type: String, default: '' },
    is_profile_completed: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ name: 1 });
UserSchema.index({ contact: 1 });
UserSchema.index({ email: 1 });

UserSchema.set("toJSON", {
  virtuals: true,
  transform(doc, obj) {
    obj.id = obj._id;
    if (!obj.image) {
      obj.image = `${Constants.public_url}${Constants.DEFAULT_EMPLOYEE_IMAGE}`;
    } else {
      obj.image = `${Constants.public_url}${obj.image}`;
    }
    obj.createdAt = moment(obj.createdAt).format("DD-MM-YYYY");
    delete obj._id;
    return obj;
  },
});

UserSchema.post("save", (doc) => {
  /* UserDBO.purgeCache(doc._id);
  if (doc.member_id) {
    EventUtils.dispatch(Constants.EVENT.MEMBER_USERS_UPDATE, {
      memberId: doc.member_id,
    });
  } */
});

UserSchema.pre("save", function (done) {
  if (this.isModified("password")) {
    const { saltRounds } = Constants.security;
    this._hashPassword(this.password, saltRounds, (err, hash) => {
      this.password = hash;
      done();
    });
  } else {
    done();
  }
  // eslint-enable no-invalid-this
});

UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   * @public
   * @param {String} password
   * @return {Boolean} passwords match
   */
  authenticate(password) {
    return bcrypt.compareSync(password, this.password);
  },
  /**
   * Generates a JSON Web token used for route authentication
   * @public
   * @return {String} signed JSON web token
   */
  generateToken(uniquekey) {
    return jwt.sign(
      { id: this._id, uniquekey: uniquekey },
      Constants.security.sessionSecret,
      {
        expiresIn: Constants.security.sessionExpiration,
      }
    );
  },

  /**
   * Create password hash
   * @private
   * @param {String} password
   * @param {Number} saltRounds
   * @param {Function} callback
   * @return {Boolean} passwords match
   */
  _hashPassword(
    password,
    saltRounds = Constants.security.saltRounds,
    callback
  ) {
    // return password;
    // return bcrypt.hash(password, saltRounds, callback);
    return bcrypt.hash(password, saltRounds, callback);
  },
};

UserSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordExpires = Date.now() + 3600000;
};

const UserModel = mongoose.model("users", UserSchema);

export default UserModel;
