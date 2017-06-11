import {Template} from 'meteor/templating';
import { Groups, Courses } from '../../lib/collections';
import _ from 'lodash';

Template.groupEdit.helpers({
    group: function () {
        let id = Session.get('activeModalEntityId');
        if (id) {
            return Groups.findOne({_id: id});
        } else {
            return null;
        }
    }
});

Template.groupEdit.onRendered(function () {
    let modal = $('#group-edit');
    let id = Session.get('activeModalEntityId');
    if (id) {
        let group = Groups.findOne({_id: id});
        console.log(group);
        if (group) {
            let form = modal.find('form');
            form.find('#name').val(group.name);
        }
    }
    modal.modal('show');
    modal.on('hidden.bs.modal', function () {
        Session.set('activeModal', null);
        Session.set('activeModalEntityId', null);
    });
});

Template.groupEdit.events({
    'submit #group-edit form': function (e) {
        e.preventDefault();
        let form = $(e.target);
        let data = {
            name: form.find('#name').val().trim()
        };
        let id = Session.get('activeModalEntityId');
        if (id) {
            let group = Groups.findOne({_id: id});
            console.log(group);
            if (group) {
                data.id = id;
                Meteor.call('updateGroup', data, function (err) {
                    if(!err) {
                        $('#group-edit').modal('hide');
                    } else {
                        console.log(err);
                    }
                });
            } else {
                Meteor.call('createGroup', data, function (err, res) {
                    if(!err) {
                            $('#group-edit').modal('hide');
                    } else {
                        console.log(err);
                    }
                });
            }
        } else {
            Meteor.call('createGroup', data, function (err, res) {
                if(!err) {
                    $('#group-edit').modal('hide');
                } else {
                    console.log(err);
                }
            });
        }
    }
});