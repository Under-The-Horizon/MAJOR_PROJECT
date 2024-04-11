const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const wrapasync = require("./utils/wrapasync.js");
const expresserror = require("./utils/expresserror.js");
const { listingschema, reviewschema } = require("./schema.js");
const review = require("./models/review.js")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

app.engine("ejs", ejsmate);

const MONGO_URL = "mongodb://127.0.0.1:27017/wonderlust";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

main()
    .then(() => {
        console.log("Connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.get("/", (req, res) => {
    res.send("Hello! I am root!");
});

const validatelisting = (req, res, next) => {
    let { error } = listingschema.validate(req.body);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",")
        throw new expresserror(400, errmsg);
    } else {
        next();
    }
};

const validatereview = (req, res, next) => {
    let { error } = reviewschema.validate(req.body);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",")
        throw new expresserror(400, errmsg);
    } else {
        next();
    }
}

app.get("/listing", wrapasync(async (req, res) => {
    const allListing = await listing.find({});
    res.render("./listing/index.ejs", { allListing });
}));

app.get("/listing/new", (req, res) => {
    res.render("./listing/new.ejs");
});

app.get("/listing/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    const details = await listing.findById(id);
    console.log(details);
    res.render("./listing/show.ejs", { details });
}));

app.post("/listing", validatelisting, wrapasync(async (req, res, next) => {
    // if(!req.body.entry){
    //     throw new expresserror(404, "send valid data for listing");
    // }
    let result = listingschema.validate(req.body);
    console.log(result);
    let newlisting = new listing(req.body.entry);
    // if(!newlisting.description){
    //     throw new expresserror(400, "Description is missing");
    // }
    // if(!newlisting.title){
    //     throw new expresserror(400, "Title is missing");
    // }
    // if(!newlisting.location){
    //     throw new expresserror(400, "Location is missing");
    // }
    await newlisting.save();
    res.redirect("./listing");
}));

app.get("/listing/:id/edit", wrapasync(async (req, res) => {
    let { id } = req.params;
    const details = await listing.findById(id);
    res.render("./listing/edit.ejs", { details });
}));

app.put("/listing/:id", validatelisting, wrapasync(async (req, res) => {
    let { id } = req.params;
    await listing.findByIdAndUpdate(id, { ...req.body.entry });
    res.redirect("/listing");
}));

app.get("/testlisting", wrapasync(async (req, res) => {
    let samplelisting = new listing({
        title: "My new villa",
        description: "By me",
        price: 1200,
        location: "Kotdwara",
        country: "India"
    })

    await samplelisting.save()
    console.log("sample was saved");
    res.send("successful listing");
}));

app.delete("/listing/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    let deleted = await listing.findByIdAndDelete(id);
    res.redirect("/listing");
}));

app.post("/listing/:id/review", validatereview, wrapasync(async(req, res, next) => {
    const list = await listing.findById(req.params.id);
    const newReview = new review(req.body.review);
    console.log(newReview);
    list.review.push(newReview);
    await newReview.save();
    await list.save();
    console.log("New review saved");
    res.redirect(`/listing/${list._id}`);
}));


app.all("*", (req, res, next) => {
    next(new expresserror(404, "Page not found"));
});

app.use((err, req, res, next) => {
    let { status = 500, message = "Something went wrong" } = err;
    // res.status(status).send(message);
    res.render("errors.ejs", { err });
});

app.listen(8080, () => {
    console.log("app is listening to port 8080");
});