const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
    name: { type: String, required: true, minlength: 2, maxlength: 50 },
    email: {
        type: String,
        unique: true,
        required: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: { type: String, required: true },
    city: { type: String, default: "Unknown" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    },
    { timestamps: true }
);

userSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
