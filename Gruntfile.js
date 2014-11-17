module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-open');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        express: {
            options: {
                port: 3000,
            }
        },
        typescript: {
            base: {
                src: ['app/**/*.ts'],
                dest: 'tsp.js',
                options: {
                    module: 'amd',
                    target: 'es5'
                }
            }
        },
        watch: {
            files: 'app/**/*.ts',
            tasks: ['typescript']
        },
        open: {
            dev: {
                path: 'http://localhost:3000/index.html'
            }
        }
    });

    grunt.registerTask('default', ['express', 'open', 'watch']);

}
