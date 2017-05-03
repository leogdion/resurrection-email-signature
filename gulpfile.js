var gulp = require('gulp');
var jscs = require('gulp-jscs');
//Var bump = require('gulp-bump');
var beautify = require('gulp-beautify');
var jshint = require('gulp-jshint'),
  browserify = require('browserify'),
  transform = require('vinyl-transform');
var babel = require('babelify');
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');
//Var util = require('gulp-util');
//var mocha = require('gulp-mocha');
//var istanbul = require('gulp-istanbul');
//var bump = require('gulp-bump');

//var async = require('async');
//var yaml = require('js-yaml');
//var fs = require('fs-extra');
var handlebars = require('gulp-handlebars');
var wrap = require('gulp-wrap');
var declare = require('gulp-declare');
var concat = require('gulp-concat');

gulp.task('templates', function() {
  return gulp.src('./static/templates/*.hbs')
    .pipe(handlebars({
      handlebars: require('handlebars'),
    }))
    .pipe(wrap('Handlebars.template(<%= contents %>)'))
    // Declare template functions as properties and sub-properties of exports
    .pipe(declare({
      root: 'exports',
      noRedeclare: true, // Avoid duplicate declarations
      processName: function(filePath) {
        // Allow nesting based on path using gulp-declare's processNameByPath()
        // You can remove this option completely if you aren't using nested folders
        // Drop the templates/ folder from the namespace path by removing it from the filePath
        return declare.processNameByPath(filePath.replace('static/templates/', ''));
      },
    }))
    // Concatenate down to a single file
    .pipe(concat('templates.js'))
    // Add the Handlebars module in the final output
    .pipe(wrap('var Handlebars = require("handlebars");\n <%= contents %>'))
    // WRite the output into the templates folder
    .pipe(gulp.dest('.tmp/'));
});

var ghPages = require('gulp-gh-pages');

function compile(watch) {

  var bundler = browserify('./static/js/main.js', {
    debug: true,
  }).transform(babel);

  function rebundle() {
    return bundler.bundle()
      .on('error', function(err) {
        console.error(err);
        this.emit('end');
      })
      .pipe(source('main.js'))
      //.pipe(buffer())
      //.pipe(sourcemaps.init({ loadMaps: true }))
      //.pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./public/js'));
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  return rebundle();
}

var jsSrc = ['./*.js', 'lib/**/*.js'];

gulp.task('jscs', function() {
  return gulp.src(jsSrc, {
    base: '.',
  }).pipe(jscs({
    fix: true,
  })).pipe(gulp.dest('.'));
});

// Gulp.task('bump', function() {
//   return gulp.src(['./package.json']).pipe(bump({
//     type: 'patch',
//   })).pipe(gulp.dest('./'));
// });

gulp.task('beautify', gulp.series('jscs', function() {
  return gulp.src(jsSrc, {
    base: '.',
  }).pipe(beautify({
    indent_size: 2,
  })).pipe(gulp.dest('.'));
}));

// Gulp.task('pre-test', function() {
//   return gulp.src(['lib/**/*.js'])
//     // Covering files
//     .pipe(istanbul())
//     // Force `require` to return covered files
//     .pipe(istanbul.hookRequire());
// });

gulp.task('lint', gulp.series('beautify', function() {
  return gulp.src(jsSrc).pipe(jshint()).pipe(jshint.reporter('default')).pipe(jshint.reporter('fail'));
}));

// Gulp.task('test', gulp.series(gulp.parallel('lint', 'pre-test'), function() {
//   return gulp.src(['test/**/*.js'], {
//       read: false,
//     })
//     .pipe(mocha({
//       reporter: 'spec',
//     }))
//     .pipe(istanbul.writeReports())
//     // Enforce a coverage of at least 90%
//     .pipe(istanbul.enforceThresholds({
//       thresholds: {
//         global: 90,
//       },
//     }))
//     .on('error', util.log);
// }));

// Gulp.task('appveyor', gulp.series('bump', function(done) {
//   async.parallel({
//     package: function(cb) {
//       fs.readJSON('package.json', cb);
//     },
//     appveyor: function(cb) {
//       fs.readFile('appveyor.yml', 'utf8', cb);
//     },
//   }, function(error, results) {
//     if (error) return done(error);
//     var appveyor = yaml.safeLoad(results.appveyor);
//     appveyor.version = results.package.version;
//     fs.writeFile('appveyor.yml', yaml.safeDump(appveyor), done);
//   });
// }));

gulp.task('transform', function() {
  return compile(true);
});

gulp.task('jsprep', gulp.parallel('lint', 'jscs', 'beautify', 'templates'));

gulp.task('test', gulp.series(gulp.parallel('jsprep')));


gulp.task('javascript', gulp.series('jsprep', 'transform'));

gulp.task('html', function() {


  return gulp.src('./static/**/*.html')
    .pipe(gulp.dest('./public'));
});

gulp.task('scss', function() {
  return gulp.src('./static/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

//Gulp.task('default', gulp.parallel('javascript', 'test', 'bump', 'appveyor'));
gulp.task('default', gulp.parallel('javascript', 'html', 'scss', 'test'));


gulp.task('deploy', gulp.series('default', function() {
  return gulp.src('./public/**/*')
    .pipe(ghPages());
}));