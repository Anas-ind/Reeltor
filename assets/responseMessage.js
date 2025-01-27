module.exports = {
	REJECT: "Rejected",
    APPROVE: "Approved",
    ADMIN_NOT_FOUND: "Admin not found",
    BLOCK_BY_ADMIN: "Blocked by admin",
    EMAIL_EXIST: "Email already Exists",
    USER_CREATED: "User created successfully",
    USER_NOT_FOUND: "User not found",
    INCORRECT_LOGIN: "Incorrect email or password",
    INCORRECT_OTP: "Incorrect OTP",
    OTP_EXPIRED: "OTP expired",
    OTP_VERIFY: "OTP verified successfully",
    OTP_SEND: "OTP sent successfully",
    USER_UPDATED: "User updated successfully",
    DATA_FOUND: "Data found successfully",
	SMS_BODY: (otp) => `Your verification code is  ${otp}`,
	REFER_SMS_BODY: (first_name, last_name, referral_code, iosLink, androidLink, webLink) => `${first_name} ${last_name} wants to refer you on PayPenny application. 
	Please use ${referral_code} as the referral code. Website Link : ${webLink}, Android Link : ${androidLink}, IOS Link : ${iosLink}`
};
