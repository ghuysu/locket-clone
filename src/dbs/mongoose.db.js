"use strict";

const mongoose = require("mongoose");
const { db } = require("../configs/app.config");

const connectionString = `mongodb+srv://${db.username}:${db.password}@cluster0.ibftatx.mongodb.net/${db.collection}?retryWrites=true&w=majority`;

class Database {
    constructor() {
        this.connect();
    }

    async connect() {
        try {
            mongoose.set('debug', true);
            mongoose.set('debug', { color: true });

            await mongoose.connect(connectionString);

            console.log("::Connected to MongoDB successfully");
        } catch (err) {
            console.error("::Error connecting to MongoDB:", err);
        }
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

module.exports = Database.getInstance();
