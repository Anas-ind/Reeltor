import userModel from "../../../models/user";
import status from "../../../enums/status";
import userType from "../../../enums/userType";

const userServices = {
  userCheck: async (userId) => {
    let query = {
      $and: [
        { status: { $ne: status.DELETE } },
        { $or: [{ email: userId }, { mobileNumber: userId }] },
      ],
    };
    return await userModel.findOne(query);
  },
  checkUserExists: async (email) => {
    let query = {
      $and: [
        { status: { $ne: status.DELETE } },
        { $or: [{ email: email }] },
      ],
    };
    return await userModel.findOne(query);
  },

  emailExist: async (email, id) => {
    let query = {
      $and: [
        { status: { $ne: status.DELETE } },
        { _id: { $ne: id } },
        { email: email },
      ],
    };
    return await userModel.findOne(query);
  },

  checkSocialLogin: async (socialId, socialType) => {
    return await userModel.findOne({
      socialId: socialId,
      socialType: socialType,
    });
  },

  createUser: async (insertObj) => {
    return await userModel.create(insertObj);
  },

  findUser: async (query) => {
    return await userModel.findOne(query).populate([
      { path: 'referrerId' },
      { path: 'referredPeople' }
    ]);
  },

  userCount: async () => {
    return await userModel.countDocuments({
      userType: { $ne: userType.ADMIN },
      status: { $ne: status.DELETE }
    });
  },


  userCountGraph: async (query) => {
    return await userModel.countDocuments(query);
  },
  findUserData: async (query) => {
    return await userModel.findOne(query);
  },

  deleteUser: async (query) => {
    return await userModel.deleteOne(query);
  },

  userFindList: async (query) => {
    return await userModel.find(query);
  },
  updateUser: async (query, updateObj) => {
    return await userModel
      .findOneAndUpdate(query, updateObj, { new: true })
      .select("-otp");
  },


  updateUserById: async (query, updateObj) => {
    return await userModel
      .findByIdAndUpdate(query, updateObj, { new: true })
      .select("-otp");
  },
  multiUpdateLockedBal: async () => {
    return await userModel.updateMany({}, { $set: { lockedBalance: 0 } }, { multi: true });
  },
  insertManyUser: async (obj) => {
    return await userModel.insertMany(obj);
  },

  getAllUserList: async (insertObj) => {
    let query = { status: { $ne: 'DELETE' } , userType: { $ne: userType.ADMIN } };
    const { search, fromDate, toDate, page, limit, status } = insertObj;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ]
    }
    if (status) {
      query.status = status
    }
    if (fromDate && !toDate) {
      let from = new Date(fromDate).setHours(0, 0, 0, 0);
      query.createdAt = { $gte: new Date(from).toISOString() };
    }
    if (!fromDate && toDate) {
      let to = new Date(toDate).setHours(23, 59, 59, 999);
  
      query.createdAt = { $lte: new Date(to).toISOString() };
    }
    if (fromDate && toDate) {
      let from = new Date(fromDate).setHours(0, 0, 0, 0);
      let to = new Date(toDate).setHours(23, 59, 59, 999);
      query.$and = [
        { createdAt: { $gte: new Date(from).toISOString() } },
        { createdAt: { $lte: new Date(to).toISOString() } },
      ]
    }

    let options = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort: { createdAt: -1 },
      select: '-otp -password -base64 -secretGoogle -emailotp2FA -withdrawOtp'
    };
    return await userModel.paginate(query, options);
  },


};

module.exports = { userServices };
