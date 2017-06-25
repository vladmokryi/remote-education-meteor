import { Mongo } from 'meteor/mongo';

export const Groups = new Mongo.Collection('groups');
export const Courses = new Mongo.Collection('courses');
export const Lectures = new Mongo.Collection('lectures');
export const Tests = new Mongo.Collection('tests');
export const TestResults = new Mongo.Collection('testresults');
let imageStore = new FS.Store.GridFS("files");
export const Files = new FS.Collection("files", {
    stores: [imageStore]
});
Files.allow({
    insert: function (userId, doc) {
        return true;
    },
    update: function (userId, doc) {
        return true;
    },
    remove: function (userId, doc) {
        return true;
    },
    download: function (userId, doc) {
        return true;
    }
});

Files.deny({
    insert: function(){
        return false;
    },
    update: function(){
        return false;
    },
    remove: function(){
        return false;
    },
    download: function(){
        return false;
    }
});