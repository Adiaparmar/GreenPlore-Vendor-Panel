const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  gstNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },

  // Address Fields
  address: {
    floorBuilding: { type: String, required: true },
    streetLocality: { type: String, required: true },
    landmark: { type: String },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
  },

  // Bank Details
  accountHolderName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  confirmAccountNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return value === this.accountNumber;
      },
      message: "Account numbers do not match",
    },
  },
  ifscCode: {
    type: String,
    required: true,
  },

  // Vendor Authentication
  password: {
    type: String,
    required: true,
  },
});

// Virtual ID
vendorSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
vendorSchema.set("toJSON", { virtuals: true });

exports.Vendor = mongoose.model("Vendor", vendorSchema);
