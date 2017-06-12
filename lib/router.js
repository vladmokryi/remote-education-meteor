//import {Router} from "iron";

Router.configure({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    notFoundTemplate: 'pageNotFound'
});

let checkUser = function () {
    if (!Meteor.userId()) {
        Router.go('index');
    }
};

Router.map(function() {
    this.route('dashboard', {
        path: '/dashboard',
        onBeforeAction: function () {
            if (!Meteor.userId()) {
                // if the user is not logged in, render the Login template
                this.redirect('index');
            } else {
                let user = Meteor.user();
                if (user && user.roles && user.roles.length) {
                    if (Meteor.user().roles.indexOf("Admin") != -1) {
                        this.redirect('admin');
                    } else if (Meteor.user().roles.indexOf("Teacher") != -1) {
                        this.redirect('teacher');
                    } else if (Meteor.user().roles.indexOf("Student") != -1) {
                        this.redirect('student');
                    }
                } else {
                    this.redirect('index');
                }
            }
        }
    });


    this.route('index', {
        path: '/',
        waitOn: function () {
            console.log('subscribe');
            return Meteor.subscribe('groups');
        }
    });
    let beforeActionAdmin = function () {
        if (!Meteor.userId()) {
            // if the user is not logged in, render the Login template
            this.redirect('index');
        } else {
            let user = Meteor.user();
            if (user && user.roles && user.roles.length) {
                if (Meteor.user().roles.indexOf("Admin") != -1) {
                    this.next();
                } else if (Meteor.user().roles.indexOf("Teacher") != -1) {
                    this.redirect('teacher');
                } else if (Meteor.user().roles.indexOf("Student") != -1) {
                    this.redirect('student');
                }
            } else {
                this.redirect('index');
            }
        }
    };

    let beforeActionStudent = function () {
        if (!Meteor.userId()) {
            // if the user is not logged in, render the Login template
            this.redirect('index');
        } else {
            let user = Meteor.user();
            if (user && user.roles && user.roles.length) {
                if (Meteor.user().roles.indexOf("Admin") != -1 && Meteor.user().roles.indexOf("Student") != -1) {
                    this.next();
                } else if (Meteor.user().roles.indexOf("Teacher") != -1) {
                    this.redirect('teacher');
                } else if (Meteor.user().roles.indexOf("Student") != -1) {

                    this.next();
                } else {
                    this.redirect('index');
                }
            } else {
                this.redirect('index');
            }
        }
    };

    let beforeActionUser = function () {
        if (!Meteor.userId()) {
            // if the user is not logged in, render the Login template
            this.redirect('index');
        } else {
            let user = Meteor.user();
            if (user && user.roles && user.roles.length) {
                this.next();
            } else {
                this.redirect('index');
            }
        }
    };

    let beforeActionTeacher = function () {
        if (!Meteor.userId()) {
            // if the user is not logged in, render the Login template
            this.redirect('index');
        } else {
            let user = Meteor.user();
            if (user && user.roles && user.roles.length) {
                if (Meteor.user().roles.indexOf("Admin") != -1 && Meteor.user().roles.indexOf("Teacher") != -1) {
                    this.next();
                } else if (Meteor.user().roles.indexOf("Teacher") != -1) {
                    this.next();
                } else if (Meteor.user().roles.indexOf("Student") != -1) {
                    this.redirect('student');
                } else {
                    this.redirect('index');
                }
            } else {
                this.redirect('index');
            }
        }
    };

    this.route('admin', {
            path: '/admin',
            waitOn: function () {
                console.log('subscribe');
                return Meteor.subscribe('groups');
            },
            onBeforeAction: beforeActionAdmin
        });

    this.route('admin.groups', {
        path: '/admin/groups',
        waitOn: function () {
            console.log('subscribe');
            return Meteor.subscribe('admin.groups');
        },
        onBeforeAction: beforeActionAdmin
    });

    this.route('admin.courses', {
        path: '/admin/courses',
        waitOn: function () {
            console.log('subscribe');
            return [Meteor.subscribe('admin.courses') , Meteor.subscribe('admin.groups'), Meteor.subscribe('admin.teachers')];
        },
        onBeforeAction: beforeActionAdmin
    });

    this.route('admin.students', {
        path: '/admin/students',
        waitOn: function () {
            console.log('subscribe');
            return [Meteor.subscribe('admin.students'), Meteor.subscribe('admin.groups')];
        },
        onBeforeAction: beforeActionAdmin
    });

    this.route('admin.teachers', {
        path: '/admin/teachers',
        waitOn: function () {
            console.log('subscribe');
            return Meteor.subscribe('admin.teachers');
        },
        onBeforeAction: beforeActionAdmin
    });

    this.route('teacher', {
        path: '/teacher',
        waitOn: function () {
            console.log('subscribe');
            return Meteor.subscribe('teacher.courses', Meteor.userId());
        },
        onBeforeAction: beforeActionTeacher
    });

    this.route('student', {
        path: '/student',
        waitOn: function () {
            console.log('subscribe');
            return Meteor.subscribe('student.courses', Meteor.userId());
        },
        onBeforeAction: beforeActionStudent
    });

    this.route('course', {
        path: '/course/:_id',
        waitOn: function () {
            console.log('subscribe');
            return [
                Meteor.subscribe('courseById', this.params._id),
                Meteor.subscribe('courseLecturesById', this.params._id),
                Meteor.subscribe('admin.groups'),
                Meteor.subscribe('admin.teachers'),
                Meteor.subscribe('files'),
                Meteor.subscribe('admin.students'),
                Meteor.subscribe('testsByCourseId', this.params._id)
                ];
        },
        onBeforeAction: beforeActionUser
    });
});

Router.onBeforeAction('loading');