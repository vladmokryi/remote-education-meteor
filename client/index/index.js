import { Groups } from '../../lib/collections';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.index.helpers({
    groups: function () {
        return Groups.find().fetch().length;
    }
});