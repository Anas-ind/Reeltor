import Joi from "joi";
import Mongoose from "mongoose";
import _ from "lodash";
import config from "config";
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import bcrypt from "bcryptjs";
import responseMessage from "../../../../../assets/responseMessage";
import status from "../../../../enums/status";
import userType from "../../../../enums/userType";
const { v4: uuidv4 } = require('uuid');
import { userServices } from "../../services/user";
const { findUser, updateUser, updateUserById, createUser , getAllUserList , userFindList , userCount , userCountGraph , userCount2} = userServices;
import commonFunction from "../../../../helper/util";



const threads = {};
export class adminController {
  /**
   * @swagger
   * /admin/login:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: Admin login with email and Password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: login
   *         description: login
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/login'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async login(req, res, next) {
    var validationSchema = {
      emailUsernameOrPhone: Joi.string().required(),
      password: Joi.string().required(),
    };
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      var results;
      var validatedBody = await Joi.validate(req.body, validationSchema);
      const {
        emailUsernameOrPhone,
        password
      } = validatedBody;
      var userResult = await findUser({
        $and: [{
          status: {
            $ne: status.DELETE
          }
        },
        {
          userType: {
            $ne: userType.USER
          }
        },
        {
          $or: [{
            email: emailUsernameOrPhone
          }]
        },
        ],
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (!bcrypt.compareSync(password, userResult.password)) {
        throw apiError.conflict(responseMessage.INCORRECT_LOGIN);
      } else {
        var token = await commonFunction.getToken({
          _id: userResult._id,
          email: userResult.email,
          mobileNumber: userResult.mobileNumber,
          userType: userResult.userType,
        });
        results = {
          _id: userResult._id,
          email: userResult.email,
          // speakeasy: userResult.speakeasy,
          userType: userResult.userType,
          token: token,
        };
      }
      return res.json(new response(results, responseMessage.LOGIN));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/profile:
   *   get:
   *     tags:
   *       - ADMIN
   *     description: get his own profile details with getProfile API
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async getProfile(req, res, next) {
    try {

      let adminResult = await findUser({
        _id: req.userId,
        userType: {
          $ne: userType.USER
        },
        status: {
          $ne: status.DELETE
        },
      });
      if (!adminResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      adminResult = _.omit(JSON.parse(JSON.stringify(adminResult)), ["otp", "password", "base64", "secretGoogle", "emailotp2FA", "withdrawOtp", "password"])

      return res.json(new response(adminResult, responseMessage.USER_DETAILS));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/profile:
   *   put:
   *     tags:
   *       - ADMIN
   *     description: editProfile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: firstName
   *         description: firstName
   *         in: formData
   *         required: false
   *       - name: lastName
   *         description: lastName
   *         in: formData
   *         required: false
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async editProfile(req, res, next) {
    const validationSchema = {
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
    };
    try {

      const validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({
        _id: req.userId,
        userType: {
          $ne: userType.USER
        },
        status: {
          $ne: status.DELETE,
        },
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      var result = await updateUser({
        _id: userResult._id,
      },
        validatedBody
      );
      return res.json(new response(result, responseMessage.USER_UPDATED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/password/forget:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: forgotPassword by ADMIN on plateform when he forgot password
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: forgotPassword
   *         description: forgotPassword
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/forgotPassword'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async forgotPassword(req, res, next) {
    var validationSchema = {
      email: Joi.string().required(),
    };
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      var validatedBody = await Joi.validate(req.body, validationSchema);
      const {
        email
      } = validatedBody;
      var userResult = await findUser({
        $and: [{
          status: {
            $ne: status.DELETE
          }
        },
        {
          userType: {
            $ne: userType.USER
          },
        },
        {
          $or: [{
            email: email
          }]
        },
        ],
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        var otp = commonFunction.getOTP();
        var newOtp = otp;
        var time = Date.now() + 180000;
        console.log('zxbzjhxbzxbz' , time);
        await commonFunction.sendEmailForgotPassOtp(userResult.email, otp );
        var updateResult = await updateUser({
          _id: userResult._id
        }, {
          $set: {
            otp: newOtp,
            otpExpireTime: time
          }
        });
        updateResult = _.omit(JSON.parse(JSON.stringify(updateResult)), ["otp", "password", "base64", "secretGoogle", "emailotp2FA", "withdrawOtp", "password"])

        return res.json(new response(updateResult, responseMessage.OTP_SEND));
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/otp/verify:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: verifyOTP
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: verifyOTP
   *         description: verifyOTP
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/verifyOTP'
   *     responses:
   *       200:
   *         description: OTP send successfully.
   *       404:
   *         description: This user does not exist.
   *       500:
   *         description: Internal Server Error
   *       501:
   *         description: Something went wrong!
   */
  async verifyOTP(req, res, next) {
    var validationSchema = {
      email: Joi.string().required(),
      otp: Joi.string().required(),
    };
    try {
      var validatedBody = await Joi.validate(req.body, validationSchema);
      const {
        email,
        otp
      } = validatedBody;
      let userResult = await findUser({
        email: email,
        userType: {
          $ne: userType.USER
        },
        status: status.ACTIVE
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      console.log('zxzxzxzx' , new Date().getTime() , 'gasjhagsja' , userResult.otpExpireTime);
      if (new Date().getTime() > userResult.otpExpireTime) {
        throw apiError.badRequest(responseMessage.OTP_EXPIRED);
      }

      if (userResult.otp != otp) {
        throw apiError.badRequest(responseMessage.INCORRECT_OTP);
      }
      var updateResult = await updateUser({
        _id: userResult._id
      }, {
        otpVerified: true
      });
      var token = await commonFunction.getToken({
        _id: updateResult._id,
        email: updateResult.email,
        mobileNumber: updateResult.mobileNumber,
        userType: updateResult.userType,
      });
      var obj = {
        _id: updateResult._id,
        name: updateResult.name,
        email: updateResult.email,
        countryCode: updateResult.countryCode,
        mobileNumber: updateResult.mobileNumber,
        otpVerified: true,
        token: token,
      };
      return res.json(new response(obj, responseMessage.OTP_VERIFY));
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/otp/resend:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: resend otp by ADMIN on plateform when he resend otp
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: resendOtp
   *         description: resendOtp
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/resendOtp'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async resendOtp(req, res, next) {
    var validationSchema = {
      email: Joi.string().required(),
    };
    try {
      if (req.body.email) {
        req.body.email = req.body.email.toLowerCase();
      }
      var validatedBody = await Joi.validate(req.body, validationSchema);
      const {
        email
      } = validatedBody;
      var userResult = await findUser({
        $and: [{
          status: {
            $ne: status.DELETE
          }
        },
        {
          userType: {
            $ne: userType.USER
          },
        },
        {
          $or: [{
            email: email
          }]
        },
        ],
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        var otp = commonFunction.getOTP();
        var newOtp = otp;
        var time = Date.now() + 180000;
        await commonFunction.sendEmailForgotPassOtp(userResult.email, otp);
        var updateResult = await updateUser({
          _id: userResult._id
        }, {
          $set: {
            otp: newOtp,
            otpExpireTime: time
          }
        });
        updateResult = _.omit(JSON.parse(JSON.stringify(updateResult)), ["otp", "password", "base64", "secretGoogle", "emailotp2FA", "withdrawOtp", "password"])

        return res.json(new response(updateResult, responseMessage.OTP_SEND));
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/password/change:
   *   put:
   *     tags:
   *       - ADMIN
   *     description: changePassword
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: true
   *       - name: changePassword
   *         description: changePassword
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/changePassword'
   *     responses:
   *       200:
   *         description: Returns success message
   */
  async changePassword(req, res, next) {
    const validationSchema = {
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
    };
    try {
      let validatedBody = await Joi.validate(req.body, validationSchema);
      let userResult = await findUser({ 
      _id: req.userId, userType: { $ne: userType.USER }, status: { $ne: status.DELETE },
      });

      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }
      if (!bcrypt.compareSync(validatedBody.currentPassword, userResult.password)) {
        throw apiError.badRequest(responseMessage.PWD_NOT_MATCH);
      }
      if(bcrypt.compareSync(validatedBody.currentPassword , validatedBody.newPassword)){
        throw apiError.badRequest(responseMessage.OLDPASSNOTALLOW);
      }
      let updated = await updateUserById(userResult._id, {
        password: bcrypt.hashSync(validatedBody.newPassword),
      });
      updated = _.omit(JSON.parse(JSON.stringify(updated)), ["otp", "password", "base64", "secretGoogle", "emailotp2FA", "withdrawOtp", "password"])
      return res.json(new response(updated, responseMessage.PWD_CHANGED));
    } catch (error) {
      return next(error);
    }
  }

  /**
   * @swagger
   * /admin/password/reset:
   *   post:
   *     tags:
   *       - ADMIN
   *     description: resetPassword
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: token
   *         in: header
   *         required: false
   *       - name: resetPassword
   *         description: resetPassword
   *         in: body
   *         required: false
   *         schema:
   *           $ref: '#/definitions/resetPassword'
   *     responses:
   *       200:
   *         description: Your password has been successfully changed.
   *       404:
   *         description: This user does not exist.
   *       422:
   *         description: Password not matched.
   *       500:
   *         description: Internal Server Error
   *       501:
   *         description: Something went wrong!
   */
  async resetPassword(req, res, next) {
    const validationSchema = {
      newpassword: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    };
    try {
      const validatedBody = await Joi.validate( req.body, validationSchema );
     
      var userResult = await findUser({
        _id: req.userId,
        userType: {
          $ne: userType.USER
        },
        status: status.ACTIVE,
      });
      if (!userResult) {
        throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      } else {
        if (validatedBody.newpassword == validatedBody.confirmPassword) {
          let update = await updateUser({
            _id: userResult._id
          }, {
            password: bcrypt.hashSync(validatedBody.newpassword)
          });
          update = _.omit(JSON.parse(JSON.stringify(update)), ["otp", "password", "base64", "secretGoogle", "emailotp2FA", "withdrawOtp", "password"])

          return res.json(new response(update, responseMessage.PWD_CHANGED));
        } else {
          throw apiError.notFound(responseMessage.PWD_NOT_MATCH);
        }
      }
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }

}
export default new adminController();