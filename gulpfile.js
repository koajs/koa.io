/*!
 * koa.io - gulpfile.js
 * Copyright(c) 2015 Ari Porad <ari@ariporad.com>
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 */

var gulp = require('gulp');
var plugins = require('load-plugins')('gulp-*');

var SRC_JS = ['lib/**/*.js'];
var TESTS = ['test/**/*.test.js'];
var JS_OTHER = ['test/**/*.js', '!test/**/*.test.js'];

gulp.task('lint', function lint() {
  return gulp.src(SRC_JS.concat(TESTS))
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format())
    .pipe(plugins.eslint.failAfterError());
});

function test() {
  return gulp.src(TESTS)
    .pipe(plugins.mocha());
}

gulp.task('test', ['lint'], function testTask() {
  // We need this because gulp-mocha won't exit if any connections are left open. We close all of ours (I think), so I blame socket.io
  return test()
    .pipe(plugins.exit());
});

gulp.task('test-cov', ['lint'], function testcov(cb) {
  gulp.src(SRC_JS)
    .pipe(plugins.istanbul()) // Covering files
    .pipe(plugins.istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      test()
        .pipe(plugins.istanbul.writeReports()) // Creating the reports after tests ran
        .pipe(plugins.istanbul.enforceThresholds({thresholds: {global: 75}})) // Min CC
        .on('end', function uploadCoverage(err) {
          if (err) {
            console.log(err.message);
            console.log(err.stack);
            process.exit(1);
          }
          console.log('Uploading to Coveralls');
          gulp.src('coverage/**/lcov.info')
            .pipe(plugins.debug({title: 'in: '}))
            .pipe(plugins.coveralls())
            .pipe(plugins.debug({title: 'out: '}))
            .on('error', function ignoreNoProjectFoundErrors(err) {
              console.log('Error Found:', err);
              if (err.message.indexOf('find') > -1 &&
                err.message.indexOf('repo') > -1) {
                console.log(
                  'Hey, it looks like you haven\'t setup coveralls yet, or you\'re not ' +
                  'on Travis! No problem, but I\'m not going to upload code coverage.'
                );
                // See above comment, but we need this due to gulp-mocha and socket.io
                process.exit();
              } else {
                console.log('Error Uploading to Coveralls:');
                process.nextTick(function () {
                  process.exit(1);
                });
                throw err;
              }
            })
            // See above comment, but we need this due to gulp-mocha and socket.io
            .on('end', function kill() {
              console.log('Uploaded to Coveralls');
              process.exit();
            })
            .on('finish', function log() {
              console.log('finished');
            })
        });
    });
});

gulp.task('watch', function watch() {
  gulp.watch(SRC_JS, ['test']);
});
