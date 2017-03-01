var gulp = require('gulp'),
  prefixer = require('gulp-autoprefixer'),
  mainBowerFiles = require('gulp-main-bower-files'),
  uglify = require('gulp-uglify'),
  stylus = require('gulp-stylus'),
  sourcemaps = require('gulp-sourcemaps'),
  rigger = require('gulp-rigger'),
  concat = require('gulp-concat'),
  cssmin = require('gulp-minify-css'),
  gulpFilter = require('gulp-filter'),
  imagemin = require('gulp-imagemin'),
  pngquant = require('imagemin-pngquant'),
  rimraf = require('rimraf');

var notify      = require('gulp-notify');
var browserSync = require('browser-sync');
var reload      = browserSync.reload;

var path = {
    build: {
        html: 'build/',
        js: 'build/js/',
        css: 'build/css/',
        img: 'build/img/',
        fonts: 'build/fonts/'
    },
    src: { 
        html: 'src/*.html',
        js: 'src/js/*.*',
        style: 'src/style/*.*',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: { 
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.*',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './build'
};

gulp.task('html:build', function () {
    gulp.src(path.src.html) 
        .pipe(rigger()) 
        .pipe(gulp.dest(path.build.html)) 
        .pipe(reload({stream: true})); 
});
gulp.task('js:build', function () {
    gulp.src(path.src.js) 
        //.pipe(rigger()) 
        .pipe(sourcemaps.init()) 
        //.pipe(uglify()) 
        .pipe(sourcemaps.write()) 
        .pipe(gulp.dest(path.build.js)) 
        .pipe(reload({stream: true})); 
});
gulp.task('style:build', function () {
    gulp.src(path.src.style) 
        .pipe(sourcemaps.init()) 
        .pipe(stylus()) 
        .pipe(prefixer())
        //.pipe(cssmin()) 
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css)) 
        .pipe(reload({stream: true}));
});
gulp.task('image:build', function () {
    gulp.src(path.src.img) 
        .pipe(imagemin({ 
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});
gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'js:build',
    'style:build',
    'fonts:build',
    'image:build'
]);

gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: "./build"
    },
    port: 8080,
    open: true,
    notify: false
  });
});


gulp.task('watcher',function(){
    gulp.watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    gulp.watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    gulp.watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    gulp.watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    gulp.watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('mainfiles', function() {
  var filterJS = gulpFilter('**/*.js', { restore: true });
    return gulp.src('./bower.json')
        .pipe(mainBowerFiles({
            overrides: {
                bootstrap: {
                    main: [
                        './dist/js/bootstrap.js',
                        './dist/css/*.min.*',
                        './dist/fonts/*.*'
                    ]
                }
            }
        }))
  .pipe(filterJS)
  .pipe(concat('vendor.js'))
  .pipe(uglify())
  .pipe(filterJS.restore)
    .pipe(gulp.dest('build/assets'))
});

gulp.task('default', ['mainfiles', 'build','watcher', 'browserSync']);