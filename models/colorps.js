const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const colorpsSchema = new Schema({
    creator: { type: Schema.Types.ObjectId },
    colors: [{type: String}]
}, {timestamps: true})

const Colorps = mongoose.model("Colorps", colorpsSchema);
module.exports = Colorps;