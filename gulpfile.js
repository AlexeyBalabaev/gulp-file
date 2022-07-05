let projectFolder = require("path").basename(__dirname);
let sourceFolder = "src";

let fs = require('fs');

let path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/css/",
    js: projectFolder + "/js/",
    img: projectFolder + "/img/",
    fonts: projectFolder + "/fonts/"
  },
  src: {
    html: [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
    css: sourceFolder + "/scss/main.scss",
    js: sourceFolder + "/js/custom.js",
    img: sourceFolder + "/img/**/*.{jpg,svg,png,gif,ico,webp}",
    fonts: sourceFolder + "/fonts/*.ttf"
  },
  watch: {
    html: sourceFolder + "/**/*.html",
    css: sourceFolder + "/scss/**/*.scss",
    js: sourceFolder + "/js/**/*.js",
    img: sourceFolder + "/img/**/*.{jpg,svg,png,gif,ico,webp}"
  },
  clean: "./" + projectFolder + "/"
};

let { src, dest } = require('gulp');
let gulp = require('gulp');
let browsersync = require('browser-sync').create();
let scss = require('gulp-sass');
let autoprefixer = require('gulp-autoprefixer');
let cleancss = require('gulp-clean-css');
let groupMedia = require('gulp-group-css-media-queries');
let fileinclude = require('gulp-file-include');
let del = require('del');
let rename = require('gulp-rename');
let uglify = require('gulp-uglify-es').default;
let imagemin = require('gulp-imagemin');
let webp = require('gulp-webp');
let webphtml = require('gulp-webp-html');
// let webpcss = require('gulp-webpcss');
let svgsprite = require('gulp-svg-sprite');
let ttf2woff = require('gulp-ttf2woff');
let ttf2woff2 = require('gulp-ttf2woff2');
let fonter = require('gulp-fonter');

let compile = gulp.series(cleanDist, gulp.parallel(htmlCompile, cssCompile, jsCompile, imgCompile, fontCompile), fontsStyle);
let watch = gulp.parallel(compile, watchFiles, initBrowserSync);

function initBrowserSync(params) {
  browsersync.init({
    server: {
      baseDir: "./" + projectFolder + "/"
    },
    port: 3000,
    notify: false
  })
};

function htmlCompile() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(webphtml())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
};

function cssCompile() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded'
      })
    )
    .pipe(groupMedia())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ["last 10 versions"],
        cascade: true
      })
    )
    // .pipe(webpcss())
    .pipe(dest(path.build.css))
    .pipe(cleancss())
    .pipe(
      rename({
        extname: ".min.css"
      })
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream());
}

function jsCompile() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: ".min.js"
      })
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream());
};

function imgCompile() {
  return src(path.src.img)
    .pipe(
      webp({
        quality: 70
      })
    )
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
};

function fontCompile() {
  src(path.src.fonts)
    .pipe(ttf2woff())
    .pipe(dest(path.build.fonts));
  return src(path.src.fonts)
    .pipe(ttf2woff2())
    .pipe(dest(path.build.fonts));
}

gulp.task('otf2ttf', function() {
  return gulp.src([sourceFolder + "/fonts/*.otf"])
    .pipe(
      fonter({
        formats: ['ttf']
      })
    )
    .pipe(dest([sourceFolder + "/fonts/"]))
})

gulp.task('svgSprite', function() {
  return gulp.src([sourceFolder + "/svg-icons/*.svg"])
    .pipe(
      svgsprite({
        mode: {
          stack: {
            sprite: "../icons/icons.svg",
            example: true  // show demo of sprite
          }
        }
      })
    )
    .pipe(dest(path.build.img))
})

function fontsStyle(params) {
  let fileContent = fs.readFileSync(sourceFolder + '/scss/fonts.scss');
  if (fileContent == '') {
    fs.writeFile(sourceFolder + '/scss/fonts.scss', '', cb);
    return fs.readdir(path.build.fonts, function (err, items) {
      if (items) {
        let cFontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];
          if (cFontname != fontname) {
            fs.appendFile(sourceFolder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
          }
          cFontname = fontname;
        }
      }
    })
  }
}

function cb() {

}

function watchFiles(params) {
  gulp.watch([path.watch.html], htmlCompile);
  gulp.watch([path.watch.css], cssCompile);
  gulp.watch([path.watch.js], jsCompile);
  gulp.watch([path.watch.img], imgCompile);
}

function cleanDist(params) {
  return del(path.clean);
}

exports.fontsStyle = fontsStyle;
exports.fontCompile = fontCompile;
exports.imgCompile = imgCompile;
exports.jsCompile = jsCompile;
exports.cssCompile = cssCompile;
exports.htmlCompile = htmlCompile;
exports.compile = compile;
exports.watch = watch;
exports.default = watch;
