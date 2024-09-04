const { query } = require("express");
const Listing=require("../models/listing");
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken});

module.exports.index=async(req,res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs")
};

module.exports.showListing=async(req,res)=>{
    // let response=await geocodingClient.forwardGeocode({
    //     query: req.body.listing.location,
    //     limit:1,
    // })
    // .send();
    
    let {id}=req.params;
    const listing=await Listing.findById(id).populate({path:"reviews",populate:{
        path:"author",
    },
}).populate("owner");
    if(!listing){
        req.flash("error","Listing does not exist!");
        res.redirect("/listings");
    }
    // console.log(listing);
    res.render("listings/show.ejs",{listing});
};

module.exports.createListing = async(req,res,next)=>{
    // if(!req.body.listing){    one way for validation but very lengthy as reuire for every detail
    //     throw new ExpressError(400, "Send valid data for listing")
    // }
        // way1 
       //  let {title, description, image, price, country, location}=req.body;

       // way-2 making all variable(title,des,price etc.) in new.ejs an object field
       // let listing=req.body.listing;
    //    console.log(req.body);
    let response=await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit:1,
    })
    .send();
    
    
       let url=req.file.path;
       let filename=req.file.filename;
    //    console.log(url,"..",filename);
       const newListing=new Listing(req.body.listing);
       newListing.owner=req.user._id;
       newListing.image={url,filename};
       newListing.geometry=response.body.features[0].geometry;
       let saved=await newListing.save();
    //    console.log(saved);
       req.flash("success","New Listing created!");
       res.redirect("/listings");
};

module.exports.renderEditForm=async(req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing does not exist!");
        res.redirect("/listings");
    }
    // console.log(listing.image.url);
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/ar_1.0,c_fill,h_250");
    // console.log(originalImageUrl);
    res.render("listings/edit.ejs",{listing,originalImageUrl});
}

module.exports.updateListing=async(req,res)=>{ 
    let {id}=req.params;
    // let listing=await Listing.findById(id);
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file!=="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();
    }
    req.flash("success","Listing updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
    let {id}=req.params;
    let deleted=await Listing.findByIdAndDelete(id);
    // console.log(deleted);
    req.flash("success","Listing deleted!");
    res.redirect("/listings");
};