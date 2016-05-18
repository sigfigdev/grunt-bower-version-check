var _ = require("lodash");
var q = require("q");

var grunt = "we don't use this variable, but only need it for typechecking when we import gruntjs = grunt";

var gruntjs = grunt;
var anchann;
(function (anchann) {
    var grunt;
    (function (grunt_1) {
        var bowerVersionCheck;
        (function (bowerVersionCheck) {
            var DEFAULT_OPTIONS = {
                ignoreExtraneous: false,
                attemptHashVersionIncompatibilityDetection: true,
                bowerAllowRoot: false,
            };
            var BowerVersionCheck = (function () {
                function BowerVersionCheck(grunt) {
                    this.grunt = grunt;
                }
                BowerVersionCheck.prototype.getBowerList = function (allowRoot) {
                    if (allowRoot === void 0) { allowRoot = false; }
                    var deferred = q.defer();
                    var args = ["list", "--json"];
                    if (allowRoot) {
                        args.push("--allow-root");
                    }
                    this.grunt.util.spawn({
                        cmd: "bower",
                        args: args,
                    }, function (error, result, code) {
                        if (code === 0) {
                            deferred.resolve(JSON.parse(result.stdout));
                        }
                        else {
                            deferred.reject("Failed to get bower list: " + error);
                        }
                    });
                    return deferred.promise;
                };
                BowerVersionCheck.prototype.registerTask = function () {
                    var theThis = this;
                    this.grunt.registerTask("bowerVersionCheck", "Check versions of bower components against bower.json and bail on (or otherwise handle) mismatches.", function () {
                        var task = this;
                        theThis.run.call(theThis, task);
                    });
                };
                BowerVersionCheck.prototype.run = function (task) {
                    var _this = this;
                    var options = task.options(DEFAULT_OPTIONS);
                    var done = task.async();
                    this.getBowerList(options.bowerAllowRoot)
                        .then(function (list) {
                        var failed = false;
                        _.each(list.dependencies, function (dependency) {
                            if (!options.ignoreExtraneous && dependency.extraneous) {
                                _this.grunt.log.error("Extraneous dependency: " + dependency.pkgMeta.name);
                                failed = true;
                            }
                            if (dependency.incompatible) {
                                _this.grunt.log.error("Incompatible dependency" +
                                    (dependency.linked ? " (linked)" : "") +
                                    ": " + dependency.pkgMeta.name + ". " +
                                    "Required " + dependency.endpoint.target + " but found " + dependency.pkgMeta.version);
                                failed = true;
                            }
                            if (dependency.missing) {
                                _this.grunt.log.error("Missing dependency: " + dependency.endpoint.name + ". " +
                                    "Required " + dependency.endpoint.target);
                                failed = true;
                            }
                            if (options.attemptHashVersionIncompatibilityDetection && BowerVersionCheck.isHashVersioned(dependency)) {
                                var actualHashVersion = BowerVersionCheck.getActualHashVersion(dependency);
                                if (dependency.endpoint.target !== actualHashVersion) {
                                    _this.grunt.log.error("Incompatible dependency" +
                                        (dependency.linked ? " (linked)" : "") +
                                        ": " + dependency.pkgMeta.name + ". " +
                                        "Required " + dependency.endpoint.target + " but found " + actualHashVersion);
                                    failed = true;
                                }
                            }
                        });
                        done(!failed);
                    })
                        .catch(function (reason) {
                        _this.grunt.log.error("Failed to get the output of `bower list` with the following error:");
                        _this.grunt.log.error(reason);
                        done(false);
                    });
                };
                BowerVersionCheck.isHashVersioned = function (dependency) {
                    return dependency.endpoint.target.length === 40 &&
                        dependency.endpoint.source.substr(-4) === ".git";
                };
                BowerVersionCheck.getActualHashVersion = function (dependency) {
                    return (dependency.pkgMeta._resolution && dependency.pkgMeta._resolution.commit)
                        || undefined;
                };
                return BowerVersionCheck;
            }());
            bowerVersionCheck.BowerVersionCheck = BowerVersionCheck;
        })(bowerVersionCheck = grunt_1.bowerVersionCheck || (grunt_1.bowerVersionCheck = {}));
    })(grunt = anchann.grunt || (anchann.grunt = {}));
})(anchann || (anchann = {}));
//# sourceMappingURL=tslib.js.map
module.exports = function(grunt) {
	var bowerVersionCheck = new anchann.grunt.bowerVersionCheck.BowerVersionCheck(grunt);
	bowerVersionCheck.registerTask();
}
