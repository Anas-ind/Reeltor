import mongoose from 'mongoose';
const schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate';
import status from '../enums/status';
import boolean from 'joi/lib/types/boolean';
const notificationModel = new schema({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: 'users'
    },
    recipients:[
        {
        type: mongoose.Types.ObjectId,
        ref: 'users'
        } ],
    message:{
        type: String
    },
    isCritical:{
        type: Boolean,
        default: false
    },
    status: {
        type:  String,
        enum: ['SENT', 'QUEUED', 'FAILED'],
    },
    sentAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
}, { timestamps: true })

notificationModel.plugin(mongoosePaginate);
notificationModel.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model("notification", notificationModel);