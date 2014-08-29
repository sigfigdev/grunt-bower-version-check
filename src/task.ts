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
	import ITask              = gruntjs.task.ITask;
	import List               = bower.list.List;
	import Dependency         = bower.list.Dependency;

	interface Options {
		ignoreExtraneous:                           boolean;
		attemptHashVersionIncompatibilityDetection: boolean;
	}

	var /* final */ DEFAULT_OPTIONS: Options = {
		ignoreExtraneous:                           false,
		attemptHashVersionIncompatibilityDetection: true,
	}

	export class BowerVersionCheck {
		constructor(private grunt: IGrunt) {
		}

		private getBowerList(): Q.Promise<List> {
			var deferred: Q.Deferred<List> = q.defer<List>();

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

			this.grunt.registerTask(
				"bowerVersionCheck",
				"Check versions of bower components against bower.json and bail on (or otherwise handle) mismatches.",
				// we explicitly don't want this binding, so using non-ts function literal syntax
				function() {
					var task: ITask = this;
					theThis.run.call(theThis, task);
				}
			);
		}

		public run(task: ITask): void {
			var options: Options = task.options<Options>(DEFAULT_OPTIONS);
			var done: AsyncResultCatcher = task.async();

			this.getBowerList()
			.then((list: List): void => {
				var failed: boolean = false;

				_.each(list.dependencies, (dependency: Dependency): void => {
					if (!options.ignoreExtraneous && dependency.extraneous) {
						this.grunt.log.error("Extraneous dependency: " + dependency.pkgMeta.name);
						failed = true;
					}

					if (dependency.incompatible) {
						this.grunt.log.error(
							"Incompatible dependency" +
							(dependency.linked ? " (linked)" : "") +
							": " + dependency.pkgMeta.name + ". " +
							"Required " + dependency.endpoint.target + " but found " + dependency.pkgMeta.version);
						failed = true;
					}

					if (options.attemptHashVersionIncompatibilityDetection && BowerVersionCheck.isHashVersioned(dependency)) {
						var actualHashVersion: string = BowerVersionCheck.getActualHashVersion(dependency);

						if (dependency.endpoint.target !== actualHashVersion) {
							this.grunt.log.error(
								"Incompatible dependency" +
								(dependency.linked ? " (linked)" : "") +
								": " + dependency.pkgMeta.name + ". " +
								"Required " + dependency.endpoint.target + " but found " + actualHashVersion);
							failed = true;
						}
					}
				});

				done(!failed);
			})
			.catch((reason: any): void => {
				this.grunt.log.error("Failed to get the output of `bower list` with the following error:");
				this.grunt.log.error(reason);
				done(false);
			});
		}

		private static isHashVersioned(dependency: Dependency): boolean {
			return dependency.endpoint.target.length === 40 &&
				dependency.endpoint.source.substr(-4) === ".git";
		}

		private static getActualHashVersion(dependency: Dependency): string {
			return (dependency.pkgMeta._resolution && dependency.pkgMeta._resolution.commit)
				|| undefined;
		}
	}
}
