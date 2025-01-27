import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import status from "../enums/status";
import bcrypt from "bcryptjs";
import { type } from "joi/lib/types/object";

var userModel = new Schema(
  {    
	    name:{
			type:String
		},
		email: {
			type: String,
		},
		countryCode: {
			type: String,
		},
		mobileNumber: {
			type: Number,
		},
		bio:{
			type: String
		},
		password: {
			type: String,
		},
		salt: {
			type: String,
		},
		availability: [{
			start: Date,
			end: Date,	
		}],
		isVerified: {
			type: Boolean,
			default: false,
		},
		otp: {
			type: Number,
		},
		otpExpireTime: {
			type: String
		},
		forgotPassValidity: {
			type: Date,
			default: null,
		},
		isResetPassActive: {
			type: Boolean,
			default: false,
		},
		status: {
			type: String,
			enum: ['ACTIVE', 'PENDING', 'BLOCKED', 'DELETED'],
			default: 'ACTIVE',
		},
		userType: {
			type: String,
			enum: ['USER', 'ADMIN'],
		},
	},
  { timestamps: true }
);


userModel.plugin(mongooseAggregatePaginate);
userModel.plugin(mongoosePaginate);
module.exports = Mongoose.model("user", userModel);

(async () => {
  let result = await Mongoose.model("user", userModel).find({
    userType: userType.ADMIN,
  });

  if (result.length != 0 && result.userType != "ADMIN") {
    console.log("Default Admin updated.");
  } else {
    let obj = {
      userType: userType.ADMIN,
      name: "Admin",
      countryCode: "+91",
	  bio: "Admin Bio Data",
      mobileNumber: "123456789",
      email: "node@mailinator.com",
      dateOfBirth: "13/01/2003",
      password: bcrypt.hashSync("Reeltor@1"),
      isVerified: true,
    };
    var defaultResult = await Mongoose.model("user", userModel).create(obj);
  }

  if (defaultResult) {
    console.log("DEFAULT DATA Created.", defaultResult);
  }
}).call();
