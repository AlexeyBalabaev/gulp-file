const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const autopref = require('gulp-autoprefixer');

gulp.task('css', function() {
  return gulp.src([
    'src/css/main.css',
    'src/css/media.css'
  ])
    .pipe(concat('style.css'))
    .pipe(autopref({
      // browsers: ['last 2 versions'],
      cascade: false
    }))
    // .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('html', function() {
  return gulp.src("src/*.html")
    .pipe(gulp.dest('build/'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('script', function() {
  return gulp.src([
    'src/js/lib.js',
    'src/js/main.js'
  ])
    .pipe(concat('script.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "./src/"
    }
  });
});

gulp.task('watch', function() {
  gulp.watch("src/scss/**/*.scss", gulp.parallel('scss'));
  gulp.watch("src/*.html", gulp.parallel('html'));
  gulp.watch("src/js/*.js", gulp.parallel('script'));
});

gulp.task("default", gulp.parallel('css', 'script', 'browser-sync', 'watch'));