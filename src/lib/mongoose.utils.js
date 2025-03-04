/**
 * Created by charnjeetelectrovese@gmail.com on 12/18/2017.
 */
import mongoose from 'mongoose';
import { logg } from '../utils/logger.js';
import { isTypedArray } from 'util/types';

export function mongoOne(arr) {
    if (!Array.isArray(arr)) return arr;
    if (arr.length > 0) {
        return arr[0];
    }
    return null;
}


export function mObj(id) {
    if (!id) return null;
    if (mongoose.Types.ObjectId.isValid(id)) return id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);
    return null;
}


export function mString(id) {
    return id ? id.toString() : '';
}

export function mEq(id1, id2) {
    if (id1 && id2) {
        return id1.toString() === id2.toString();
    } return false;
}


export function mObjectFromArray(array, idKey = '_id') {
    const obj = {};
    if (array && Array.isArray(array)) {
        array.forEach((dT) => {
            obj[dT[idKey]] = dT;
        });
    } return obj;
}

export function mongoValid(id) {
    return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Wraps a function inside a MongoDB transaction.
 * @param {Function} callback - Function to execute inside a transaction.
 * @returns {Promise<any>} - Returns the result of the callback function.
 */
export const withTransaction = async (callback) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Execute the function and pass the session
        const result = await callback(session);

        // Commit the transaction if successful
        await session.commitTransaction();
        session.endSession();
        return result;
    } catch (error) {
        logg('****************************** withTransaction error ******************************');
        await session.abortTransaction();
        session.endSession();
        throw error; // Rethrow error to be handled by the caller
    }
};

