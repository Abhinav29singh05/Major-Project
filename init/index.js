require('dotenv').config({ path: '../.env' });
const mongoose=require("mongoose");
const initData=require("./data.js");
const { query } = require("express");
const Listing= require("../models/listing.js");
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient=mbxGeocoding({accessToken:mapToken});

async function getCoordinates(address) {
    try {
        const response = await geocodingClient.forwardGeocode({
            query: address,
            limit: 1
        }).send();

        const match = response.body.features[0];
        if (match) {
            return match.geometry.coordinates; // [lng, lat]
        } else {
            throw new Error('Address not found');
        }
    } catch (error) {
        console.error('Error getting coordinates:', error);
        return null;
    }
}

async function initDB() {
    try {
        await Listing.deleteMany({});

        const updatedData = await Promise.all(initData.data.map(async (obj) => {
            const coordinates = await getCoordinates(obj.location); // Assuming 'location' contains address
            return {
                ...obj,
                owner: "667eee16794f80f435f851cc", // Ensure this ObjectId is valid
                geometry: coordinates ? {
                    type: "Point",
                    coordinates
                } : null
            };
        }));

        await Listing.insertMany(updatedData);
        console.log("Data initialized");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
}

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
        console.log("Connected to db");
        await initDB();
    } catch (err) {
        console.error("Database connection error:", err);
    }
}

main();