/*
 * grunt-bower-version-check
 * https://github.com/anchann/grunt-bower-version-check
 *
 * Copyright (c) 2014 anchann
 * Licensed under the MIT license.
 */
import gruntjs = grunt;

module anchann.grunt.bowerVersionCheck {
	import AsyncResultCatcher = gruntjs.task.AsyncResultCatcher;
	import IMultiTask         = gruntjs.task.IMultiTask;

	interface BowerList {
	}

	export class BowerVersionCheck {
		constructor(private grunt: IGrunt) {
		}

		private getBowerList(): Q.Promise<BowerList> {
			var deferred: Q.Deferred<BowerList> = q.defer<BowerList>();

			this.grunt.util.spawn({
				cmd:  "bower",
				args: ["list", "--json"]
				}, (error: Error, result: gruntjs.util.ISpawnResult, code: number): void => {
					if (code === 0) {
						deferred.resolve(JSON.parse(result.stdout));
					}
					else {
						deferred.reject("Failed to get bower list: " + error);
					}
				}
			);

			return deferred.promise;
		}

		public registerTask(): void {
			var theThis = this;

			this.grunt.registerMultiTask(
				"bower_version_check",
				"Check versions of bower components against bower.json and bail on (or otherwise handle) mismatches.",
				// we explicitly don't want this binding, so using non-ts function literal syntax
				function() {
					var task: IMultiTask = this;
					theThis.run.call(theThis, task);
				}
			);
		}

		public run(task: IMultiTask): void {
			var done: AsyncResultCatcher = task.async();

			this.getBowerList().then((list: BowerList): void => {
				console.log(list);
				done(true);
			});

			// Merge task-specific and/or target-specific options with these defaults.
			var options: any = task.options({
				punctuation: '.',
				separator: ', '
			});

			// Iterate over all specified file groups.
			task.files.forEach((f) => {
				// Concat specified files.
				var src = f.src.filter((filepath) => {
					// Warn on and remove invalid source files (if nonull was set).
					if (!this.grunt.file.exists(filepath)) {
						this.grunt.log.warn('Source file "' + filepath + '" not found.');
						return false;
					} else {
						return true;
					}
				}).map((filepath) => {
					// Read file source.
					return this.grunt.file.read(filepath);
				}).join(this.grunt.util.normalizelf(options.separator));

				// Handle options.
				src += options.punctuation;

				// Write the destination file.
				this.grunt.file.write(f.dest, src);

				// Print a success message.
				this.grunt.log.writeln('File "' + f.dest + '" created.');
			});
		}
	}
}
