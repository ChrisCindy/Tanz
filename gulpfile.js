// 引入 gulp
var gulp = require('gulp');

// 引入功能组件
var compass = require('gulp-compass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var jshint = require('gulp-jshint');
var template = require('gulp-template');

var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');

var autoprefixer = require('gulp-autoprefixer');
var cleanCss = require('gulp-clean-css');
var rename = require('gulp-rename');

// 图像处理
var imagemin = require('gulp-imagemin'); //十分大
var pngquant = require('imagemin-pngquant');
var spritesmith = require('gulp.spritesmith');
var imageResize = require('gulp-image-resize');


// 错误处理
var plumber = require("gulp-plumber");
var stylish = require("jshint-stylish");

// 开发辅助
var pkg = require('./package.json'); //获得配置文件中相关信息
var chalk = require('chalk'); //美化日志
var dateFormat = require('dateformat'); //获得自然时间
var csscomb = require('gulp-csscomb'); //CSS规范排序

// 打包发布
var zip = require('gulp-zip');

// 设置相关路径
var paths = {
  assets: 'assets',
  sass: 'src/dev/css/sass/**/*',
  css: 'src/dev/css',
  js: 'src/dev/js/**/*', // js 文件相关目录
  img: 'src/dev/img/**/*', // 图片相关
};

// 引入配置对象
var options = require('./config');

gulp.task('clean', function (cb) {
  del(['dist']).then(()=> {
    cb();
  });
});

// Sass 处理
gulp.task('sass', ['clean'], function () {
  return gulp.src(paths.sass)
    .pipe(plumber())
    .pipe(sass())
    .pipe(concat('style.css'))
    .pipe(csscomb())
    .pipe(cleanCss())
    .pipe(rename('all.min.css'))
    .pipe(gulp.dest('assets/css'))
});

// JS 检查
gulp.task('lint', function () {
  return gulp.src(paths.js)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('scripts', ['clean'], function () {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.js)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(uglify({
      compress: {
        drop_console: false
      }
    }))
    .pipe(concat('all.min.js'))
    .pipe(gulp.dest('assets/js'))
    .pipe(rename('dev.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('assets/js'));
});

// 处理图像
gulp.task('image', ['clean'], function () {
  return gulp.src(paths.img)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest('assets/images'));
});

/**
 * 文件变更监听
 * $ gulp watch
 */
gulp.task('watch', function () {
  console.log(chalk.green('[监听] 启动gulp watch自动编译'))
  gulp.watch(paths.js, ['scripts']);
  gulp.watch(paths.sass, ['sass']);
});

/**
 * 读取配置，处理 dev 文件，生成最终打包文件夹
 * $ gulp build
 *
 */
gulp.task('build', ['sass', 'scripts', 'image'], function () {
  gulp.src('src/**/*.hbs')
    .pipe(template(options))
    .pipe(gulp.dest('dist'))
  return gulp.src('assets/**/!(*dev*)*')
    .pipe(gulp.dest('dist/assets'))
});

/**
 * 压缩最终的文件
 * 自动增加当前时间戳 + 项目名称
 * $ gulp zip
 */
gulp.task('zip', ['build'], function () {
  // del.sync(['zipped/*.zip']);
  console.log(chalk.red('[清理] 删除旧有压缩包'));
  console.log(chalk.red('[压缩] 打包最终文件'))
  gulp.src('dist/**/*')
    .pipe(zip(pkg.name + '.zip'))
    .pipe(gulp.dest('zipped'))
});

gulp.task('default', ['zip']);
