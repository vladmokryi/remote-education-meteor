import { Groups } from '../../lib/collections';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.index.helpers({
    currentUserWithRole: function () {
        let user = Meteor.user();
        return !!(user && user.roles && user.roles.length);
    }
});

Template.start.events({
    'submit #loginForm': function (e) {
        e.preventDefault();
        let form = $(e.target);
        let email = form.find('#email').val().trim();
        let password = form.find('#password').val().trim();
        Meteor.loginWithPassword(email, password, function (err) {
            debugger;
            if (!err) {
                Router.go('dashboard');
            }
        });
    }
});