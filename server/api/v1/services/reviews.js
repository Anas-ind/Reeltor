
import statuss from "../../../enums/status";

const reviewServices = {

  createReview: async (insertObj) => {
    return await reviewModel.create(insertObj);
  },

  findReview: async (query) => {
    return await reviewModel.findOne(query);
  },

  updateReview: async (query, updateObj) => {
    return await reviewModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  listReview: async (query) => {
    return await reviewModel.find(query);
  },
  deleteAllReview: async () => {
    return await reviewModel.deleteMany({});
  },

  getAllReview: async (insertObj) => {

    let query = { status: { $ne: statuss.DELETE } };
    const { search, fromDate, toDate, page, limit, status, reply } = insertObj;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ]
    }

    if (status) {
      query.status = status
    }
    console.log(reply)
    if (reply) {
      query.reply = reply
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
    return await contactUsModel.paginate(query, options);
  },
  viewReview: async (insertObj) => {
    return await reviewModel.findOne(insertObj);
  },
  ReviewCount: async (query) => {
    return await reviewModel.countDocuments(query);
  },
  latestReview: async (query) => {
    return await reviewModel.findOne(query).sort({ createdAt: -1 });
  },

}

module.exports = { reviewServices };