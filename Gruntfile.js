/*
 * grunt-bower-version-check
 * https://github.com/anchann/grunt-bower-version-check
 *
 * Copyright (c) 2014 anchann
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    typescript: {
      base: {
        src: [
          "src/references.ts",
          "src/**/*.ts",
        ],
        dest: "tmp/tslib.js",
      }
    },

    concat: {
      dist: {
        src: [
          "src/imports.js",
          "tmp/tslib.js",
          "src/exports.js",
        ],
        dest: "tasks/bower_version_check.js"
      }
    },

    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    bower_version_check: {
      default_options: {
        options: {
        },
        files: {
          'tmp/default_options': ['test/fixtures/testing', 'test/fixtures/123']
        }
      },
      custom_options: {
        options: {
          separator: ': ',
          punctuation: ' !!!'
        },
        files: {
          'tmp/custom_options': ['test/fixtures/testing', 'test/fixtures/123']
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-typescript');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'bower_version_check', 'nodeunit']);

  grunt.registerTask('build', ['typescript', 'concat']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['build', 'jshint', 'test']);

};
