module.exports = function(grunt) {

	// Project configuration.
				
	var src = ['js/**/*.js'];
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
	
		concat: {
			options: {
				separator: '\n'
			},
			dist: {
				src: src,
				dest: 'build/<%= pkg.basename %>.js'
			}
		},
		
		concat_in_order: {
			evolve_js_files: {
				options: {
					extractRequired: function (filepath, filecontent) {
						return this.getMatches(/@require[ \t]+([a-zA-Z0-9\.]+)/g, filecontent);
					},
					extractDeclared: function (filepath, filecontent) {
						return this.getMatches(/@define[ \t]+([a-zA-Z0-9\.]+)/g, filecontent);
						//return this.getMatches(/Evo\.([^ =\n]+)[ \t]*=/g, filecontent);
					}
				},
				files: {
					'build/<%= pkg.basename %>.js': src
				}
			}
		},

		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - <%= pkg.description %>\n'+
						'Copyright <%= pkg.author %> under <%= pkg.license %>.\n'+
						'Last built <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				sourceMap: 'build/<%= pkg.basename %>.map.js',
				sourceMapPrefix: 1,
				sourceMappingURL: '<%= pkg.basename %>.map.js'
			},
			dist: {
				files: {
					'build/<%= pkg.basename %>.min.js': ['build/<%= pkg.basename %>.js']
				}
			}
		},
		
		jshint: {
			// define the files to lint
			files: ['Gruntfile.js', 'js/**/*.js'],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options: {
				globals: {
					Evo: true,
					THREE: true,
					module: true
				},
				devel: true,
				jquery: true,
				browser: true,
				debug: true, //allow debug statements
				eqeqeq: true, //must use ===
				latedef: true, //variables must be defined before use
				undef: true //all variables must be declared
				
			}
		},
		
		watch: {
			files: src,
			tasks: ['concat_in_order', 'beep', 'jshint']
		}
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-concat-in-order');
	grunt.loadNpmTasks('grunt-beep');
	
	// Default task(s).
	grunt.registerTask('default', ['concat_in_order', 'uglify']);
};