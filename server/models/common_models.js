import mongoose from 'mongoose';


export const Cordinates = new mongoose.Schema({
    lat: { type: Number, default: null },
    lon: { type: Number, default: null }
});