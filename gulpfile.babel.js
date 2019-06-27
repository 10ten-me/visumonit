const gulp = require('gulp');
const browserSync = require('browser-sync');
const sass        = require('gulp-sass');
const prefix      = require('gulp-autoprefixer');
const cssnano     = require('gulp-cssnano');
const concat      = require('gulp-concat');
const uglify      = require('gulp-uglify');
const babel       = require('gulp-babel');
const render      = require('gulp-nunjucks-render');
const clean       = require('gulp-clean');
const sourcemaps  = require('gulp-sourcemaps');
const gzip        = require('gulp-gzip');
const del         = require('del');



var data = require('gulp-data');
var fs = require('fs');

const imagemin    = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngQuant = require('imagemin-pngquant');

// for starting server
const startServer = (done) => {
    browserSync.init({
        server: "./build",
        port: 6950
    })
    done()
}

// deletes old build folder
const cleanBuild = () => {
    return gulp.src('./build', { read: false, allowEmpty: true })
        .pipe(clean());
}

// compile js

const compileScripts = () => {
    return gulp.src(['src/js/**/*.js'])
        // .pipe(babel({
        // //    "presets": ["@babel/preset-env"]
        // }))
        //.pipe(concat('scripts.js'))
        .pipe(gulp.dest('./build/scripts'))
        .pipe(browserSync.reload({ stream: true }))
}

// compile scss

const compileStyles = () => {
    return gulp.src('src/scss/styles.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'compressed',
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        //.pipe(gzip({ append: false }))
        .pipe(sourcemaps.write())
        //.pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('./build/'))
        .pipe(browserSync.reload({ stream: true }))
}


// render webpages

const watchMarkup = () => {
    gulp.watch(['src/pages/**/*.njk', 'src/templates/**/*'],  compileMarkup() );
}

const compileMarkup = () => {
    return gulp.parallel( markupArabic, markupEnglish );
}

const markupEnglish = () => {
    return gulp.src('src/pages/**/*.+(njk)')
        .pipe(data(function () {
            return JSON.parse(fs.readFileSync('./src/templates/en.json'));
        }))
        .pipe(render({
            path: ['src/templates'],
            data: {
                google_maps_api_key: "AIzaSyAGoVw0khSXQJp_9CEOyZjE4BGVoNno0UU",
            }
        }))
        .pipe(gulp.dest('./build/'))
        .pipe(browserSync.reload({ stream: true }))
}

const markupArabic = () => {
    return gulp.src('src/pages/**/*.+(njk)')
        .pipe(data(function () {
            return require('./src/templates/en.json');
        }))
        .pipe(data(function () {
            const english = JSON.parse(fs.readFileSync('./src/templates/en.json'));
            const arabic = JSON.parse(fs.readFileSync('./src/templates/ar.json'));
            const arabicOverEnglish = {
                lang: Object.assign(english.lang, arabic.lang)
                    }
            return arabicOverEnglish;
        }))
        .pipe(render({
            path: ['src/templates'],
            data: {
                google_maps_api_key: "AIzaSyAGoVw0khSXQJp_9CEOyZjE4BGVoNno0UU",
            }
         }))
        .pipe(gulp.dest('./build/ar/'))
        .pipe(browserSync.reload({ stream: true }))
}

// copy other files 

const copyFiles = () => {
    return gulp.src('src/files/**/*', { base: 'src/files/' })
        .pipe(gulp.dest('./build/'))
        .pipe(browserSync.reload({ stream: true }))
}

const compressImages = () => {
    del(['build/images/**']) 
    return gulp
    .src('src/images/**/*', { base: 'src/images/' })
        // .pipe(imagemin([
        //     imagemin.gifsicle(),
        //     imageminJpegRecompress({
        //       loops:6,
        //       min: 40,
        //       max: 85,
        //       quality:'low'
        //     }),
        //   imageminPngQuant(),
        //     imagemin.svgo()
        //   ], {verbose: true}))
        .pipe(gulp.dest('build/images'))
        .pipe(browserSync.reload({ stream: true }))
}



const watchScripts = () => {
    gulp.watch(['src/js/**/*.js'], compileScripts);
}

const watchStyles = () => {
    gulp.watch(['src/scss/**/*.scss'], compileStyles)
}

const watchFiles = () => {
    gulp.watch(['src/files/**/*'], copyFiles)
}

const watchImages = () => {
    gulp.watch(['src/images/**/*'], compressImages)
}


const compile = gulp.parallel(compileScripts, compileStyles, compileMarkup(), copyFiles, compressImages)
compile.description = 'compile all sources'

// Not exposed to CLI
const serve = gulp.series(cleanBuild, compile, startServer)
serve.description = 'serve compiled source on local server at port 6950'

const watch = gulp.parallel(watchMarkup, watchScripts, watchStyles, watchFiles, watchImages)
watch.description = 'watch for changes to all source'

const defaultTasks = gulp.parallel(serve, watch)

export {
    compile,
    compileScripts,
    compileStyles,

    compileMarkup,
    markupArabic,
    markupEnglish,

    serve,
    watch,
    watchMarkup,
    watchScripts,
    watchStyles,
    defaultTasks,
}

export default defaultTasks
