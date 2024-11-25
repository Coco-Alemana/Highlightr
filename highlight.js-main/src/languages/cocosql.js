/*
Language: PostgreSQL and PL/pgSQL
Author: Egor Rogov (e.rogov@postgrespro.ru)
Website: https://www.postgresql.org/docs/11/sql.html
Description:
    This language incorporates both PostgreSQL SQL dialect and PL/pgSQL language.
    It is based on PostgreSQL version 11. Some notes:
    - Text in double-dollar-strings is _always_ interpreted as some programming code. Text
      in ordinary quotes is _never_ interpreted that way and highlighted just as a string.
    - There are quite a bit "special cases". That's because many keywords are not strictly
      they are keywords in some contexts and ordinary identifiers in others. Only some
      of such cases are handled; you still can get some of your identifiers highlighted
      wrong way.
    - Function names deliberately are not highlighted. There is no way to tell function
      call from other constructs, hence we can't highlight _all_ function names. And
      some names highlighted while others not looks ugly.
Category: database
*/

export default function(hljs) {
  const COMMENT_MODE = hljs.COMMENT('--', '$');
  const UNQUOTED_IDENT = '[a-zA-Z_][a-zA-Z_0-9$]*';
  const DOLLAR_STRING = '\\$([a-zA-Z_]?|[a-zA-Z_][a-zA-Z_0-9]*)\\$';
  const LABEL = '<<\\s*' + UNQUOTED_IDENT + '\\s*>>';

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

  const ROLE_ATTRS = // only those not in keywrods already
    'SUPERUSER NOSUPERUSER CREATEDB NOCREATEDB CREATEROLE NOCREATEROLE INHERIT NOINHERIT '
    + 'LOGIN NOLOGIN REPLICATION NOREPLICATION BYPASSRLS NOBYPASSRLS ';

  const PLPGSQL_KW =
    'ALIAS BEGIN CONSTANT DECLARE END EXCEPTION RETURN PERFORM|10 RAISE GET DIAGNOSTICS '
    + 'STACKED|10 FOREACH LOOP ELSIF EXIT WHILE REVERSE SLICE DEBUG LOG INFO NOTICE WARNING ASSERT '
    + 'OPEN ';

  // const TYPES =
  //   // https://www.postgresql.org/docs/11/static/datatype.html
  //   'BIGINT INT8 BIGSERIAL SERIAL8 BIT VARYING VARBIT BOOLEAN BOOL BOX BYTEA CHARACTER CHAR VARCHAR '
  //   + 'CIDR CIRCLE DATE DOUBLE PRECISION FLOAT8 FLOAT INET INTEGER INT INT4 INTERVAL JSON JSONB LINE LSEG|10 '
  //   + 'MACADDR MACADDR8 MONEY NUMERIC DEC DECIMAL PATH POINT POLYGON REAL FLOAT4 SMALLINT INT2 '
  //   + 'SMALLSERIAL|10 SERIAL2|10 SERIAL|10 SERIAL4|10 TEXT TIME ZONE TIMETZ|10 TIMESTAMP TIMESTAMPTZ|10 TSQUERY|10 TSVECTOR|10 '
  //   + 'TXID_SNAPSHOT|10 UUID XML NATIONAL NCHAR '
  //   + 'INT4RANGE|10 INT8RANGE|10 NUMRANGE|10 TSRANGE|10 TSTZRANGE|10 DATERANGE|10 '
  //   // pseudotypes
  //   + 'ANYELEMENT ANYARRAY ANYNONARRAY ANYENUM ANYRANGE CSTRING INTERNAL '
  //   + 'RECORD PG_DDL_COMMAND VOID UNKNOWN OPAQUE REFCURSOR '
  //   // spec. type
  //   + 'NAME '
  //   // OID-types
  //   + 'OID REGPROC|10 REGPROCEDURE|10 REGOPER|10 REGOPERATOR|10 REGCLASS|10 REGTYPE|10 REGROLE|10 '
  //   + 'REGNAMESPACE|10 REGCONFIG|10 REGDICTIONARY|10 ';// +
  // // some types from standard extensions
  // 'HSTORE|10 LO LTREE|10 ';
  const TYPES =
    'BIGINT BIT BLOB BOOLEAN DATE DECIMAL DOUBLE FLOAT HUGEINT INTEGER INTERVAL JSON SMALLINT TIME TIMESTAMP TINYINT UBIGINT UHUGEINT UINTEGER USMALLINT UTINYINT UUID STRING ' +
    'ARRAY LIST MAP STRUCT UNION';

  const TYPES_RE =
    TYPES.trim()
      .split(' ')
      .map(function(val) { return val.split('|')[0]; })
      .join('|');

  const SQL_BI =
    'CURRENT_TIME CURRENT_TIMESTAMP CURRENT_USER CURRENT_CATALOG|10 CURRENT_DATE LOCALTIME LOCALTIMESTAMP '
    + 'CURRENT_ROLE|10 CURRENT_SCHEMA|10 SESSION_USER PUBLIC ';

  const PLPGSQL_BI =
    'FOUND NEW OLD TG_NAME|10 TG_WHEN|10 TG_LEVEL|10 TG_OP|10 TG_RELID|10 TG_RELNAME|10 '
    + 'TG_TABLE_NAME|10 TG_TABLE_SCHEMA|10 TG_NARGS|10 TG_ARGV|10 TG_EVENT|10 TG_TAG|10 '
    // get diagnostics
    + 'ROW_COUNT RESULT_OID|10 PG_CONTEXT|10 RETURNED_SQLSTATE COLUMN_NAME CONSTRAINT_NAME '
    + 'PG_DATATYPE_NAME|10 MESSAGE_TEXT TABLE_NAME SCHEMA_NAME PG_EXCEPTION_DETAIL|10 '
    + 'PG_EXCEPTION_HINT|10 PG_EXCEPTION_CONTEXT|10 ';

  const PLPGSQL_EXCEPTIONS =
    // exceptions https://www.postgresql.org/docs/current/static/errcodes-appendix.html
    'SQLSTATE SQLERRM|10 '
    + 'SUCCESSFUL_COMPLETION WARNING DYNAMIC_RESULT_SETS_RETURNED IMPLICIT_ZERO_BIT_PADDING '
    + 'NULL_VALUE_ELIMINATED_IN_SET_FUNCTION PRIVILEGE_NOT_GRANTED PRIVILEGE_NOT_REVOKED '
    + 'STRING_DATA_RIGHT_TRUNCATION DEPRECATED_FEATURE NO_DATA NO_ADDITIONAL_DYNAMIC_RESULT_SETS_RETURNED '
    + 'SQL_STATEMENT_NOT_YET_COMPLETE CONNECTION_EXCEPTION CONNECTION_DOES_NOT_EXIST CONNECTION_FAILURE '
    + 'SQLCLIENT_UNABLE_TO_ESTABLISH_SQLCONNECTION SQLSERVER_REJECTED_ESTABLISHMENT_OF_SQLCONNECTION '
    + 'TRANSACTION_RESOLUTION_UNKNOWN PROTOCOL_VIOLATION TRIGGERED_ACTION_EXCEPTION FEATURE_NOT_SUPPORTED '
    + 'INVALID_TRANSACTION_INITIATION LOCATOR_EXCEPTION INVALID_LOCATOR_SPECIFICATION INVALID_GRANTOR '
    + 'INVALID_GRANT_OPERATION INVALID_ROLE_SPECIFICATION DIAGNOSTICS_EXCEPTION '
    + 'STACKED_DIAGNOSTICS_ACCESSED_WITHOUT_ACTIVE_HANDLER CASE_NOT_FOUND CARDINALITY_VIOLATION '
    + 'DATA_EXCEPTION ARRAY_SUBSCRIPT_ERROR CHARACTER_NOT_IN_REPERTOIRE DATETIME_FIELD_OVERFLOW '
    + 'DIVISION_BY_ZERO ERROR_IN_ASSIGNMENT ESCAPE_CHARACTER_CONFLICT INDICATOR_OVERFLOW '
    + 'INTERVAL_FIELD_OVERFLOW INVALID_ARGUMENT_FOR_LOGARITHM INVALID_ARGUMENT_FOR_NTILE_FUNCTION '
    + 'INVALID_ARGUMENT_FOR_NTH_VALUE_FUNCTION INVALID_ARGUMENT_FOR_POWER_FUNCTION '
    + 'INVALID_ARGUMENT_FOR_WIDTH_BUCKET_FUNCTION INVALID_CHARACTER_VALUE_FOR_CAST '
    + 'INVALID_DATETIME_FORMAT INVALID_ESCAPE_CHARACTER INVALID_ESCAPE_OCTET INVALID_ESCAPE_SEQUENCE '
    + 'NONSTANDARD_USE_OF_ESCAPE_CHARACTER INVALID_INDICATOR_PARAMETER_VALUE INVALID_PARAMETER_VALUE '
    + 'INVALID_REGULAR_EXPRESSION INVALID_ROW_COUNT_IN_LIMIT_CLAUSE '
    + 'INVALID_ROW_COUNT_IN_RESULT_OFFSET_CLAUSE INVALID_TABLESAMPLE_ARGUMENT INVALID_TABLESAMPLE_REPEAT '
    + 'INVALID_TIME_ZONE_DISPLACEMENT_VALUE INVALID_USE_OF_ESCAPE_CHARACTER MOST_SPECIFIC_TYPE_MISMATCH '
    + 'NULL_VALUE_NOT_ALLOWED NULL_VALUE_NO_INDICATOR_PARAMETER NUMERIC_VALUE_OUT_OF_RANGE '
    + 'SEQUENCE_GENERATOR_LIMIT_EXCEEDED STRING_DATA_LENGTH_MISMATCH STRING_DATA_RIGHT_TRUNCATION '
    + 'SUBSTRING_ERROR TRIM_ERROR UNTERMINATED_C_STRING ZERO_LENGTH_CHARACTER_STRING '
    + 'FLOATING_POINT_EXCEPTION INVALID_TEXT_REPRESENTATION INVALID_BINARY_REPRESENTATION '
    + 'BAD_COPY_FILE_FORMAT UNTRANSLATABLE_CHARACTER NOT_AN_XML_DOCUMENT INVALID_XML_DOCUMENT '
    + 'INVALID_XML_CONTENT INVALID_XML_COMMENT INVALID_XML_PROCESSING_INSTRUCTION '
    + 'INTEGRITY_CONSTRAINT_VIOLATION RESTRICT_VIOLATION NOT_NULL_VIOLATION FOREIGN_KEY_VIOLATION '
    + 'UNIQUE_VIOLATION CHECK_VIOLATION EXCLUSION_VIOLATION INVALID_CURSOR_STATE '
    + 'INVALID_TRANSACTION_STATE ACTIVE_SQL_TRANSACTION BRANCH_TRANSACTION_ALREADY_ACTIVE '
    + 'HELD_CURSOR_REQUIRES_SAME_ISOLATION_LEVEL INAPPROPRIATE_ACCESS_MODE_FOR_BRANCH_TRANSACTION '
    + 'INAPPROPRIATE_ISOLATION_LEVEL_FOR_BRANCH_TRANSACTION '
    + 'NO_ACTIVE_SQL_TRANSACTION_FOR_BRANCH_TRANSACTION READ_ONLY_SQL_TRANSACTION '
    + 'SCHEMA_AND_DATA_STATEMENT_MIXING_NOT_SUPPORTED NO_ACTIVE_SQL_TRANSACTION '
    + 'IN_FAILED_SQL_TRANSACTION IDLE_IN_TRANSACTION_SESSION_TIMEOUT INVALID_SQL_STATEMENT_NAME '
    + 'TRIGGERED_DATA_CHANGE_VIOLATION INVALID_AUTHORIZATION_SPECIFICATION INVALID_PASSWORD '
    + 'DEPENDENT_PRIVILEGE_DESCRIPTORS_STILL_EXIST DEPENDENT_OBJECTS_STILL_EXIST '
    + 'INVALID_TRANSACTION_TERMINATION SQL_ROUTINE_EXCEPTION FUNCTION_EXECUTED_NO_RETURN_STATEMENT '
    + 'MODIFYING_SQL_DATA_NOT_PERMITTED PROHIBITED_SQL_STATEMENT_ATTEMPTED '
    + 'READING_SQL_DATA_NOT_PERMITTED INVALID_CURSOR_NAME EXTERNAL_ROUTINE_EXCEPTION '
    + 'CONTAINING_SQL_NOT_PERMITTED MODIFYING_SQL_DATA_NOT_PERMITTED '
    + 'PROHIBITED_SQL_STATEMENT_ATTEMPTED READING_SQL_DATA_NOT_PERMITTED '
    + 'EXTERNAL_ROUTINE_INVOCATION_EXCEPTION INVALID_SQLSTATE_RETURNED NULL_VALUE_NOT_ALLOWED '
    + 'TRIGGER_PROTOCOL_VIOLATED SRF_PROTOCOL_VIOLATED EVENT_TRIGGER_PROTOCOL_VIOLATED '
    + 'SAVEPOINT_EXCEPTION INVALID_SAVEPOINT_SPECIFICATION INVALID_CATALOG_NAME '
    + 'INVALID_SCHEMA_NAME TRANSACTION_ROLLBACK TRANSACTION_INTEGRITY_CONSTRAINT_VIOLATION '
    + 'SERIALIZATION_FAILURE STATEMENT_COMPLETION_UNKNOWN DEADLOCK_DETECTED '
    + 'SYNTAX_ERROR_OR_ACCESS_RULE_VIOLATION SYNTAX_ERROR INSUFFICIENT_PRIVILEGE CANNOT_COERCE '
    + 'GROUPING_ERROR WINDOWING_ERROR INVALID_RECURSION INVALID_FOREIGN_KEY INVALID_NAME '
    + 'NAME_TOO_LONG RESERVED_NAME DATATYPE_MISMATCH INDETERMINATE_DATATYPE COLLATION_MISMATCH '
    + 'INDETERMINATE_COLLATION WRONG_OBJECT_TYPE GENERATED_ALWAYS UNDEFINED_COLUMN '
    + 'UNDEFINED_FUNCTION UNDEFINED_TABLE UNDEFINED_PARAMETER UNDEFINED_OBJECT '
    + 'DUPLICATE_COLUMN DUPLICATE_CURSOR DUPLICATE_DATABASE DUPLICATE_FUNCTION '
    + 'DUPLICATE_PREPARED_STATEMENT DUPLICATE_SCHEMA DUPLICATE_TABLE DUPLICATE_ALIAS '
    + 'DUPLICATE_OBJECT AMBIGUOUS_COLUMN AMBIGUOUS_FUNCTION AMBIGUOUS_PARAMETER AMBIGUOUS_ALIAS '
    + 'INVALID_COLUMN_REFERENCE INVALID_COLUMN_DEFINITION INVALID_CURSOR_DEFINITION '
    + 'INVALID_DATABASE_DEFINITION INVALID_FUNCTION_DEFINITION '
    + 'INVALID_PREPARED_STATEMENT_DEFINITION INVALID_SCHEMA_DEFINITION INVALID_TABLE_DEFINITION '
    + 'INVALID_OBJECT_DEFINITION WITH_CHECK_OPTION_VIOLATION INSUFFICIENT_RESOURCES DISK_FULL '
    + 'OUT_OF_MEMORY TOO_MANY_CONNECTIONS CONFIGURATION_LIMIT_EXCEEDED PROGRAM_LIMIT_EXCEEDED '
    + 'STATEMENT_TOO_COMPLEX TOO_MANY_COLUMNS TOO_MANY_ARGUMENTS OBJECT_NOT_IN_PREREQUISITE_STATE '
    + 'OBJECT_IN_USE CANT_CHANGE_RUNTIME_PARAM LOCK_NOT_AVAILABLE OPERATOR_INTERVENTION '
    + 'QUERY_CANCELED ADMIN_SHUTDOWN CRASH_SHUTDOWN CANNOT_CONNECT_NOW DATABASE_DROPPED '
    + 'SYSTEM_ERROR IO_ERROR UNDEFINED_FILE DUPLICATE_FILE SNAPSHOT_TOO_OLD CONFIG_FILE_ERROR '
    + 'LOCK_FILE_EXISTS FDW_ERROR FDW_COLUMN_NAME_NOT_FOUND FDW_DYNAMIC_PARAMETER_VALUE_NEEDED '
    + 'FDW_FUNCTION_SEQUENCE_ERROR FDW_INCONSISTENT_DESCRIPTOR_INFORMATION '
    + 'FDW_INVALID_ATTRIBUTE_VALUE FDW_INVALID_COLUMN_NAME FDW_INVALID_COLUMN_NUMBER '
    + 'FDW_INVALID_DATA_TYPE FDW_INVALID_DATA_TYPE_DESCRIPTORS '
    + 'FDW_INVALID_DESCRIPTOR_FIELD_IDENTIFIER FDW_INVALID_HANDLE FDW_INVALID_OPTION_INDEX '
    + 'FDW_INVALID_OPTION_NAME FDW_INVALID_STRING_LENGTH_OR_BUFFER_LENGTH '
    + 'FDW_INVALID_STRING_FORMAT FDW_INVALID_USE_OF_NULL_POINTER FDW_TOO_MANY_HANDLES '
    + 'FDW_OUT_OF_MEMORY FDW_NO_SCHEMAS FDW_OPTION_NAME_NOT_FOUND FDW_REPLY_HANDLE '
    + 'FDW_SCHEMA_NOT_FOUND FDW_TABLE_NOT_FOUND FDW_UNABLE_TO_CREATE_EXECUTION '
    + 'FDW_UNABLE_TO_CREATE_REPLY FDW_UNABLE_TO_ESTABLISH_CONNECTION PLPGSQL_ERROR '
    + 'RAISE_EXCEPTION NO_DATA_FOUND TOO_MANY_ROWS ASSERT_FAILURE INTERNAL_ERROR DATA_CORRUPTED '
    + 'INDEX_CORRUPTED ';

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

  return {
    name: 'CocoSQL',
    aliases: [
      'coco',
      'cocosql'
    ],
    supersetOf: "sql",
    case_insensitive: true,
    keywords: {
      keyword:
            SQL_KW,
      built_in:
            SQL_BI + PLPGSQL_BI
    },
    // Forbid some cunstructs from other languages to improve autodetect. In fact
    // "[a-z]:" is legal (as part of array slice), but improbabal.
    illegal: /:==|\W\s*\(\*|(^|\s)\$[a-z]|\{\{|[a-z]:\s*$|\.\.\.|TO:|DO:/,
    contains: [
      // special handling of some words, which are reserved only in some contexts
      {
        className: 'keyword',
        variants: [
          { begin: /\bSTORAGE\s+(PLAIN|EXTERNAL|EXTENDED|MAIN)\b/ },
          { begin: /\bMATCH\s+(FULL|PARTIAL|SIMPLE)\b/ },
          { begin: /\bNULLS\s+(FIRST|LAST)\b/ },
          { begin: /\b(LEFT|RIGHT)\s+(OUTER\s+)?JOIN\b/ },
          { begin: /\b(FETCH|MOVE)\s+(NEXT|PRIOR|FIRST|LAST|ABSOLUTE|RELATIVE|FORWARD|BACKWARD)\b/ },
          { begin: /\bPRESERVE\s+ROWS\b/ },
          { begin: /\bDISCARD\s+PLANS\b/ },
          { begin: /\bREFERENCING\s+(OLD|NEW)\b/ },
          { begin: /\bSKIP\s+LOCKED\b/ },
          { begin: /\bGROUPING\s+SETS\b/ },
          { begin: /\b(BINARY|INSENSITIVE|SCROLL|NO\s+SCROLL)\s+(CURSOR|FOR)\b/ },
          { begin: /\b(WITH|WITHOUT)\s+HOLD\b/ },
          { begin: /\bWITH\s+(CASCADED|LOCAL)\s+CHECK\s+OPTION\b/ },
          { begin: /\bEXCLUDE\s+(TIES|NO\s+OTHERS)\b/ },
          { begin: /\bFORMAT\s+(TEXT|XML|JSON|YAML)\b/ },
          { begin: /\bSET\s+((SESSION|LOCAL)\s+)?NAMES\b/ },
          { begin: /\bIS\s+(NOT\s+)?UNKNOWN\b/ },
          { begin: /\bSECURITY\s+LABEL\b/ },
          { begin: /\bSTANDALONE\s+(YES|NO|NO\s+VALUE)\b/ },
          { begin: /\bWITH\s+(NO\s+)?DATA\b/ },
          { begin: /\b(FOREIGN|SET)\s+DATA\b/ },
          { begin: /\bSET\s+(CATALOG|CONSTRAINTS)\b/ },
          { begin: /\b(WITH|FOR)\s+ORDINALITY\b/ },
          { begin: /\bIS\s+(NOT\s+)?DOCUMENT\b/ },
          { begin: /\bXML\s+OPTION\s+(DOCUMENT|CONTENT)\b/ },
          { begin: /\b(STRIP|PRESERVE)\s+WHITESPACE\b/ },
          { begin: /\bNO\s+(ACTION|MAXVALUE|MINVALUE)\b/ },
          { begin: /\bPARTITION\s+BY\s+(RANGE|LIST|HASH)\b/ },
          { begin: /\bAT\s+TIME\s+ZONE\b/ },
          { begin: /\bGRANTED\s+BY\b/ },
          { begin: /\bRETURN\s+(QUERY|NEXT)\b/ },
          { begin: /\b(ATTACH|DETACH)\s+PARTITION\b/ },
          { begin: /\bFORCE\s+ROW\s+LEVEL\s+SECURITY\b/ },
          { begin: /\b(INCLUDING|EXCLUDING)\s+(COMMENTS|CONSTRAINTS|DEFAULTS|IDENTITY|INDEXES|STATISTICS|STORAGE|ALL)\b/ },
          { begin: /\bAS\s+(ASSIGNMENT|IMPLICIT|PERMISSIVE|RESTRICTIVE|ENUM|RANGE)\b/ }
        ]
      },
      // functions named as keywords, followed by '('
      { begin: /\b(FORMAT|FAMILY|VERSION)\s*\(/
        // keywords: { built_in: 'FORMAT FAMILY VERSION' }
      },
      // INCLUDE ( ... ) in index_parameters in CREATE TABLE
      {
        begin: /\bINCLUDE\s*\(/,
        keywords: 'INCLUDE'
      },
      // not highlight RANGE if not in frame_clause (not 100% correct, but seems satisfactory)
      { begin: /\bRANGE(?!\s*(BETWEEN|UNBOUNDED|CURRENT|[-0-9]+))/ },
      // disable highlighting in commands CREATE AGGREGATE/COLLATION/DATABASE/OPERTOR/TEXT SEARCH .../TYPE
      // and in PL/pgSQL RAISE ... USING
      { begin: /\b(VERSION|OWNER|TEMPLATE|TABLESPACE|CONNECTION\s+LIMIT|PROCEDURE|RESTRICT|JOIN|PARSER|COPY|START|END|COLLATION|INPUT|ANALYZE|STORAGE|LIKE|DEFAULT|DELIMITER|ENCODING|COLUMN|CONSTRAINT|TABLE|SCHEMA)\s*=/ },
      // PG_smth; HAS_some_PRIVILEGE
      {
        // className: 'built_in',
        begin: /\b(PG_\w+?|HAS_[A-Z_]+_PRIVILEGE)\b/,
        relevance: 10
      },
      // extract
      {
        begin: /\bEXTRACT\s*\(/,
        end: /\bFROM\b/,
        returnEnd: true,
        keywords: {
          // built_in: 'EXTRACT',
          type: 'CENTURY DAY DECADE DOW DOY EPOCH HOUR ISODOW ISOYEAR MICROSECONDS '
                        + 'MILLENNIUM MILLISECONDS MINUTE MONTH QUARTER SECOND TIMEZONE TIMEZONE_HOUR '
                        + 'TIMEZONE_MINUTE WEEK YEAR' }
      },
      // xmlelement, xmlpi - special NAME
      {
        begin: /\b(XMLELEMENT|XMLPI)\s*\(\s*NAME/,
        keywords: {
          // built_in: 'XMLELEMENT XMLPI',
          keyword: 'NAME' }
      },
      // xmlparse, xmlserialize
      {
        begin: /\b(XMLPARSE|XMLSERIALIZE)\s*\(\s*(DOCUMENT|CONTENT)/,
        keywords: {
          // built_in: 'XMLPARSE XMLSERIALIZE',
          keyword: 'DOCUMENT CONTENT' }
      },
      // Sequences. We actually skip everything between CACHE|INCREMENT|MAXVALUE|MINVALUE and
      // nearest following numeric constant. Without with trick we find a lot of "keywords"
      // in 'avrasm' autodetection test...
      {
        beginKeywords: 'CACHE INCREMENT MAXVALUE MINVALUE',
        end: hljs.C_NUMBER_RE,
        returnEnd: true,
        keywords: 'BY CACHE INCREMENT MAXVALUE MINVALUE'
      },
      // WITH|WITHOUT TIME ZONE as part of datatype
      {
        className: 'type',
        begin: /\b(WITH|WITHOUT)\s+TIME\s+ZONE\b/
      },
      // INTERVAL optional fields
      {
        className: 'type',
        begin: /\bINTERVAL\s+(YEAR|MONTH|DAY|HOUR|MINUTE|SECOND)(\s+TO\s+(MONTH|HOUR|MINUTE|SECOND))?\b/
      },
      // Pseudo-types which allowed only as return type
      {
        begin: /\bRETURNS\s+(LANGUAGE_HANDLER|TRIGGER|EVENT_TRIGGER|FDW_HANDLER|INDEX_AM_HANDLER|TSM_HANDLER)\b/,
        keywords: {
          keyword: 'RETURNS',
          type: 'LANGUAGE_HANDLER TRIGGER EVENT_TRIGGER FDW_HANDLER INDEX_AM_HANDLER TSM_HANDLER'
        }
      },
      // Known functions - only when followed by '('
      { begin: '\\b(' + FUNCTIONS_RE + ')\\s*\\('
        // keywords: { built_in: FUNCTIONS }
      },
      // Types
      { begin: '\\.(' + TYPES_RE + ')\\b' // prevent highlight as type, say, 'oid' in 'pgclass.oid'
      },
      {
        begin: '\\b(' + TYPES_RE + ')\\s+PATH\\b', // in XMLTABLE
        keywords: {
          keyword: 'PATH', // hopefully no one would use PATH type in XMLTABLE...
          type: TYPES.replace('PATH ', '')
        }
      },
      {
        className: 'type',
        begin: '\\b(' + TYPES_RE + ')\\b'
      },
      // Strings, see https://www.postgresql.org/docs/11/static/sql-syntax-lexical.html#SQL-SYNTAX-CONSTANTS
      {
        className: 'string',
        begin: '\'',
        end: '\'',
        contains: [ { begin: '\'\'' } ]
      },
      {
        className: 'string',
        begin: '(e|E|u&|U&)\'',
        end: '\'',
        contains: [ { begin: '\\\\.' } ],
        relevance: 10
      },
      hljs.END_SAME_AS_BEGIN({
        begin: DOLLAR_STRING,
        end: DOLLAR_STRING,
        contains: [
          {
            // actually we want them all except SQL; listed are those with known implementations
            // and XML + JSON just in case
            subLanguage: [
              'pgsql',
              'perl',
              'python',
              'tcl',
              'r',
              'lua',
              'java',
              'php',
              'ruby',
              'bash',
              'scheme',
              'xml',
              'json'
            ],
            endsWithParent: true
          }
        ]
      }),
      // identifiers in quotes
      {
        begin: '"',
        end: '"',
        contains: [ { begin: '""' } ]
      },
      // numbers
      hljs.C_NUMBER_MODE,
      // comments
      hljs.C_BLOCK_COMMENT_MODE,
      COMMENT_MODE,
      // PL/pgSQL staff
      // %ROWTYPE, %TYPE, $n
      {
        className: 'meta',
        variants: [
          { // %TYPE, %ROWTYPE
            begin: '%(ROW)?TYPE',
            relevance: 10
          },
          { // $n
            begin: '\\$\\d+' },
          { // #compiler option
            begin: '^#\\w',
            end: '$'
          }
        ]
      },
      // <<labeles>>
      {
        className: 'symbol',
        begin: LABEL,
        relevance: 10
      }
    ]
  };
}
