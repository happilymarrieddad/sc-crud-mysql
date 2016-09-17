var gulp = require('gulp')

gulp.task('default',['minify'])

gulp.task('minify',function(cb) {
	return gulp.src([
			'public/js/src/system/init.js',
			'public/js/src/components/**/*.js',
			'public/js/src/system/app.js'
		])
		.pipe(require('gulp-babel')({
			presets:['es2015']
		}))
		.pipe(require('gulp-concat')('concat.js',{
			newLine:'\n;'
		}))
		.pipe(require('gulp-uglify')())
		.pipe(require('gulp-minify')())
		.pipe(gulp.dest('public/js/bin'))
})