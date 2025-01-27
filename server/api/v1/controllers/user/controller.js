import Joi from "joi";
import { google } from 'googleapis';
import Mongoose, {
  Promise
} from "mongoose";
import _ from "lodash";
import config from "config";
const speakeasy = require('speakeasy');
const bodyParser = require('body-parser');
let qrcode = require('qrcode')
import apiError from "../../../../helper/apiError";
import response from "../../../../../assets/response";
import bcrypt from "bcryptjs";
var QRCode = require('qrcode');
import responseMessage from "../../../../../assets/responseMessage";
import commonFunction from "../../../../helper/util";
import jwt from "jsonwebtoken";
import status from "../../../../enums/status";
import userType from "../../../../enums/userType";
import userModel from "../../../../models/user";
import notificationModel from "../../../../models/notification";

const fs = require('fs');
const path = require('path');
const moment = require('moment-timezone');


const calendar = google.calendar('v3');
const OAuth2 = google.auth.OAuth2;

// const oauth2Client = new google.auth.OAuth2(
//   config.get("GoogleAuth.CLIENT_ID"),
//   config.get("GoogleAuth.CLIENT_SECRET"),
//   config.get("GoogleAuth.REDIRECT_URI")
// );

import { reviewServices } from "../../services/reviews"
const { createReview } = reviewServices;
import {resumeServices } from "../../services/resume"
const { createResume } = resumeServices;

import {
  userServices
} from "../../services/user";
const {
  userCheck,
  checkUserExists,
  emailExist,
  createUser,
  userCount,
  findUser,
  findUserData,
  userFindList,
  updateUser,
  updateUserById,
} = userServices;


export class userController {

  //*******************CONTACT US */

  /**
    * @swagger
    * /user/signup:
    *   post:
    *     tags:
    *       - USER
    *     description: user Signup
    *     produces:
    *       - application/json
    *     parameters:
    *       - name: name
    *         description: full Name
    *         in: formData
    *         required: true
    *       - name: countryCode
    *         description: countryCode of the number
    *         in: formData
    *         required: false
    *       - name: mobileNumber
    *         description: mobileNumber
    *         in: formData
    *         required: false
    *       - name: email
    *         description: email
    *         in: formData
    *         required: true
    *       - name: password
    *         description: password of the User Accoount
    *         in: formData
    *         required: true
    *     responses:
    *       200:
    *         description: Returns success message
    */
  async signup(req, res, next) {
    var validationSchema = {
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        countryCode: Joi.string().optional(),
        mobileNumber: Joi.string().optional(),
    }
    try {
        const validatedBody = await Joi.validate(req.body, validationSchema);
        let userResult = await findUser({ email: validatedBody.email, status: { $ne: status.DELETE } });
        if (userResult) {
            if (userResult.status == status.BLOCK) {
                throw apiError.badRequest(responseMessage.BLOCK_BY_ADMIN);
            } else if (userResult.isVerified == true) {
                throw apiError.conflict(responseMessage.EMAIL_EXIST);
            }
        }
  
    
        validatedBody.password = bcrypt.hashSync(validatedBody.password)
        var newOtp = commonFunction.getOTP();
        var time = Date.now() + 180000;
        validatedBody.otp = newOtp
        validatedBody.otpExpireTime = time
        await commonFunction.sendEmailOtp(validatedBody.email, newOtp);
        let result
        if (userResult) {
            result = await updateUser({ _id: userResult._id }, validatedBody)
        } else {
            result = await createUser(validatedBody)

        }
        result = _.omit(JSON.parse(JSON.stringify(result)), ["otp", "password", "base64", "password" , "_id" , "forgotPassValidity" , "isResetPassActive" , "otpExpireTime" , "availability" , "__v" , ])
        return res.json(new response(result, responseMessage.USER_CREATED));
        
    } catch (error) {
        console.error('Error in signup:', error);
        return next(error);
    }
}
  /**
   * @swagger
   * /user/login:
   *   post:
   *     tags:
   *       - USER
   *     description: login
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email
   *         in: formData
   *         required: true
   *       - name: mobileNumber
   *         description: mobileNumber
   *         in: formData
   *         required: false
   *       - name: password
   *         description: password
   *         in: formData
   *         required: true
   *     responses:
   *       200:
   *         description: Contact-Us data Saved successfully
   */

