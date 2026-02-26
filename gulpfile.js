require('dotenv').load({silent: true});

var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var rename = require('gulp-rename');

function compileSass() {
  return gulp.src('src/sass/ap-core.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename('activeplay.v0.6.css'))
    .pipe(gulp.dest('public/stylesheets'))
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(rename('activeplay.v0.6.min.css'))
    .pipe(gulp.dest('public/stylesheets'));
}

function watchSass() {
  return gulp.watch('./src/sass/*.scss', compileSass);
}

gulp.task('sass', compileSass);
gulp.task('sass:watch', watchSass);
gulp.task('default', gulp.series('sass', 'sass:watch'));
