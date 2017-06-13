import {Template} from 'meteor/templating';
import { Groups, Courses, Lectures, Files, Tests} from '../../lib/collections';
import _ from 'lodash';

Template.editCourse.helpers({
    groups: function () {
        return Groups.find();
    },
    teachers: function () {
        return Session.get('courseTeachers') || [];
    },
    teachersList: function () {
        return Meteor.users.find({roles : {$elemMatch: {$eq: "Teacher"}}});
    },
    selectedTeacher: function (value) {
        console.log(this, arguments);
        return this._id == value ? 'selected': '';
    }
});

Template.editCourse.onRendered(function () {
    let modal = $('#course-edit');
    let id = Session.get('activeModalEntityId');

    if (id) {
        let course = Courses.findOne({_id: id});
        console.log(course);
        if (course) {
            let form = modal.find('form');
            form.find('#name').val(course.name);
            form.find('#group').val(course.group || '');
            form.find('#start').val(course.start ? moment(course.start).format("YYYY-MM-DD") : null);
            form.find('#end').val(course.end ? moment(course.end).format("YYYY-MM-DD") : null);
            Session.set('courseTeachers', course.teachers || []);
            form.find('#teachers select').each(function () {
                console.log(arguments);
            });
            //set jq
        }
    }
    modal.modal('show');
    modal.on('hidden.bs.modal', function () {
        Session.set('activeModal', null);
        Session.set('activeModalEntityId', null);
        Session.set('courseTeachers', null);
    });
});

Template.editCourse.events({
    'submit #course-edit form': function (e) {
        e.preventDefault();
        let form = $(e.target);
        let data = {
            name: form.find('#name').val().trim(),
            group: form.find('#group').val().trim(),
            teachers: form.find('#teachers select').map(function (item) {
                return $(this).val().trim();
            }).toArray(),
            start: new Date(form.find('#start').val().trim()),
            end: new Date(form.find('#end').val().trim())
        };
        let id = Session.get('activeModalEntityId');
        if (id) {
            console.log(id);
            let course = Courses.find({_id: id});
            if (course) {
                data.id = id;
                Meteor.call('updateCourse', data, function (err) {
                    if(!err) {
                        $('#course-edit').modal('hide');
                    } else {
                        console.log(err);
                    }
                });
            } else {
                Meteor.call('createCourse', data, function (err, res) {
                    if(!err) {
                        $('#course-edit').modal('hide');
                    } else {
                        console.log(err);
                    }
                });
            }
        } else {
            Meteor.call('createCourse', data, function (err, res) {
                if(!err) {
                    $('#course-edit').modal('hide');
                } else {
                    console.log(err);
                }
            });
        }
    },
    'click #add-teacher': function () {
        let teachers = Session.get('courseTeachers') || [];
        teachers.push('');
        Session.set('courseTeachers', teachers);
    },
    'click .delete-teacher': function (e) {
        let id = e.target.dataset.id;
        let teachers = Session.get('courseTeachers') || [];
        if (teachers.indexOf(id) != -1) {
            teachers.splice(teachers.indexOf(id), 1);
            Session.set('courseTeachers', teachers);
        }
    }
});

Template.course.helpers({
    course: function () {
        return Courses.findOne();
    },
    period: function () {
        if (this.start && this.end) {
            return 'From ' +  moment(this.start).format("DD-MM-YYYY") + ' to ' + moment(this.end).format("DD-MM-YYYY");
        } else {
            return '';
        }
    },
    teachersList: function () {
        return Meteor.users.find({_id: {$in: this.teachers}});
    },
    lectures: function () {
        return Lectures.find();
    },
    files: function () {
        return Files.find();
    },
    courseFiles: function () {
        return Files.find({_id: {$in: this.files || []}});
    },
    lectureFiles: function () {
        return Files.find({_id: {$in: this.files || []}});
    },
    isTeacher: function () {
        let user = Meteor.user();
        if (user && user.roles && user.roles.length) {
            return user.roles.indexOf("Teacher") != -1;
        } else {
            return false;
        }
    },
    tests: function () {
        return Tests.find({lectureId: this._id});
    }
});

Template.course.events({
    'click #add-lecture': function () {
        Session.set('activeModal', 'editLecture');
    },
    'click .edit-lecture': function (e) {
        Session.set('activeModal', 'editLecture');
        console.log(e.target.dataset.id);
        Session.set('activeModalEntityId', e.target.dataset.id);
    },
    'click .delete-lecture': function (e) {
        if (confirm("Delete lecture?")) {
            Meteor.call('removeLecture', this._id);
        }
    },
    'click .edit-course-info': function () {
        Session.set('activeModal', 'editCourseInfo');
    },
    'change .course-file-input': function(event, template) {
        FS.Utility.eachFile(event, function (file) {
            Files.insert(file, function (err, fileObj) {
                if (err) {
                    console.log(err);
                } else {
                    // handle success depending what you need to do
                    Meteor.call('addFileToCourse', {id: Courses.findOne()._id, fileId: fileObj._id});
                }
            });
        });
        $('.course-file-input').val('');
    },
    'change .lecture-file-input': function(event, template) {
        FS.Utility.eachFile(event, function (file) {
            Files.insert(file, function (err, fileObj) {
                if (err) {
                    console.log(err);
                } else {
                    // handle success depending what you need to do
                    Meteor.call('addFileToLecture', {id: event.target.dataset.id, fileId: fileObj._id});
                }
            });
        });
        $('.lecture-file-input').val('');
    },
    'click .delete-file-course': function (event) {
        Meteor.call('removeFileFromCourse', {id: Courses.findOne()._id, fileId: event.target.dataset.id});
    },
    'click .delete-file-lecture': function (event) {
        Meteor.call('removeFileFromLecture', {id: event.target.dataset.lecture, fileId: event.target.dataset.id});
    }
});

