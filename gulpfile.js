'use strict';

const { src, dest, watch, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync');
const concat = require('gulp-concat');
const concatCss = require('gulp-concat-css');
const uglify = require('gulp-uglify');
const fileInclude = require('gulp-file-include');
const minifyCss = require('gulp-clean-css');
const rename = require('gulp-rename');
const changed = require('gulp-changed');
const imagemin = require('gulp-imagemin');

const pathRoot = './app/';
const pathDestBuild = './build/';

// server
function server() {
    browserSync.init({
        server: pathDestBuild
    })
}

// Task build fontawesome
async function buildFontawesomeStyle() {
    return await src([
        './node_modules/@fortawesome/fontawesome-free/scss/fontawesome.scss',
        './node_modules/@fortawesome/fontawesome-free/scss/brands.scss',
        './node_modules/@fortawesome/fontawesome-free/scss/solid.scss',
    ])
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(concatCss('font-awesome.css'))
        .pipe(minifyCss({
            level: {1: {specialComments: 0}}
        }))
        .pipe(rename({suffix: '.min'}))
        .pipe(dest(`${pathDestBuild}assets/icons/css`))
        .pipe(browserSync.stream())
}

async function buildFontawesomeWebFonts() {
    return await src([
        './node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.ttf',
        './node_modules/@fortawesome/fontawesome-free/webfonts/fa-brands-400.woff2',
        './node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.ttf',
        './node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2'
    ])
        .pipe(dest(`${pathDestBuild}assets/icons/webfonts`))
        .pipe(browserSync.stream());
}

// Task buildSCSSLibs
async function buildCSSLibs() {
    return await src([
        `${pathRoot}assets/scss/libs/*.scss`
    ])
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(minifyCss({
            level: {1: {specialComments: 0}}
        }))
        .pipe(rename( {suffix: '.min'} ))
        .pipe(dest(`${pathDestBuild}assets/css/libs`))
        .pipe(browserSync.stream());
}

// Task build styles
async function buildStyle() {
    return await src(`${pathRoot}assets/scss/style.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(dest(`${pathDestBuild}assets/css`))
        .pipe(browserSync.stream());
}

// Task build styles pages
async function buildStylePages() {
    return await src(`${pathRoot}assets/scss/pages/*.scss`)
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(dest(`${pathDestBuild}assets/css/pages`))
        .pipe(browserSync.stream());
}

// Task compress lib js & mini file
async function compressLibraryJsMin() {
    return await src([
        './node_modules/jquery/dist/jquery.js',
        './node_modules/bootstrap/dist/js/bootstrap.bundle.js',
        './node_modules/owl.carousel/dist/owl.carousel.js',
    ], {allowEmpty: true})
        .pipe(uglify())
        .pipe(rename( {suffix: '.min'} ))
        .pipe(dest(`${pathDestBuild}assets/js/libs`))
        .pipe(browserSync.stream());
}

// task build js page
async function buildJsTemplate() {
    return await src(`${pathRoot}assets/js/**/*.js`, {allowEmpty: true})
        .pipe(uglify())
        .pipe(rename( {suffix: '.min'} ))
        .pipe(dest(`${pathDestBuild}assets/js/`))
        .pipe(browserSync.stream());
}

// Task optimize images
async function optimizeImages() {
    const imgSrc = `${pathRoot}assets/images/**/*.+(png|jpg|webp|svg|gif)`;
    const imgDst = `${pathDestBuild}assets/images`;

    return await src(imgSrc)
        .pipe(changed(imgDst))
        .pipe(imagemin())
        .pipe(dest(imgDst))
        .pipe(browserSync.stream());
}

// Task include HTML
async function includeHTML() {
    return await src([`${pathRoot}pages/*.html`])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(dest(pathDestBuild))
        .pipe(browserSync.stream());
}

// build app first
async function buildApp() {
    await buildFontawesomeStyle()
    await buildFontawesomeWebFonts()
    await buildCSSLibs()
    await buildStyle()
    await buildStylePages()
    await compressLibraryJsMin()
    await buildJsTemplate()
    await optimizeImages()
    await includeHTML()
    await watchTask()
}
exports.buildApp = buildApp

// Task watch
function watchTask() {
    server()

    // watch style
    watch(`${pathRoot}assets/scss/libs/*.scss`, buildCSSLibs)
    watch([
        `${pathRoot}assets/scss/**/*.scss`,
        `!${pathRoot}assets/scss/libs/*.scss`,
        `!${pathRoot}assets/scss/pages/*.scss`
    ], buildStyle)
    watch(`${pathRoot}assets/scss/pages/*.scss`, buildStylePages)

    // watch js
    watch(`${pathRoot}assets/js/**/*.js`, buildJsTemplate)

    // watch images
    watch(`${pathRoot}assets/images/**/*`, optimizeImages)

    // watch HTML
    watch(`${pathRoot}**/*.html`, includeHTML)

    // watch liveReload
    watch(`${pathDestBuild}**/*`, browserSync.reload)
}
exports.watchTask = watchTask
