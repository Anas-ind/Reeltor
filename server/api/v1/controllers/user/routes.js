import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';



export default Express.Router()
    .post("/signup", controller.signup)
    .post('/login', controller.login)
    .post("/verifyOtp" , controller.verifyOtp)
    .post("/resendOtp", controller.resendOtp)
    .use(upload.uploadFile)
    .use(auth.verifyToken)
    .put('/updateProfile', controller.updateProfile)
    .get('/getProfile', controller.getProfile)
    .post("/sendNotification", controller.sendNotification)
    .post('/uploadFile', controller.uploadFile)

 