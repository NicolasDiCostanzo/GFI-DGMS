/** @type {import('dependency-cruiser').IConfiguration} */
export default {
    forbidden: [
        {
            name: 'no-circular',
            severity: 'error',
            comment:
                'This dependency is part of a circular relationship. ' +
                'You might want to revise your solution (i.e. break the cycle) ' +
                'or suppress the warning if appropriate.',
            from: {},
            to: {
                circular: true,
            },
        },
        // {
        //     name: 'no-orphans',
        //     comment:
        //         "This is an orphan module - it's likely not used (anymore). " +
        //         'Either use it or remove it.',
        //     severity: 'error',
        //     from: {
        //         orphan: true,
        //         pathNot: '\\.d\\.ts$|^src/main\\.ts$',
        //     },
        //     to: {},
        // },
        {
            name: 'no-deprecated-core',
            comment:
                'A module depends on a node core module that has been deprecated. ' +
                'Find an alternative - these are bound to exist - and update your dependencies.',
            severity: 'error',
            from: {},
            to: {
                dependencyTypes: ['core'],
                path: [
                    '^(v8/tools/codemap)$',
                ],
            },
        },
        {
            name: 'domain-not-import-infrastructure',
            comment:
                'Domain layer must not depend on infrastructure layer. ' +
                'Domain should be pure business logic with no external concerns.',
            severity: 'error',
            from: {
                path: '^src/[^/]+/domain/',
            },
            to: {
                path: '^src/[^/]+/infrastructure/',
            },
        },
        {
            name: 'domain-not-import-app',
            comment:
                'Domain layer must not depend on application layer. ' +
                'Domain should be independent of use-case orchestration.',
            severity: 'error',
            from: {
                path: '^src/[^/]+/domain/',
            },
            to: {
                path: '^src/[^/]+/app/',
            },
        },
        {
            name: 'domain-not-import-vue',
            comment:
                'Domain layer must not depend on Vue framework. ' +
                'Domain should be pure TypeScript with no framework coupling.',
            severity: 'error',
            from: {
                path: '^src/[^/]+/domain/',
            },
            to: {
                path: '^vue$',
            },
        },
        {
            name: 'app-not-import-infrastructure',
            comment:
                'Application layer must not depend on infrastructure layer. ' +
                'Application should depend on abstractions (ports), not concrete implementations.',
            severity: 'error',
            from: {
                path: '^src/[^/]+/app/',
            },
            to: {
                path: '^src/[^/]+/infrastructure/',
            },
        },
    ],
    options: {
        doNotFollow: {
            path: 'node_modules',
        },
        exclude: {
            path: '\\.(spec|test)\\.ts$',
        },
        includeOnly: '^src',
        tsPreCompilationDeps: true,
        tsConfig: {
            fileName: 'tsconfig.json',
        },
        enhancedResolveOptions: {
            exportsFields: ['exports'],
            conditionNames: ['import', 'require', 'node', 'default'],
        },
        reporterOptions: {
            dot: {
                collapsePattern: 'node_modules/[^/]+',
            },
            archi: {
                collapsePattern:
                    '^(node_modules|packages|src/lib|src/utils|src/types)',
            },
        },
    },
};
