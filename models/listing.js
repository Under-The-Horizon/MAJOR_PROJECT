const mongoose=require("mongoose");
const Schema= mongoose.Schema;

const listingschema=new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    location: String,
    Image: {
        type: String,
        default: "https://unsplash.com/photos/a-house-with-a-thatched-roof-surrounded-by-palm-trees-lLagCQbDuZI",
        set: (v)=> v===""?"https://unsplash.com/photos/a-house-with-a-thatched-roof-surrounded-by-palm-trees-lLagCQbDuZI": v,
    },
    price: Number,
    country:String,
    review:[
    ],
});

const listing= mongoose.model("listing", listingschema);

module.exports=listing;