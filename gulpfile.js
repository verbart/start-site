const gulp = require('gulp');
const postcss = require('gulp-postcss');
const stylus = require('gulp-stylus');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const gulpIf = require('gulp-if');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const del = require('del');
const gutil = require('gulp-util');
const pug = require('gulp-pug');
const tinypng = require('gulp-tinypng-nokey');
const webpack = require('webpack');

const isDevelopment = process.env.NODE_ENV !== 'production';


gulp.task('views', function buildHTML() {
    return gulp.src('./src/index.pug')
        .pipe(pug())
        .on('error', function(error) {
            gutil.log(gutil.colors.red('Error: ' + error.message));
            this.emit('end');
        })
        .pipe(gulp.dest('./dist'));
});

gulp.task('styles', function () {
    return gulp.src('./src/app.styl')
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
        .pipe(gulpIf(!isDevelopment, cleanCSS()))
        .pipe(rename('style.css'))
        .pipe(gulp.dest('./dist/css'))
});

gulp.task('scripts', function(done) {
    return webpack(require('./webpack.config.js'), function(err, stats) {
        if(err) throw new gutil.PluginError('webpack', err);

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
        './node_modules/font-awesome/fonts/**/*.*'
    ])
        .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('images', function () {
    return gulp.src('./src/**/*.{png,jpg,jpeg,gif,svg}')
        .pipe(gulpIf(!isDevelopment, tinypng()))
        .pipe(rename(path => {path.dirname = '';}))
        .pipe(gulp.dest('./dist/images'));
});

gulp.task('watch', function () {
    gulp.watch('./src/**/*.pug', gulp.series('views'));
    gulp.watch('./src/**/*.{css,styl}', gulp.series('styles'));
    gulp.watch('./src/**/*.js', gulp.series('scripts'));
});

gulp.task('serve', function () {
    browserSync.init({
        // proxy: 'example.com',
        // files: 'public/**/*.*',
        server: './dist',
        port: 8080
    });

    browserSync.watch('./dist/**/*.*').on('change', browserSync.reload);
});

gulp.task('clean', function () {
    return del('./dist')
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel(
        'views',
        'styles',
        'scripts',
        'fonts',
        'images'
    )));

gulp.task('default', gulp.series(
    'build',
    gulp.parallel(
        'watch',
        'serve'
    )));
