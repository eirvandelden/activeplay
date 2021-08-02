require('dotenv').load({silent: true});

var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var colors = require('colors');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass')(require('sass'));
var rename = require('gulp-rename');

var bases = {
  src: 'src/',
  dist: '/public/dist/'
};

gulp.task('nodemon', function () {
  nodemon({
    script: 'app',
    ext: 'js scss',
    env: {
      PORT: 5050
    },
    ignore: ['./node_modules/**', './public'],
    tasks: ['sass', 'scripts']
  })
  .on('restart', function () {
    console.log('Restarting'.yellow);
  });
});

// Compile Our Sass
gulp.task('sass', function () {
  return gulp.src('src/sass/*.scss')
    .pipe(concat('activeplay.v0.6.css'))
    .pipe(sass())
    .pipe(gulp.dest('public/stylesheets'))
    .pipe(rename('activeplay.v0.6.min.css'))
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(gulp.dest('public/stylesheets'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./src/sass/*.scss', ['sass']);
});

// Concatenate & Minify JS
gulp.task('scripts', function () {
  return gulp.src(['src/js/ap-store.js', 'src/js/components/*.js', 'src/js/*.js'])
    .pipe(concat('activeplay.v0.6.js'))
    .pipe(gulp.dest('public/javascripts'))
    .pipe(rename('activeplay.v0.6.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('public/javascripts'));
});

// Default Task
gulp.task('default', ['sass', 'scripts', 'nodemon']);
