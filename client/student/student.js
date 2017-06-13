import {Template} from 'meteor/templating';
import { Groups, Courses } from '../../lib/collections';
import _ from 'lodash';

Template.studentEdit.helpers({
   groups: function () {
       return Groups.find().fetch();
   },
    user: function () {
        let id = Session.get('activeModalEntityId');
        if (id) {
            return Meteor.users.findOne({_id: id});
        } else {
            return null;
        }
    }
});

Template.studentEdit.onRendered(function () {
    let modal = $('#student-edit');
    let id = Session.get('activeModalEntityId');
    if (id) {
       let user = Meteor.users.findOne({_id: id});
       console.log(user);
       if (user) {
           let form = modal.find('form');
           form.find('#student-email').val(user.emails[0].address);
           form.find('#student-username').val(user.username);
           form.find('#student-password').val(user.password);
           form.find('#student-name').val(user.profile.name);
           //format
           form.find('#student-bday').val(user.profile.birthday ? moment(user.profile.birthday).format("YYYY-MM-DD") : null);
           form.find('#student-group').val(user.profile.groupId);
       }
    }
    modal.modal('show');
    modal.on('hidden.bs.modal', function () {
        Session.set('activeModal', null);
        Session.set('activeModalEntityId', null);
    });
});

Template.studentEdit.events({
    'submit #student-edit form': function (e) {
        e.preventDefault();
        let form = $(e.target);
        let data = {
            email: form.find('#student-email').val().trim(),
            username: form.find('#student-username').val().trim(),
            profile: {
                name: form.find('#student-name').val().trim(),
                birthday: new Date(form.find('#student-bday').val().trim()),
                groupId: form.find('#student-group').val(),
            }
        };
        let id = Session.get('activeModalEntityId');
        if (id) {
            let user = Meteor.users.findOne({_id: id});
            console.log(user);
            if (user) {
                data.id = id;
                Meteor.call('updateUser', data, function (err) {
                    if(!err) {
                        $('#student-edit').modal('hide');
                    } else {
                        console.log(err);
                    }
                });
            } else {
                data.password = form.find('#student-password').val().trim();
                data.roles = ['Student'];
                Meteor.call('createUserAccount', data, function (err, res) {
                    if(!err) {
                        data.id = res.id;
                        Meteor.call('setUserRole', data, function () {
                            $('#student-edit').modal('hide');
                        });

                    } else {
                        console.log(err);
                    }
                });
            }
        } else {
            data.password = form.find('#student-password').val().trim();
            data.roles = ['Student'];
            Meteor.call('createUserAccount', data, function (err, res) {
                if(!err) {
                    data.id = res.id;
                    Meteor.call('setUserRole', data, function () {
                        $('#student-edit').modal('hide');
                    });
                } else {
                    console.log(err);
                }
            });
        }
    }
});

Template.student.helpers({
    settings: function () {
        return {
            collection: Courses,
            rowsPerPage: 10,
            showFilter: true,
            fields: [
                {key: 'name', label: 'Course Name'},
                {key: 'start', label: 'Start', fn: function (value, object, key) {
                    let date = moment(value);
                    return new Spacebars.SafeString("<span>"+ (date.isValid() ? date.format("DD-MM-YYYY") : "None")+"</span>");
                }
                },
                {key: 'end', label: 'End', fn: function (value, object, key) {
                    let date = moment(value);
                    return new Spacebars.SafeString("<span>"+ (date.isValid() ? date.format("DD-MM-YYYY") : "None")+"</span>");
                }
                },
                {key: 'teachers', label: 'Teachers', fn: function (value, object, key) {
                    if (value) {
                        if (value.length) {
                            return new Spacebars.SafeString("<span>" + value.length + "</span>");
                        } else {
                            return new Spacebars.SafeString("<span>None</span>");
                        }
                    } else {
                        return new Spacebars.SafeString("<span>None</span>");
                    }
                }
                }
            ]
        };
    }
});

Template.student.events({
    'click tr': function (e) {
        Router.go('course', {_id: this._id})
    }
});