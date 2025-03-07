const { Vendor } = require("../models/vendor"); // Import new Vendor model
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/signup", async (req, res) => {
  const {
    companyName,
    gstNumber,
    email,
    phone,
    password,
    address,
    accountHolderName,
    accountNumber,
    confirmAccountNumber,
    ifscCode,
  } = req.body;

  try {
    const existingVendor = await Vendor.findOne({ email });
    const existingVendorByPhone = await Vendor.findOne({ phone });
    if (existingVendor || existingVendorByPhone) {
      return res
        .status(400)
        .json({ status: false, message: "Vendor already exists" });
    }

    if (accountNumber !== confirmAccountNumber) {
      return res.status(400).json({ message: "Account numbers do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = await Vendor.create({
      companyName,
      gstNumber,
      email,
      phone,
      password: hashedPassword,
      address,
      accountHolderName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
    });

    const token = jwt.sign(
      { email: vendor.email, id: vendor._id },
      process.env.JWT_SECRET
    );

    res.status(201).json({ vendor, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Something went wrong" });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingVendor = await Vendor.findOne({ email });
    if (!existingVendor) {
      return res
        .status(404)
        .json({ status: false, message: "Vendor not found" });
    }
    const matchPassword = await bcrypt.compare(
      password,
      existingVendor.password
    );
    if (!matchPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: existingVendor.email, id: existingVendor._id },
      process.env.JWT_SECRET
    );

    res
      .status(200)
      .json({ vendor: existingVendor, token, msg: "Vendor Authenticated" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/", async (req, res) => {
  try {
    const vendorList = await Vendor.find();
    res.send(vendorList);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.send(vendor);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.put("/:id", async (req, res) => {
  const {
    companyName,
    gstNumber,
    email,
    phone,
    address,
    accountHolderName,
    accountNumber,
    confirmAccountNumber,
    ifscCode,
    password,
  } = req.body;

  const vendorExist = await Vendor.findById(req.params.id);
  if (!vendorExist) {
    return res.status(404).json({ message: "Vendor not found" });
  }

  let newPassword = vendorExist.password;
  if (password) {
    newPassword = bcrypt.hashSync(password, 10);
  }

  const updatedVendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    {
      companyName,
      gstNumber,
      email,
      phone,
      address,
      accountHolderName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
      password: newPassword,
    },
    { new: true }
  );

  res.send(updatedVendor);
});

router.delete("/:id", async (req, res) => {
  try {
    const deletedVendor = await Vendor.findByIdAndDelete(req.params.id);
    if (!deletedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    res.status(200).json({ success: true, message: "Vendor deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

module.exports = router;
