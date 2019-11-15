import gulp from 'gulp';
import babelify from 'babelify';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import watch from 'gulp-watch';

gulp.task('buildJS', () => {
  return browserify({ entries: './app/popup_page/popup.js', debug: true })
    .transform('babelify')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./app/popup_page/dist'));
});

gulp.task('watch', () => {
  gulp.watch('./app/popup_page/*.js', gulp.series('buildJS'));
})

gulp.task('default', gulp.series('buildJS', 'watch'));
