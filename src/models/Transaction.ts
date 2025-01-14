import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  mpesaRequestId: {
    type: String,
    required: true,
  },
  mpesaReceiptNumber: String,
  resultCode: Number,
  resultDesc: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction; 