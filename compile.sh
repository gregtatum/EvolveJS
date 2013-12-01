project='evo'
sourcefiles='./js'
outputpath='./'

#compilation='WHITESPACE_ONLY'
compilation='SIMPLE_OPTIMIZATIONS'
#compilation='ADVANCED_OPTIMIZATIONS'

#-------------------------------------------------------------------------
# Get the files as parameters "--js filename.js "
files=$( find $sourcefiles -name '*.js' | { #Recursive file read
	while read filename
	do
		echo -n "--js $filename " #echo with no trailing newline
	done
} )


#-------------------------------------------------------------------------
# Set the output file "--js_output_file ./path/project.min.js"
outputfile="--js_output_file $outputpath$project.min.js"


#-------------------------------------------------------------------------
# Set the compilation level parameter
compilation="--compilation_level $compilation"


#-------------------------------------------------------------------------
# Compile!
closure-compiler $files $outputfile $compilation