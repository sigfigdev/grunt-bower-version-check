var _ = require("lodash");
var q = require("q");

var grunt = "we don't use this variable, but only need it for typechecking when we import gruntjs = grunt";

var gruntjs = grunt;

var anchann;
(function (anchann) {
    (function (grunt) {
        (function (bowerVersionCheck) {
            var BowerVersionCheck = (function () {
                function BowerVersionCheck(grunt) {
                    this.grunt = grunt;
                }
                BowerVersionCheck.prototype.getBowerList = function () {
                    var deferred = q.defer();

                    this.grunt.util.spawn({
                        cmd: "bower",
                        args: ["list", "--json"]
                    }, function (error, result, code) {
                        if (code === 0) {
                            deferred.resolve(JSON.parse(result.stdout));
                        } else {
                            deferred.reject("Failed to get bower list: " + error);
                        }
                    });

                    return deferred.promise;
                };

                BowerVersionCheck.prototype.registerTask = function () {
                    var theThis = this;

                    this.grunt.registerMultiTask("bower_version_check", "Check versions of bower components against bower.json and bail on (or otherwise handle) mismatches.", function () {
                        var task = this;
                        theThis.run.call(theThis, task);
                    });
                };

                BowerVersionCheck.prototype.run = function (task) {
                    var _this = this;
                    var done = task.async();

                    this.getBowerList().then(function (list) {
                        console.log(list);
                        done(true);
                    });

                    var options = task.options({
                        punctuation: '.',
                        separator: ', '
                    });

                    task.files.forEach(function (f) {
                        var src = f.src.filter(function (filepath) {
                            if (!_this.grunt.file.exists(filepath)) {
                                _this.grunt.log.warn('Source file "' + filepath + '" not found.');
                                return false;
                            } else {
                                return true;
                            }
                        }).map(function (filepath) {
                            return _this.grunt.file.read(filepath);
                        }).join(_this.grunt.util.normalizelf(options.separator));

                        src += options.punctuation;

                        _this.grunt.file.write(f.dest, src);

                        _this.grunt.log.writeln('File "' + f.dest + '" created.');
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
	bowerVersionCheck.registerTask();
}
