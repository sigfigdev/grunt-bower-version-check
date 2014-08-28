module bower.list {
	export interface List extends Dependency {
	}

	export interface Dependency {
		endpoint:     Endpoint;
		canonicalDir: string;
		pkgMeta:      PkgMeta;
		dependencies: Dependencies;
		nrDependants: number;
		versions:     string[];
		linked:       boolean;
		extraneous:   boolean;
		incompatible: boolean;
		update:       Update;
	}

	export interface Update {
		target: string /* version */;
		latest: string /* version */;
	}

	export interface Endpoint {
		name:   string;
		source: string;
		target: string /* version pattern */;
	}

	export interface PkgMeta {
		name:            string;
		version?:        string;
		dependencies:    DependenciesConfig;
		devDependencies: DependenciesConfig;
		_resolution:     Resolution;
	}

	export interface Resolution {
		type:   string;
		branch: string;
		commit: string /* hash */;
	}

	export interface DependenciesConfig {
		[name: string]: string /* version or URL */;
	}

	export interface Dependencies {
		[name: string]: Dependency;
	}
}
