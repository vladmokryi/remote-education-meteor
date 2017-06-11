import { Template } from 'meteor/templating';

Meteor.startup(function () {
    sAlert.config({
        effect: 'slide',
        position: 'top-right',
        timeout: 5000,
        html: false,
        onRouteClose: true,
        stack: true,
        offset: 30
    });
});

Template.layout.helpers({
    activeModal: function () {
        return Session.get('activeModal');
    },
    isAdmin: function () {
        return Meteor.user().roles.indexOf("Admin") != -1;
    },
    isTeacher: function () {
        return Meteor.user().roles.indexOf("Teacher") != -1;
    },
    isStudent: function () {
        return Meteor.user().roles.indexOf("Student") != -1;
    }
});