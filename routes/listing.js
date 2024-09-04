const express=require("express");
const router=express.Router();
const wrapAsync=require("../utils/wrapasync.js");
const Listing= require('../models/listing.js');
const {validateListing,isLoggedIn,isOwner} = require("../middleware.js");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer( { storage } );

 
const listingController=require("../controllers/listings.js");

router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.createListing)
    );
    // .post(upload.single("listing[image]"),(req,res)=>{
    //     res.send(req.file);
    // });

//new route 
router.get("/new",isLoggedIn,listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(listingController.updateListing)
    )
    .delete(isLoggedIn,isOwner,wrapAsync(listingController.destroyListing)
    );

// edit route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));
 


module.exports=router;

// app.get("/testlisting",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"New villa",
//         description:"By the beach",
//         price:8000,
//         location:"Lucknow, UP",
//         country:"India",
//     })
//     await sampleListing.save();
//     console.log("sample saved");
//     res.send("successful testing");
// })