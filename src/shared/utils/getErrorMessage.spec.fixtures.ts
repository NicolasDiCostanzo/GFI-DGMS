const OBJECT_VALUE = { key: 'value' };

export const ERROR_MESSAGE_CASES: ReadonlyArray<[title: string, input: unknown, expected: string]> =
    [
        [
            'extracts message from Error instances',
            new Error('Something went wrong'),
            'Something went wrong',
        ],
        ['converts non-Error values to string', 'just a string', 'just a string'],
        ['converts objects to their string representation', OBJECT_VALUE, String(OBJECT_VALUE)],
        ['converts null to string', null, 'null'],
        ['converts numbers to string', 42, '42'],
    ];
