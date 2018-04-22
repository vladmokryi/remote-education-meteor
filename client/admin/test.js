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
            questions: form.find('#questions .question-block').map(function (item) {
                let name = $(this).find('input.question').val().trim();
                return {name: name};
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
        questions.push({name: ''});
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
    'change input.question': function (e) {
        let id = parseInt(e.target.dataset.id);
        let questions = Session.get('testQuestions') || [];
        questions[id].name = e.target.value.trim();
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
    'submit #answers': function (e) {
        e.preventDefault();
        let answers = Session.get('answers');
        let valid = true;
        answers.forEach(function (item) {
            if (item == null) {
                valid = false;
            }
        });
        if (valid) {
            Meteor.call('createTestResult', Tests.findOne()._id, Meteor.userId(), answers, function (err) {
                    if (!err) {

                    } else {
                        console.log(err);
                    }
                }
            );
        } else {
            alert('Please set all answers!');
        }
    },
    'change .answer':function (e) {
        let id = e.target.dataset.id;
        let answers = Session.get('answers');
        answers[id] = event.target.value;
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
                {key: 'userId', label: 'Студент', fn: function (value, object, key) {
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
                {key: 'result', label: 'Результат', fn: function (value, object, key) {
                    if (value) {
                        return new Spacebars.SafeString("<span class='badge'>" + value + "</span>" + " / <span class='badge'>100</span>");
                    } else {
                        console.log(Router);
                        return new Spacebars.SafeString("<a href='/test/" + object.testId + "/" + object.userId  + "/check'>Перевірити</a>");
                    }
                }
                },
            ]
        };
    }
});

Template.checkTest.onRendered(function () {
    let questions = Tests.findOne().questions;
    let answers = [];
    for (let i = 0; i < questions.length; i++) {
        answers.push(null);
    }
    Session.set('answers', answers);
});

Template.checkTest.helpers({
    answer: function (index) {
        return TestResults.findOne().answers[index];
    },
    test: function () {
        return Tests.findOne();
    },
    testResult: function () {
        return TestResults.findOne();
    },
    activeAnswer: function (id) {
        let answers = Session.get('answers');
        return (answers && answers[id]) ? 'color: #00d200' : '';
    }
});

Template.checkTest.events({
   'click .set-valid': function (e) {
        let id = e.target.dataset.id;
       let answers = Session.get('answers');
       answers[id] = !answers[id];

       Session.set('answers', answers);
    },
    'click #checkComplete': function () {
        let questions = Tests.findOne().questions;
        let answers = Session.get('answers');
        let result = 0;
        answers.forEach(function (item, index) {
            if (item) {
                result++;
            }
        });
        if (questions.length) {
            result = ((result / questions.length) * 100).toFixed(0);
        } else {
            result = 0;
        }
        Meteor.call('updateTestResult', TestResults.findOne()._id, {result: result}, function (err) {
                if (!err) {

                } else {
                    console.log(err);
                }
            }
        )
    }
});