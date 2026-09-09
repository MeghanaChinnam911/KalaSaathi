import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    user_id: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      default: 0
    },
    images: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ['active', 'draft', 'archived'],
      default: 'active'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: false }
);

productSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
