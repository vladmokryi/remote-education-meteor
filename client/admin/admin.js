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
                {key: 'name', label: 'Назва курса'},
                {key: 'group', label: 'Група', fn: function (value, object, key) {
                    console.log(arguments);
                    if (value) {
                        let group = Groups.findOne({_id: value});

                        if (group) {
                            return new Spacebars.SafeString("<span>" + group.name + "</span>");
                        } else {
                            return new Spacebars.SafeString("<span>None</span>");
                        }
                    }
                    }
                },
                {key: 'start', label: 'Початок', fn: function (value, object, key) {
                    let date = moment(value);
                    return new Spacebars.SafeString("<span>"+ (date.isValid() ? date.format("DD-MM-YYYY") : "None")+"</span>");
                }
                },
                {key: 'end', label: 'Кінець', fn: function (value, object, key) {
                    let date = moment(value);
                    return new Spacebars.SafeString("<span>"+ (date.isValid() ? date.format("DD-MM-YYYY") : "None")+"</span>");
                }
                },
                {key: 'teachers', label: 'Вчителі', fn: function (value, object, key) {
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
                {key: 'profile.name', label: 'ФІО'},
                {key: 'username', label: 'Користувач'},
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
                {key: 'name', label: 'Назва групи'},
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
                {key: 'profile.name', label: 'ФІО'},
                {key: 'profile.groupId', label: 'Група',
                    fn: function (value, object, key) {
                        //return new Spacebars.SafeString("<a href="+Routes.route['view'].path({_id:value})+">View</a>");
                        if (value) {
                            let group = Groups.findOne({_id: value});
                            return group ? group.name : 'none';
                        } else {
                            return 'none';
                        }
                    }
                },
                {key: 'username', label: 'Користувач'},
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
            if (confirm("Видалити студента?")) {
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
            if (confirm("Видалити курс?")) {
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
            if (confirm("Видалити групу?")) {
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
            if (confirm("Видалити вчителя?")) {
                Meteor.call('removeUser', this._id);
            }
        }
    }
});