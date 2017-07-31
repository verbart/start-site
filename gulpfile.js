const gulp = require('gulp');
const buffer = require('vinyl-buffer');
const postcss = require('gulp-postcss');
const stylus = require('gulp-stylus');
const csso = require('gulp-csso');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const gulpIf = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const del = require('del');
const gutil = require('gulp-util');
const pug = require('gulp-pug');
const spritesmith = require('gulp.spritesmith');
const tinypng = require('gulp-tinypng-nokey');
const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV !== 'production';


gulp.task('views', function buildHTML() {
  return gulp.src('./src/views/pages/*.pug')
    .pipe(pug())
    .on('error', function(error) {
      gutil.log(gutil.colors.red('Error: ' + error.message));
      this.emit('end');
    })
    .pipe(gulp.dest('./public'));
});

gulp.task('styles', function () {
  return gulp.src('./src/styles/app.styl')
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(stylus({
      'include css': true
    })
    .on('error', function(error) {
      gutil.log(gutil.colors.red('Error: ' + error.message));
      this.emit('end');
    }))
    .pipe(gulpIf(!isDevelopment, postcss([
      autoprefixer({
          browsers: ['> 5%', 'ff > 14']
      })
    ])))
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulpIf(!isDevelopment, csso()))
    .pipe(rename('style.css'))
    .pipe(gulp.dest('./public/css'))
});

gulp.task('scripts', function(done) {
  return webpack(require('./webpack.config.js'), function(error, stats) {
    if (error) throw new gutil.PluginError('webpack', error);

    gutil.log('[scripts]', stats.toString({
      colors: gutil.colors.supportsColor,
      chunks: false,
      hash: false,
      version: false
    }));

    done();
  });
});

gulp.task('fonts', function () {
  return gulp.src([
    './src/fonts/**/*.*',
    './node_modules/font-awesome/fonts/**/*.*'
  ])
    .pipe(gulp.dest('./public/fonts'));
});

gulp.task('sprite', function() {
  const spriteData = gulp.src('./src/images/sprite/*.*')
    .pipe(spritesmith({
      imgName: 'sprite.png',
      cssName: 'images.styl',
      algorithm: 'binary-tree',
      padding: 2,
      cssTemplate: './src/styles/sprites/sprite-template.mustache'
    }));

  spriteData.img
    .pipe(buffer())
    .pipe(gulpIf(!isDevelopment, tinypng()))
    .pipe(gulp.dest('./public/images'));

  spriteData.css.pipe(gulp.dest('./src/styles/sprites'));

  return spriteData;
});

gulp.task('images', function () {
  return gulp.src(['./src/images/**/*.*', '!./src/images/sprite/*.*'])
    .pipe(gulpIf(!isDevelopment, tinypng()))
    .pipe(gulp.dest('./public/images'));
});

gulp.task('watch', function () {
  gulp.watch('./src/views/**/*.pug', gulp.series('views'));
  gulp.watch('./src/styles/**/*.{css,styl}', gulp.series('styles'));
  gulp.watch('./src/scripts/**/*.js', gulp.series('scripts'));
});

gulp.task('serve', function () {
  browserSync.init({
    // proxy: 'example.com',
    // files: 'public/**/*.*',
    // https: true,
    server: './public',
    port: 8080
  });

  browserSync.watch('./public/**/*.*').on('change', browserSync.reload);
});

gulp.task('clean', function () {
  return del('./public')
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel(
    'views',
    'styles',
    'scripts',
    'fonts',
    'sprite',
    'images'
  )));

gulp.task('default', gulp.series(
  'build',
  gulp.parallel(
    'watch',
    'serve'
  )));
