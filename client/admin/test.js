import {Template} from 'meteor/templating';
import {Groups, Courses, Lectures, Files, Tests, TestResults} from '../../lib/collections';
import _ from 'lodash';

Template.editTest.helpers({
    file: function () {
        return Files.findOne();
    },
    questions: function () {
        return Session.get('testQuestions') || [];
    },
    test: function () {
        let id = Session.get('activeModalEntityId');
        if (id) {
            return Tests.findOne({_id: id});
        } else {
            return {};
        }
    },
    validVariant: function (variant, valid) {
        return variant == valid ? 'btn-success' : 'btn-default';
    }
});

Template.editTest.onRendered(function () {
    let modal = $('#test-edit');
    let id = Session.get('activeModalEntityId');

    if (id) {
        let test = Tests.findOne({_id: id});
        console.log(test);
        if (test) {
            Session.set('testQuestions', test.questions || []);
        }
    }
    modal.modal('show');
    modal.on('hidden.bs.modal', function () {
        Session.set('activeModal', null);
        Session.set('activeModalEntityId', null);
        Session.set('activeModalLectureId', null);
        Session.set('testQuestions', null);
    });
});

Template.editTest.events({
    'submit #test-edit form': function (e) {
        e.preventDefault();
        let form = $(e.target);
        let data = {
            name: form.find('#name').val().trim(),
            video: form.find('#video').val().trim(),
            questions: form.find('#questions .question-block').map(function (item) {
                let name = $(this).find('input.question').val().trim();
                let variants = $(this).find('input.variant').map(function () {
                    return $(this).val().trim();
                }).toArray();
                let validIndex = null;
                $(this).find('.variant-block .set-valid').map(function () {
                    if ($(this).hasClass('btn-success')) {
                        validIndex = $(this).data().id;
                    }
                    return this;
                });
                return {name: name, variants: variants, validIndex: validIndex};
            }).toArray()
        };
        let id = Session.get('activeModalEntityId');
        if (id) {
            console.log(id);
            let test = Tests.find({_id: id});
            if (test) {
                data.id = id;
                Meteor.call('updateTest', data, function (err) {
                    if (!err) {
                        $('#test-edit').modal('hide');
                    } else {
                        console.log(err);
                    }
                });
            } else {
                data.lectureId = Session.get('activeModalLectureId');
                data.courseId = Courses.findOne()._id;
                debugger;
                Meteor.call('createTest', data, function (err, res) {
                    if (!err) {
                        $('#test-edit').modal('hide');
                    } else {
                        console.log(err);
                    }
                });
            }
        } else {
            data.lectureId = Session.get('activeModalLectureId');
            data.courseId = Courses.findOne()._id;
            Meteor.call('createTest', data, function (err, res) {
                if (!err) {
                    $('#test-edit').modal('hide');
                } else {
                    console.log(err);
                }
            });
        }
    },
    'click #add-question': function () {
        let questions = Session.get('testQuestions') || [];
        questions.push({name: '', variants: [], validIndex: null});
        Session.set('testQuestions', questions);
    },
    'click .delete-question': function (e) {
        let id = e.target.dataset.id;
        let questions = Session.get('testQuestions') || [];
        if (questions[id] != undefined) {
            questions.splice(id, 1);
            Session.set('testQuestions', questions);
        }
    },
    'click #add-variant': function (e) {
        let id = parseInt(e.target.dataset.id);
        let questions = Session.get('testQuestions') || [];
        if (questions[id] != undefined) {
            questions[id].variants.push('');
            Session.set('testQuestions', questions);
        }
    },
    'click .delete-variant': function (e) {
        let id = parseInt(e.target.dataset.id);
        let question = parseInt(e.target.dataset.question);
        let questions = Session.get('testQuestions') || [];
        if (questions[question] != undefined && questions[question].variants[id] != undefined) {
            questions[question].variants.splice(id, 1);
            Session.set('testQuestions', questions);
        }
    },
    'change input.question': function (e) {
        let id = parseInt(e.target.dataset.id);
        let questions = Session.get('testQuestions') || [];
        questions[id].name = e.target.value.trim();
        Session.set('testQuestions', questions);
    },
    'change input.variant': function (e) {
        let id = parseInt(e.target.dataset.id);
        let question = parseInt(e.target.dataset.question);
        let questions = Session.get('testQuestions') || [];
        questions[question].variants[id] = e.target.value.trim();
        Session.set('testQuestions', questions);
    },
    'click .set-valid': function (e) {
        let id = parseInt(e.currentTarget.dataset.id);
        let question = parseInt(e.currentTarget.dataset.question);
        let questions = Session.get('testQuestions') || [];
        questions[question].validIndex = id;
        Session.set('testQuestions', questions);
    }
});

Template.test.onRendered(function () {
    let questions = Tests.findOne().questions;
    let answers = [];
    for (let i = 0; i < questions.length; i++) {
        answers.push(null);
    }
    Session.set('answers', answers);
});

Template.test.helpers({
    test: function () {
        return Tests.findOne();
    },
    testResult: function () {
        return TestResults.findOne();
    },
    isAnswer: function (id, question) {
        let answers = Session.get('answers');
        console.log(answers, answers[question], id, question);
        return answers[question] == id ? 'color: #00d200' : '';
    }
});

Template.test.events({
    'click #start-test': function () {
        Meteor.call('createTestResult', Tests.findOne()._id, Meteor.userId(), function (err) {
                if (!err) {

                } else {
                    console.log(err);
                }
            }
        )
    },
    'click #video-done': function (e) {
        let id = e.target.dataset.id;
        Meteor.call('updateTestResult', id, {step1: false, step2: true}, function (err) {
                if (!err) {

                } else {
                    console.log(err);
                }
            }
        )
    },
    'click #test-done': function (e) {
        let answers = Session.get('answers');
        let valid = true;
        answers.forEach(function (item) {
            if (item == null) {
                valid = false;
            }
        });
        if (valid) {
            let questions = Tests.findOne().questions;
            let result = 0;
            questions.forEach(function (item, index) {
                if (item.validIndex === answers[index]) {
                    result++;
                }
            });
            if (questions.length) {
                result = ((result / questions.length) * 100).toFixed(0);
            } else {
                result = 0;
            }
            let id = e.target.dataset.id;
            Meteor.call('updateTestResult', id, {step1: false, step2: false, step3: true, result: result}, function (err) {
                    if (!err) {

                    } else {
                        console.log(err);
                    }
                }
            )
        } else {
            alert('Please set all answers!');
        }

    },
    'click .set-answer': function (e) {
        let id = parseInt(e.currentTarget.dataset.id);
        let question = parseInt(e.currentTarget.dataset.question);
        let answers = Session.get('answers');
        answers[question] = id;
        Session.set('answers', answers);
    }
});

Template.testResults.helpers({
    settings: function () {
        return {
            collection: TestResults,
            rowsPerPage: 10,
            showFilter: true,
            fields: [
                {key: 'userId', label: 'Student', fn: function (value, object, key) {
                    if (value) {
                        let user = Meteor.users.findOne({_id: value});

                        if (user) {
                            return new Spacebars.SafeString("<span>" + user.profile.name + "</span>");
                        } else {
                            return '';
                        }
                    }
                }
                },
                {key: 'result', label: 'Result', fn: function (value, object, key) {
                    return new Spacebars.SafeString("<span class='badge'>"+ value +"</span>" + " / <span class='badge'>100</span>");
                }
                },
               ]
        };
    }
});