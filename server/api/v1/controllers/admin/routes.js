import Express from "express";
import controller from "./controller";
import auth from '../../../../helper/auth'
import upload from '../../../../helper/uploadHandler';

export default Express.Router()
  .post('/login', controller.login)
  .post('/password/forget', controller.forgotPassword)
  .post('/otp/verify', controller.verifyOTP)
  .post('/otp/resend', controller.resendOtp)
  .use(auth.verifyToken)

  .use(upload.uploadFile)
  .put('/profile', controller.editProfile)