Template.editLecture.helpers({
    lecture: function () {
        let id = Session.get('activeModalEntityId');
        if(id){
            return Lectures.findOne({_id: id});
        } else {
            return {};
        }
    },
    getFEContext: function () {
        let self = this;
        return {
            toolbarButtons: ['selectAll', 'clearFormatting', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertTable', 'insertHR', '|', 'print', 'html'],
            _value: self.description,
            "_onsave.before": function (e, editor) {
                let newHTML = editor.html.get(true);
                // Do something to update the edited value provided by the Froala-Editor plugin, if it has changed:
                if (!_.isEqual(newHTML, self.description)) {
                    console.log("onSave HTML is :"+newHTML);
                    // myCollection.update({_id: self.myDoc._id}, {
                    //     $set: {myHTMLField: newHTML}
                    // });
                }
                return false; // Stop Froala Editor from POSTing to the Save URL
            },
        }
    }
});

Template.editLecture.events({
    'submit #lecture-edit form': function (e) {
        e.preventDefault();
        let form = $(e.target);
        let data = {
            name: form.find('#name').val().trim(),
            description: form.find('div.froala-reactive-meteorized').froalaEditor('html.get', true),
        };
        let id = Session.get('activeModalEntityId');
        if (id) {
            console.log(id);
            let lecture = Lectures.find({_id: id});
            if (lecture) {
                data.id = id;
                Meteor.call('updateLecture', data, function (err) {
                    if(!err) {
                        $('#lecture-edit').modal('hide');
                    } else {
                        console.log(err);
                    }
                });
            } else {
                data.courseId = Courses.findOne()._id;
                Meteor.call('createLecture', data, function (err, res) {
                    if(!err) {
                        $('#lecture-edit').modal('hide');
                    } else {
                        console.log(err);
                    }
                });
            }
        } else {
            data.courseId = Courses.findOne()._id;
            Meteor.call('createLecture', data, function (err, res) {
                if(!err) {
                    $('#lecture-edit').modal('hide');
                } else {
                    console.log(err);
                }
            });
        }
    },
});

Template.editLecture.onRendered(function () {
    let modal = $('#lecture-edit');
    let id = Session.get('activeModalEntityId');

    modal.modal('show');
    modal.on('hidden.bs.modal', function () {
        Session.set('activeModal', null);
        Session.set('activeModalEntityId', null);
        Session.set('courseTeachers', null);
    });
});

Template.editCourseInfo.onRendered(function () {
    let modal = $('#course-edit-info');
    let id = Session.get('activeModalEntityId');

    modal.modal('show');
    modal.on('hidden.bs.modal', function () {
        Session.set('activeModal', null);
        Session.set('activeModalEntityId', null);
        Session.set('courseTeachers', null);
    });
});

Template.editCourseInfo.events({
    'submit #course-edit-info form': function (e) {
        e.preventDefault();
        let form = $(e.target);
        let data = {
            id: Courses.findOne()._id,
            description: form.find('div.froala-reactive-meteorized').froalaEditor('html.get', true),
        };
        Meteor.call('updateCourseInfo', data, function (err) {
            if(!err) {
                $('#course-edit-info').modal('hide');
            } else {
                console.log(err);
            }
        });
    },
});

Template.editCourseInfo.helpers({
   course: function () {
       return Courses.findOne();
   },
    getFEContext: function () {
        let self = this;
        return {
            toolbarButtons: ['selectAll', 'clearFormatting', 'undo', 'redo', '|', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', '|', 'fontFamily', 'fontSize', 'color', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', 'quote', '-', 'insertLink', 'insertImage', 'insertTable', 'insertHR', '|', 'print', 'html'],
            _value: self.description,
            "_onsave.before": function (e, editor) {
                let newHTML = editor.html.get(true);
                // Do something to update the edited value provided by the Froala-Editor plugin, if it has changed:
                if (!_.isEqual(newHTML, self.description)) {
                    console.log("onSave HTML is :"+newHTML);
                    // myCollection.update({_id: self.myDoc._id}, {
                    //     $set: {myHTMLField: newHTML}
                    // });
                }
                return false; // Stop Froala Editor from POSTing to the Save URL
            },
        }
    }
});