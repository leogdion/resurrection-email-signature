var gulp = require('gulp');
var jscs = require('gulp-jscs');
//var bump = require('gulp-bump');
var beautify = require('gulp-beautify');
var jshint = require('gulp-jshint'),
    browserify = require('browserify'),
    transform = require('vinyl-transform');
var babel = require('babelify');
var source = require('vinyl-source-stream');
//var util = require('gulp-util');
//var mocha = require('gulp-mocha');
//var istanbul = require('gulp-istanbul');
//var bump = require('gulp-bump');

//var async = require('async');
//var yaml = require('js-yaml');
//var fs = require('fs-extra');

function compile(watch) {

  var bundler = browserify('./static/js/main.js', { debug: true }).transform(babel);

  function rebundle() {
    return bundler.bundle()
      .on('error', function(err) { console.error(err); this.emit('end'); })
      .pipe(source('build.js'))
      //.pipe(buffer())
      //.pipe(sourcemaps.init({ loadMaps: true }))
      //.pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'));
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

// gulp.task('bump', function() {
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

// gulp.task('pre-test', function() {
//   return gulp.src(['lib/**/*.js'])
//     // Covering files
//     .pipe(istanbul())
//     // Force `require` to return covered files
//     .pipe(istanbul.hookRequire());
// });

gulp.task('lint', gulp.series('beautify', function() {
  return gulp.src(jsSrc).pipe(jshint()).pipe(jshint.reporter('default')).pipe(jshint.reporter('fail'));
}));

// gulp.task('test', gulp.series(gulp.parallel('lint', 'pre-test'), function() {
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

gulp.task('test', gulp.series(gulp.parallel('lint')));

// gulp.task('appveyor', gulp.series('bump', function(done) {
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

gulp.task('javascript', gulp.parallel('lint', 'jscs', 'beautify'));

//gulp.task('default', gulp.parallel('javascript', 'test', 'bump', 'appveyor'));
gulp.task('default', gulp.parallel('javascript'));