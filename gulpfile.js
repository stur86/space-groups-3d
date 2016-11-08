var gulp        = require('gulp');
var sass        = require('gulp-sass');
var browserify  = require('browserify');
var browserSync = require('browser-sync').create();
var source      = require('vinyl-source-stream');
var rename      = require('gulp-rename');
var es          = require('event-stream');
var glob        = require('glob'); 

var js_path = './js/*.js';

gulp.task('default', function() {
});

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sass())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  })
});

gulp.task('watch', ['browserSync', 'sass'], function (){
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch(js_path, ['browserify']);
  gulp.watch('app/**/*.html', browserSync.reload);   
  // Other watchers
});

gulp.task('browserify', function() {
    var files = glob.sync(js_path);
    // map them to our stream function
    var tasks = files.map(function(entry) {
        return browserify({ entries: [entry] })
            .bundle()
            .pipe(source(entry))
            // rename them to have "bundle as postfix"
            .pipe(rename({
                extname: '.bundle.js'
            }))
            .pipe(gulp.dest('./app'));
        });
    // create a merged stream
    return es.merge.apply(null, tasks)
                   .pipe(browserSync.reload({
                                stream: true
                    }));
});