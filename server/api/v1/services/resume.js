import statuss from "../../../enums/status";
import { mongo, Mongoose } from "mongoose";

const resumeServices = {

  createResume: async (insertObj) => {
    return await ResumeModel.create(insertObj);
  },

  findResume: async (query) => {
    return await ResumeModel.findOne(query);
  },

  updateResume: async (query, updateObj) => {
    return await ResumeModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  listResume: async (query) => {
    return await ResumeModel.find(query);
  },
  deleteAllResume: async () => {
    return await ResumeModel.deleteMany({});
  },

  getResumeList: async (insertObj) => {
    let query = { status: { $ne: 'DELETE' } };
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
    return await ResumeModel.paginate(query, options);
  },

  viewResume: async (insertObj) => {
    return await ResumeModel.findOne(insertObj);
  },
  ResumeCount: async (query) => {
    return await ResumeModel.countDocuments(query);
  },

  firstQuestion:async(query)=>{
    let pipeline=[
      {
        $match: { status: 'ACTIVE' } 
      },
      {
        $sort: { createdAt: 1 } 
      },
      {
        $group: {
          _id: "$category",       
          firstQuestion: { $first: "$$ROOT" } 
        }
      },
      {
        $replaceRoot: { newRoot: "$firstQuestion" }  
      }
    ]
    let options = {
      page: query.page || 1,
      limit:query.limit || 10,
    }
    let agg = ResumeModel.aggregate(pipeline);
    return await ResumeModel.aggregatePaginate(agg,options);
  },
  updateManyResume: async (query, updateObj) => {
    return await ResumeModel.updateMany(query, updateObj);
  },

  latestQuestion: async (query) => {
    return await ResumeModel.findOne(query).sort({ createdAt: -1 });
  },
}

module.exports = { resumeServices };