"use strict";

/**
 * GULP FILE FOR SCSS, JS, NUNJUCKS COMPILING WITH BROWSERSYNC
 *
 * GULP WATCH / NPM START ->
 *
 *  - Compiles all scss, js and nunjucks files from the /src folder into the /dist folder
 *  - Starts the development server (defaults to localhost:3000) and
 *  - Watch for changes in scss, js, nunjucks files respectively and reload the server upon any related changes
 *
 * GULP BUILD / NPM RUN BUILD ->
 *  - Compiles, Prefixes and Minifies all scss files to the /dist folder for production use
 *  - Compiles, Babelifies and Minifies all js files to the /dist folder for production use
 *  - Compiles all nunjucks files to the /dist folder
 *
 */

// Gulp Imports
const { series, src, dest, watch } = require("gulp");
const del = require("del");
// BrowserSync Requires
const browserSync = require("browser-sync").create();
// SCSS Requires
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
// JS Requires
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");
const browserify = require("browserify");
const babelify = require("babelify");
// Nunjuck Requires
const nunjucksRender = require("gulp-nunjucks-render");

// Directory Paths
const path = {
  scss: {
    src: "./src/scss/**/*.scss",
    dest: "./dist/",
    watch: "./src/scss/**/*.scss",
  },
  js: {
    src: "./src/js/main.js",
    dest: "./dist/",
    watch: "./src/js/**/*.js",
  },
  njk: {
    src: ["./src/pages/**/*.njk", "!./src/pages/templates/**/*.njk"],
    dest: "./dist/",
    watch: "./src/pages/**/*.njk",
  },
  fonts: {
    src: "./src/fonts/**/*",
    dest: "./dist/fonts/",
  },
  images: {
    src: "./src/images/**/*",
    dest: "./dist/images/",
  },
};

// Browser-Sync Functions, Used For Development
// https://browsersync.io/docs/ for more information on BrowserSync

function browserSyncServe(cb) {
  browserSync.init({
    server: {
      baseDir: "./dist",
      index: "index.html",
    },
    open: false,
    port: 3000,
    host: "0.0.0.0" // docker container host address, remove the "host" property if the project is ran locally
  });
  cb();
}

function browserSyncReload(cb) {
  browserSync.reload();
  cb();
}

// Functions for SCSS and JS, Used For Development
// Browserify -> https://github.com/browserify/browserify
// Babelify -> https://github.com/babel/babelify

function css() {
  return src(path.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(dest(path.scss.dest));
}

function js() {
  return browserify({
    entries: [path.js.src],
  })
    .transform(
      babelify.configure({
        presets: ["@babel/preset-env"],
      })
    )
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(dest(path.js.dest));
}

// Minification Functions SCSS and JS, Used For Production

function minifyJS() {
  return browserify({
    entries: [path.js.src],
  })
    .transform(
      babelify.configure({
        presets: ["@babel/preset-env"],
      })
    )
    .bundle()
    .pipe(source("bundle.js"))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(dest(path.js.dest));
}

function minifyCSS() {
  return src(path.scss.src)
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest(path.scss.dest));
}

// Nunjucks Function
// https://www.npmjs.com/package/gulp-nunjucks-render for more info
function nunjucks() {
  return src(path.njk.src)
    .pipe(
      nunjucksRender({
        path: ["./src/pages/"],
        envOptions: { autoescape: true },
      })
    )
    .pipe(dest(path.njk.dest));
}

// Local Fonts
function fonts() {
  return src(path.fonts.src).pipe(dest(path.fonts.dest));
}

// Local Images
function images() {
  return src(path.images.src).pipe(dest(path.images.dest));
}

// Cleaning Dist Folder
function cleanDist() {
  return del("./dist/**/*");
}

// Watch Functions for SCSS, JS, NUNJUCKS
function watchAll() {
  watch(path.scss.watch, series(css, browserSyncReload));
  watch(path.js.watch, series(js, browserSyncReload));
  watch(path.njk.watch, series(nunjucks, browserSyncReload));
}

// Gulp Command Exports

exports.watch = series(
  css,
  js,
  nunjucks,
  fonts,
  images,
  browserSyncServe,
  watchAll
);
exports.build = series(minifyCSS, minifyJS, nunjucks, fonts);
exports.clean = series(cleanDist);
