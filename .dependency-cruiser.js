/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-circular',
            severity: 'warn',
            comment:
                'This dependency is part of a circular relationship. ' +
                'You might want to revise your solution (i.e. break the cycle) ' +
                'or suppress the warning if appropriate.',
            from: {},
            to: {
                circular: true,
            },
        },
        {
            name: 'no-orphans',
            comment:
                "This is an orphan module - it's likely not used (anymore). " +
                'Either use it or remove it.',
            severity: 'warn',
            from: {
                orphan: true,
                pathNot: '\\.d\\.ts$|^src/main\\.ts$',
            },
            to: {},
        },
        {
            name: 'no-deprecated-core',
            comment:
                'A module depends on a node core module that has been deprecated. ' +
                'Find an alternative - these are bound to exist - and update your dependencies.',
            severity: 'warn',
            from: {},
            to: {
                dependencyTypes: ['core'],
                path: [
                    '^(v8/tools/codemap)$',
                ],
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