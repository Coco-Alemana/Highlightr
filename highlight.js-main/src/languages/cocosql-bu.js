/*
Language: CocoSQL

Category: database

Website: www.cocoalemana.com


*/

export default function(hljs) {
  const COMMENT_MODE = hljs.COMMENT('--', '$');
  const UNQUOTED_IDENT = '[a-zA-Z_][a-zA-Z_0-9$]*';
  const DOLLAR_STRING = '\\$([a-zA-Z_]?|[a-zA-Z_][a-zA-Z_0-9]*)\\$';
  const LABEL = '<<\\s*' + UNQUOTED_IDENT + '\\s*>>';

  // Core SQL keywords (removes a lot of DB management keywords as those are not supported in CocoSQL)
  const SQL_KW = 
    // DML keywords
    'SELECT FROM WHERE GROUP BY HAVING ORDER LIMIT OFFSET '
    + 'INSERT INTO VALUES '
    + 'UPDATE SET '
    + 'DELETE '
    // Expression and flow control keywords
    + 'AND OR NOT IN EXISTS '
    + 'CASE WHEN THEN ELSE END '
    + 'IS NULL TRUE FALSE '
    + 'ASC DESC BETWEEN '
    + 'LIKE ILIKE SIMILAR TO '
    + 'AS CAST '
    // Join related
    + 'JOIN INNER LEFT RIGHT FULL OUTER CROSS ON USING '
    // Set operations
    + 'UNION ALL INTERSECT EXCEPT '
    // Window functions
    + 'OVER PARTITION ROWS RANGE PRECEDING FOLLOWING CURRENT ROW '
    + 'FIRST_VALUE LAST_VALUE LAG LEAD NTH_VALUE '
    + 'RANK DENSE_RANK ROW_NUMBER '
    // Subquery related
    + 'ANY SOME ALL ';

  // Built-in identifiers
  const SQL_BI = 
    'CURRENT_TIME CURRENT_TIMESTAMP CURRENT_DATE ';

  // Your custom functions combined
  const FUNCTIONS = [
    // String functions
  'CONCAT_WITH_SEPARATOR', 'CONCAT', 'CONTAINS', 'ENDS_WITH', 'GREATEST', 'LEAST',
  'FROM_BASE64', 'LENGTH', 'LOWER', 'MD5_HASH', 'REGEX_EXTRACT_PATTERN',
  'REGEX_EXTRACT_ALL_PATTERNS', 'REGEX_REPLACE', 'REGEX_SPLIT', 'SHA256_HASH',
  'SPLIT', 'TO_BASE64', 'TRIM', 'TRIM_CLEAN', 'UPPER', 'LEVENSHTEIN_DISTANCE',
  'HAMMING_DISTANCE',
  // Numeric scalar functions
  'ABS', 'ACOS', 'ASIN', 'ATAN', 'ATAN2', 'CBRT', 'CEILING', 'COS', 'DEGREES',
  'EXP', 'FLOOR', 'IS_FINITE', 'IS_INFINITE', 'IS_NAN', 'LN', 'LOG', 'LOG2',
  'PI', 'RADIANS', 'RANDOM', 'ROUND', 'POWER', 'SIGN', 'SIN', 'SQRT', 'TAN',
  'TRUNCATE', 'SINH', 'COSH', 'TANH', 'E', 'Z_SCORE',
  // Numeric aggregate functions
  'CORRELATION', 'POPULATION_COVARIANCE', 'SAMPLE_COVARIANCE', 'POPULATION_KURTOSIS',
  'MEDIAN', 'REGRESSION_INTERCEPT', 'REGRESSION_SLOPE', 'SKEWNESS',
  'POPULATION_STANDARD_DEVIATION', 'SAMPLE_STANDARD_DEVIATION', 'POPULATION_VARIANCE',
  'SAMPLE_VARIANCE', 'AVERAGE', 'GEOMETRIC_MEAN', 'MAX', 'MIN', 'SUM', 'PRODUCT', 'COUNT',
  // Generic aggregate functions
  'FIRST_VALUE', 'LAST_VALUE', 'ANY_VALUE',
  // Date functions
  'DAY', 'DAY_OF_WEEK', 'DAY_OF_YEAR', 'HOUR', 'MICROSECOND', 'MILLISECOND',
  'MINUTE', 'MONTH', 'QUARTER', 'SECOND', 'TIMEZONE_HOUR', 'TIMEZONE_MINUTE',
  'WEEK', 'YEAR'
  ].join('|');

  const FUNCTIONS_RE =
      FUNCTIONS.trim()
        .split(' ')
        .map(function(val) { return val.split('|')[0]; })
        .join('|');

  const TYPES =
    'BIGINT BIT BLOB BOOLEAN DATE DECIMAL DOUBLE FLOAT HUGEINT INTEGER INTERVAL JSON SMALLINT TIME TIMESTAMP TINYINT UBIGINT UHUGEINT UINTEGER USMALLINT UTINYINT UUID STRING ' +
    'ARRAY LIST MAP STRUCT UNION';
  const TYPES_RE =
    TYPES.trim()
      .split(' ')
      .map(function(val) { return val.split('|')[0]; })
      .join('|');

  return {
    name: 'coco-sql-old',
    aliases: ['cocosql-old'],
    case_insensitive: true,
    keywords: {
      keyword: SQL_KW,
      built_in: SQL_BI
    },
    contains: [
      // Function calls
      {
        begin: '\\b(' + FUNCTIONS_RE + ')\\s*\\(',
        returnBegin: true,
        returnEnd: true,
        end: '\\)',
        className: 'built_in'
      },
      // Types
      {
        className: 'type',
        begin: '\\b(' + TYPES_RE + ')\\b'
      },
      // Strings
      {
        className: 'string',
        begin: '\'',
        end: '\'',
        contains: [{ begin: '\'\'' }]
      },
      // Dollar-quoted strings
      hljs.END_SAME_AS_BEGIN({
        begin: DOLLAR_STRING,
        end: DOLLAR_STRING,
        contains: [
          {
            subLanguage: ['sql', 'json'],
            endsWithParent: true
          }
        ]
      }),
      // Identifiers in quotes
      {
        begin: '"',
        end: '"',
        contains: [{ begin: '""' }]
      },
      // Numbers
      hljs.C_NUMBER_MODE,
      // Comments
      hljs.C_BLOCK_COMMENT_MODE,
      COMMENT_MODE,
      // Labels
      {
        className: 'symbol',
        begin: LABEL
      }
    ]
  };
}