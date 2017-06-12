import { Groups } from '../../lib/collections';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.index.helpers({
    currentUserWithRole: function () {
        let user = Meteor.user();
        return !!(user && user.roles && user.roles.length);
    }
});