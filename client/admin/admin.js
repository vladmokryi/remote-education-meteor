import { Groups, Courses } from '../../lib/collections';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

Template.index.helpers({
    groups: function () {
        return Groups.find().fetch().length;
    }
});

Template.adminStudents.onCreated(function () {
    this.filter = new ReactiveTable.Filter("userRole", ["roles"]);
    this.filter.set({$elemMatch: {$eq: "Student"}});
});

Template.adminTeachers.onCreated(function () {
    this.filter = new ReactiveTable.Filter("userRole", ["roles"]);
    this.filter.set({$elemMatch: {$eq: "Teacher"}});
});

Template.adminCourses.helpers({
    settings: function () {
        return {
            collection: Courses,
            rowsPerPage: 10,
            showFilter: true,
            fields: [
                {key: 'name', label: 'Course Name'},
                {key: 'group', label: 'Group', fn: function (value, object, key) {
                    console.log(arguments);
                    if (value) {
                        let group = Groups.findOne({_id: new Mongo.ObjectID(value)});

                        if (group) {
                            return new Spacebars.SafeString("<span>" + group.name + "</span>");
                        } else {
                            return new Spacebars.SafeString("<span>None</span>");
                        }
                    }
                    }
                },
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
                            let teachers = Meteor.users.find({_id: {$in: value}}).fetch();
                            if (teachers.length) {
                                let str = _.map(teachers, function (item) {
                                    return item.profile.name;
                                }).join(', ');
                                return new Spacebars.SafeString("<span>" + str + "</span>");
                            } else {
                                return new Spacebars.SafeString("<span>None</span>");
                            }
                        } else {
                            return new Spacebars.SafeString("<span>None</span>");
                        }

                    }
                },
                {
                    key: 'edit', headerClass: 'text-right', label: '', fn: function (value, object, key) {
                    return new Spacebars.SafeString("<div class='text-right'><span class='glyphicon cursor-pointer glyphicon-pencil edit-item'></span><span class='glyphicon glyphicon-remove remove-item cursor-pointer'></span></div>");
                }
                }]
        };
    }
});
Template.adminTeachers.helpers({
    settings: function () {
        return {
            collection: Meteor.users,
            rowsPerPage: 10,
            showFilter: true,
            filters: ['userRole'],
            fields: [
                {key: 'profile.name', label: 'Full Name'},
                {key: 'username', label: 'Username'},
                {key: 'emails.0.address', label: 'Email'},
                {key: 'edit', headerClass: 'text-right', label: '', fn: function (value, object, key) {
                    //add route param
                    return new Spacebars.SafeString("<div class='text-right'><span class='glyphicon cursor-pointer glyphicon-pencil edit-item'></span><span class='glyphicon glyphicon-remove remove-item cursor-pointer'></span></div>");
                }}
            ]
        };
    }
});
Template.adminGroups.helpers({
    settings: function () {
        return {
            collection: Groups,
            rowsPerPage: 10,
            showFilter: true,
            fields: [
                {key: 'name', label: 'Group Name'},
                {
                    key: 'edit', headerClass: 'text-right', label: '', fn: function (value, object, key) {
                        //add route param
                        return new Spacebars.SafeString("<div class='text-right'><span class='glyphicon cursor-pointer glyphicon-pencil edit-item'></span><span class='glyphicon glyphicon-remove remove-item cursor-pointer'></span></div>");
                    }
                }]
        };
    }
});
Template.adminStudents.helpers({
    settings: function () {
        return {
            collection: Meteor.users,
            rowsPerPage: 10,
            showFilter: true,
            filters: ['userRole'],
            fields: [
                {key: 'profile.name', label: 'Full Name'},
                {key: 'profile.groupId', label: 'Group',
                    fn: function (value, object, key) {
                        //return new Spacebars.SafeString("<a href="+Routes.route['view'].path({_id:value})+">View</a>");
                        if (value) {
                            let group = Groups.findOne({_id: new Mongo.ObjectID(value)});
                            return group ? group.name : 'none';
                        } else {
                            return 'none';
                        }
                    }
                },
                {key: 'username', label: 'Username'},
                {key: 'emails.0.address', label: 'Email'},
                {key: 'edit', headerClass: 'text-right', label: '', fn: function (value, object, key) {
                    //add route param
                    return new Spacebars.SafeString("<div class='text-right'><span class='glyphicon cursor-pointer glyphicon-pencil edit-item'></span><span class='glyphicon glyphicon-remove remove-item cursor-pointer'></span></div>");
                }}
            ]
        };
    }
});

Template.adminStudents.events({
    'click #add-item': function () {
        Session.set('activeModal', 'studentEdit');
    },
    'click tr': function (e) {
        console.log(e);
        if ($(e.target).hasClass('edit-item')) {
            Session.set('activeModal', 'studentEdit');
            Session.set('activeModalEntityId', this._id);
            console.log(this);
        } else if ($(e.target).hasClass('remove-item')) {
            if (confirm("Delete student?")) {
                Meteor.call('removeUser', this._id);
            }
        }
    }
});

Template.adminCourses.events({
    'click #add-item': function () {
        Session.set('activeModal', 'editCourse');
    },
    'click tr': function (e) {
        if ($(e.target).hasClass('edit-item')) {
            Session.set('activeModal', 'editCourse');
            Session.set('activeModalEntityId', this._id);
            console.log(this);
        } else if ($(e.target).hasClass('remove-item')) {
            if (confirm("Delete course?")) {
                Meteor.call('removeCourse', this._id);
            }
        }
    }
});

Template.adminGroups.events({
    'click #add-item': function () {
        Session.set('activeModal', 'groupEdit');
    },
    'click tr': function (e) {
        if ($(e.target).hasClass('edit-item')) {
            Session.set('activeModal', 'groupEdit');
            Session.set('activeModalEntityId', this._id);
            console.log(this);
        } else if ($(e.target).hasClass('remove-item')) {
            if (confirm("Delete group?")) {
                Meteor.call('removeGroup', this._id);
            }
        }
    }
});

Template.adminTeachers.events({
    'click #add-item': function () {
        Session.set('activeModal', 'teacherEdit');
    },
    'click tr': function (e) {
        if ($(e.target).hasClass('edit-item')) {
            Session.set('activeModal', 'teacherEdit');
            Session.set('activeModalEntityId', this._id);
            console.log(this);
        } else if ($(e.target).hasClass('remove-item')) {
            if (confirm("Delete teacher?")) {
                Meteor.call('removeUser', this._id);
            }
        }
    }
});