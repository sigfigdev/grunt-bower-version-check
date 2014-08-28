var _ = require("lodash");
var q = require("q");

var anchann;
(function (anchann) {
    (function (grunt) {
        (function (bowerVersionCheck) {
            var BowerVersionCheck = (function () {
                function BowerVersionCheck(grunt) {
                    this.grunt = grunt;
                }
                BowerVersionCheck.prototype.run = function () {
                    var grunt = this.grunt;

                    grunt.registerMultiTask('bower_version_check', 'Check versions of bower components against bower.json and bail on (or otherwise handle) mismatches.', function () {
                        var options = this.options({
                            punctuation: '.',
                            separator: ', '
                        });

                        this.files.forEach(function (f) {
                            var src = f.src.filter(function (filepath) {
                                if (!grunt.file.exists(filepath)) {
                                    grunt.log.warn('Source file "' + filepath + '" not found.');
                                    return false;
                                } else {
                                    return true;
                                }
                            }).map(function (filepath) {
                                return grunt.file.read(filepath);
                            }).join(grunt.util.normalizelf(options.separator));

                            src += options.punctuation;

                            grunt.file.write(f.dest, src);

                            grunt.log.writeln('File "' + f.dest + '" created.');
                        });
                    });
                };
                return BowerVersionCheck;
            })();
            bowerVersionCheck.BowerVersionCheck = BowerVersionCheck;
        })(grunt.bowerVersionCheck || (grunt.bowerVersionCheck = {}));
        var bowerVersionCheck = grunt.bowerVersionCheck;
    })(anchann.grunt || (anchann.grunt = {}));
    var grunt = anchann.grunt;
})(anchann || (anchann = {}));

module.exports = function(grunt) {
	var bowerVersionCheck = new anchann.grunt.bowerVersionCheck.BowerVersionCheck(grunt);
	bowerVersionCheck.run();
}
