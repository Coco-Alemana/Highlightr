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
    'concat_with_separator', 'concat', 'contains', 'ends_with', 'greatest', 'least', 
    'from_base64', 'length', 'lower', 'md5_hash', 'regex_extract_pattern', 
    'regex_extract_all_patterns', 'regex_replace', 'regex_split', 'sha256_hash', 
    'split', 'to_base64', 'trim', 'trim_clean', 'upper', 'levenshtein_distance', 
    'hamming_distance',
    
    // Numeric scalar functions
    'abs', 'acos', 'asin', 'atan', 'atan2', 'cbrt', 'ceiling', 'cos', 'degrees', 
    'exp', 'floor', 'is_finite', 'is_infinite', 'is_nan', 'ln', 'log', 'log2', 
    'pi', 'radians', 'random', 'round', 'power', 'sign', 'sin', 'sqrt', 'tan', 
    'truncate', 'sinh', 'cosh', 'tanh', 'e', 'z_score',
    
    // Numeric aggregate functions
    'correlation', 'population_covariance', 'sample_covariance', 'population_kurtosis',
    'median', 'regression_intercept', 'regression_slope', 'skewness',
    'population_standard_deviation', 'sample_standard_deviation', 'population_variance',
    'sample_variance', 'average', 'geometric_mean', 'max', 'min', 'sum', 'product', 'count',
    
    // Generic aggregate functions
    'first_value', 'last_value', 'any_value',
    
    // Date functions
    'day', 'day_of_week', 'day_of_year', 'hour', 'microsecond', 'millisecond',
    'minute', 'month', 'quarter', 'second', 'timezone_hour', 'timezone_minute',
    'week', 'year'
  ].join('|');

  const TYPES =
    'BIGINT BIT BLOB BOOLEAN DATE DECIMAL DOUBLE FLOAT HUGEINT INTEGER INTERVAL JSON SMALLINT TIME TIMESTAMP TINYINT UBIGINT UHUGEINT UINTEGER USMALLINT UTINYINT UUID STRING ' +
    'ARRAY LIST MAP STRUCT UNION';
  const TYPES_RE =
    TYPES.trim()
      .split(' ')
      .map(function(val) { return val.split('|')[0]; })
      .join('|');

  return {
    name: 'CocoSQL',
    aliases: ['cocosql'],
    case_insensitive: true,
    keywords: {
      keyword: SQL_KW,
      built_in: SQL_BI
    },
    contains: [
      // Function calls
      {
        begin: '\\b(' + FUNCTIONS + ')\\s*\\(',
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