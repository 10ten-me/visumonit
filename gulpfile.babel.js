const gulp         = require("gulp");
const browserSync  = require("browser-sync");
const sass         = require("gulp-sass");
const render       = require("gulp-nunjucks-render");
const clean        = require("gulp-clean");
const sourcemaps   = require("gulp-sourcemaps");
const del          = require("del");
const data         = require("gulp-data");
const fs           = require("fs");
const source       = require('vinyl-source-stream');
const browserify   = require('browserify');
const buffer       = require('vinyl-buffer');
const babelify     = require('babelify');


// for starting server
const startServer = (done) => {
    browserSync.init({
        server: "./build",
        port: 6950,
    });
    done();
};

// deletes old build folder
const cleanBuild = () => {
    return gulp.src("./build", { read: false, allowEmpty: true })
        .pipe(clean());
};

// compile js
const compileScripts = () => {
    del(["build/scripts/**/*"]);

    // set up the browserify instance on a task basis
    var b = browserify({
        entries: "./src/js/main.js",
        debug: true,
    });
    
    return b
        .transform(babelify.configure({
            presets: [["@babel/env", {
                targets: {
                    "chrome": "60"
                }
            }]]
        }))
        .bundle()
        .on("error", function(err) {
            console.error(err.message);
            browserSync.notify('Browserify error!');
            this.emit('end');
        })
        .pipe(source("main.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest("./build/scripts/"))
        .pipe(browserSync.reload({ stream: true }));;

};

// compile scss
const compileStyles = () => {
    del(["build/styles.scss"]);
    return gulp.src("src/scss/styles.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: "compressed",
            includePaths: ["scss"],
            onError: browserSync.notify
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("./build/"))
        .pipe(browserSync.reload({ stream: true }));
};


// render webpages
const watchMarkup = () => {
    gulp.watch(["src/pages/**/*.njk", "src/templates/**/*"], compileMarkup());
};

const compileMarkup = () => {
    return gulp.parallel(markupEnglish);
};

const markupEnglish = () => {
    return gulp.src("src/pages/**/*.+(njk)")
        .pipe(data(function () {
            return JSON.parse(fs.readFileSync("./src/templates/en.json"));
        }))
        .pipe(render({
            path: ["src/templates"],
        }))
        .pipe(gulp.dest("./build/"))
        .pipe(browserSync.reload({ stream: true }));
};


// copy other files 
const copyFiles = () => {
    return gulp.src("src/files/**/*", { base: "src/files/" })
        .pipe(gulp.dest("./build/"))
        .pipe(browserSync.reload({ stream: true }));
}

const compressImages = () => {
    del(["build/images/**"]);
    return gulp
        .src("src/images/**/*", { base: "src/images/" })
        .pipe(gulp.dest("build/images"))
        .pipe(browserSync.reload({ stream: true }));
}



const watchScripts = () => {
    gulp.watch(["src/js/**/*.js"], compileScripts);
};

const watchStyles = () => {
    gulp.watch(["src/scss/**/*.scss"], compileStyles);
};

const watchFiles = () => {
    gulp.watch(["src/files/**/*"], copyFiles);
};

const watchImages = () => {
    gulp.watch(["src/images/**/*"], compressImages);
};


const compile = gulp.parallel(compileScripts, compileStyles, compileMarkup(), copyFiles, compressImages);
compile.description = "compile all sources";

// Not exposed to CLI
const serve = gulp.series(cleanBuild, compile, startServer);
serve.description = "serve compiled source on local server at port 6950";

const watch = gulp.parallel(watchMarkup, watchScripts, watchStyles, watchFiles, watchImages);
watch.description = "watch for changes to all source";

const defaultTasks = gulp.parallel(serve, watch);

export {
    compile,
    compileScripts,
    compileStyles,

    compileMarkup,
    markupEnglish,

    serve,
    watch,
    watchMarkup,
    watchScripts,
    watchStyles,
    defaultTasks,
};

export default defaultTasks;