   async login(req, res, next) {
      var validationSchema = {
        email: Joi.string().required(),
        password: Joi.string().required(),
      };
      try {
        if (req.body.email) {
          req.body.email = req.body.email.toLowerCase();
        }
        var results;
        var validatedBody = await Joi.validate(req.body, validationSchema);
        const {
          email,
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
              email: email
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
     * /user/verifyOtp:
     *   post:
     *     tags:
     *       - USER
     *     description: verifyOtp
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
    async verifyOtp(req, res, next) {
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
          isVerified: true
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
          isVerified: true,
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
       * /user/resendOtp:
       *   post:
       *     tags:
       *       - USER
       *     description: resend otp by user
       *     produces:
       *       - application/json
       *     parameters:
       *       - name: email
       *         description: email 
       *         in: formData
       *         required: true
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
   * /user/uploadFile:
   *   post:
   *     tags:
   *       - USER
   *     description: uploadFile
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: file
   *         description: uploaded_file
   *         in: formData
   *         type: file
   *         required: true
   *     responses:
   *       200:
   *         description: Returns success message
   */
   async uploadFile(req, res, next) {
    try {
      
      // Assuming commonFunction.getImageUrl uploads the file and returns a URL
      let result1 = await commonFunction.getImageUrl(req.files);
      
      let validateBody = {
        resumeURL: result1 
      };
      // Save the data to the database
      let result = await createResume(validateBody);
      // Send a successful response
      return res.json(new response(result, responseMessage.UPLOAD_SUCCESS));
    } catch (error) {
      console.error('Error in uploadFile:', error);
      return next(error);
    }
  }

   /**
 * @swagger
 * /user/updateProfile:
 *   put:
 *     tags:
 *       - USER
 *     description: Update user profile with availability time slots
 *     produces:
 *       - application/json
 *     consumes:
 *       - application/json
 *     parameters:
 *       - name: token
 *         description: Authentication token
 *         in: header
 *         required: true
 *       - in: body
 *         name: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             mobileNumber:
 *               type: string
 *             countryCode:
 *               type: string
 *             availability:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-07-20T09:00:00Z"
 *                   end:
 *                     type: string
 *                     format: date-time
 *                     example: "2023-07-20T17:00:00Z"
 *             bio:
 *               type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
async updateProfile(req, res, next) {
  const validationSchema = {
      name: Joi.string().optional(),
      mobileNumber: Joi.string().optional(),
      countryCode: Joi.string().optional(),
      availability: Joi.array().items(
          Joi.object({
              start: Joi.date().iso().required(),
              end: Joi.date().iso().greater(Joi.ref('start')).required()
          })
      ).optional(),
      bio: Joi.string().optional(),
  };

  try {
      const validatedBody = await Joi.validate(req.body , validationSchema);
      
      // Find the user (removed unnecessary userType condition)
      const userResult = await findUser({
          _id: req.userId,
          status: { $ne: status.DELETE }
      });
      
      if (!userResult) {
          throw apiError.notFound(responseMessage.USER_NOT_FOUND);
      }

      // Update user with validated data
      const result = await updateUser(
          { _id: userResult._id },
          validatedBody
      );

      return res.json(new response(result, responseMessage.USER_UPDATED));
  } catch (error) {
      return next(error);
  }
}

      /**
        * @swagger
        * /user/getProfile:
        *   get:
        *     tags:
        *       - USER
        *     description: getProfile
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
     
           let userResult = await findUser({
             _id: req.userId,
             status: {
               $ne: status.DELETE,
             },
           });
           if (!userResult) {
             throw apiError.notFound(responseMessage.USER_NOT_FOUND);
           }
           userResult = _.omit(JSON.parse(JSON.stringify(userResult)), ["otp", "password", "base64", "secretGoogle", "emailotp2FA", "withdrawOtp", "password"])
    
           return res.json(new response(userResult, responseMessage.DATA_FOUND));
         } catch (error) {
           return next(error);
         }
       }


     /**
     * @swagger
     * /user/sendNotification:
     *   post:
     *     tags:
     *       - USER
     *     description: sendNotification
     *     produces:
     *       - application/json
     *     consumes:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - in: body
     *         name: body
     *         required: true
     *         schema:
     *           type: object
     *           properties:
     *             recipients:
     *               type: array
     *               items:
     *                 type: string
     *                 format: email
     *               example: ["user1@example.com", "user2@example.com"]
     *             message:
     *               type: string
     *               example: "Hello world!"
     *             isCritical:
     *               type: boolean
     *               example: false
     *     responses:
     *       200:
     *         description: Returns success message
     */

       async sendNotification(req, res, next) {
        const validationSchema = {
            recipients: Joi.array()
                .items(Joi.string().email().lowercase())
                .required()
                .min(1),
            message: Joi.string().required().max(500),
            isCritical: Joi.boolean().default(false)
        };
    
        try {
            const validatedBody = await Joi.validate(req.body , validationSchema  );
            const senderId = req.userId;
    
            // Verify sender exists
            const sender = await findUser({ 
              _id: req.userId,
              status: {
                $ne: status.DELETE,
              },
            });
            if (!sender) throw apiError.notFound(responseMessage.USER_NOT_FOUND);
    
            const notifications = [];
            const failedEmails = [];
    
            // Bulk find recipients
            const recipients = await userModel.find({
                email: { $in: validatedBody.recipients },
                status: status.ACTIVE
            }).select('email availability');
            
            // Process each valid recipient
            for (const recipient of recipients) {
                let status = 'QUEUED';
                let deliveredAt = null;
                const now = new Date();
    
                if (validatedBody.isCritical) {
                    status = 'SENT';
                    deliveredAt = now;
                } else {
                    const isAvailable = recipient.availability.some(slot => {
                        return now >= slot.start && now <= slot.end;
                    });
                    
                    if (isAvailable) {
                        status = 'SENT';
                        deliveredAt = now;
                    }
                }
    
                const notification = new notificationModel({
                    sender: senderId,
                    recipients: [recipient._id], // Store user ID reference
                    message: validatedBody.message,
                    isCritical: validatedBody.isCritical,
                    status: status,
                    sentAt: now,
                    deliveredAt: deliveredAt
                });
    
                await notification.save();
                notifications.push(notification);
            }
    
            // Track invalid emails
            const validEmails = recipients.map(r => r.email);
            validatedBody.recipients.forEach(email => {
                if (!validEmails.includes(email)) failedEmails.push(email);
            });
    
            return res.status(201).json(new response({
                sentNotifications: notifications.length,
                failedEmails: failedEmails,
                message: `Processed ${notifications.length} notifications, ${failedEmails.length} invalid emails`
            }, "Notification processing completed"));
    
        } catch (error) {
            console.error("The Error is in User SendNotification" , error)
            return next(error);
        }
    }




  


}
export default new userController();