import { Groups, Courses, Lectures, Files, Tests, TestResults } from '../lib/collections';
import _ from 'lodash';

Meteor.publish('groups', function () {
    return Groups.find();
});

Meteor.publish('admin.groups', function () {
    return Groups.find();
});
Meteor.publish('admin.courses', function () {
    return Courses.find();
});
Meteor.publish('admin.students', function () {
    return Meteor.users.find({roles: {$elemMatch: {$eq: "Student"}}});
});
Meteor.publish('admin.teachers', function () {
    return Meteor.users.find({roles: {$elemMatch: {$eq: "Teacher"}}});
});

Meteor.publish('teacher.courses', function (teacherId) {
    return Courses.find({teachers: {$elemMatch: { $eq: teacherId.toString()}}, end: {$gte: new Date()}});
});

Meteor.publish('student.courses', function (studentId) {
    let group = Meteor.users.findOne({_id: studentId}).profile.groupId;
    return Courses.find({group: group, end: {$gte: new Date()}});
});

Meteor.publish('courseById', function (id) {
    return Courses.find({_id: id});
});

Meteor.publish('courseLecturesById', function (id) {
    return Lectures.find({courseId: id});
});

Meteor.publish('files', function () {
   return Files.find();
});

Meteor.publish('student.group', function (studentId, groupId) {
    return Groups.findOne({_id: groupId});
});

Meteor.publish('testsByCourseId', function (id) {
   return Tests.find({courseId: id});
});

Meteor.publish('student.test', function (id) {
    return Tests.find({_id: id});
});

Meteor.publish('student.test.result', function (id, userId) {
    return TestResults.find({testId: id, userId: userId});
});

Meteor.publish('students.test.result', function (id) {
    return TestResults.find({testId: id});
});

Meteor.publish(null, function() {
    return Meteor.users.find({_id: this.userId}, {fields: {roles: 1}});
});
