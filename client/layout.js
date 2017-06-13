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
        let user = Meteor.user();
        if (user && user.roles && user.roles.length) {
            return user.roles.indexOf("Admin") != -1;
        } else {
            return false;
        }
    },
    isTeacher: function () {
        let user = Meteor.user();
        if (user && user.roles && user.roles.length) {
            return user.roles.indexOf("Teacher") != -1;
        } else {
            return false;
        }
    },
    isStudent: function () {
        let user = Meteor.user();
        if (user && user.roles && user.roles.length) {
            return user.roles.indexOf("Student") != -1;
        } else {
            return false;
        }
    }
});

Template.layout.events({
   'click #logout': function () {
       Meteor.logout();
       Router.go('index');
   }
});