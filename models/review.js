const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const reviewschema= new Schema({
    comment: String,
    rating:{
        type: Number,
        min: 1,
        max: 10,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model("review", reviewschema);