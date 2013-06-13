var Tokenizer = require('./tokenizer').Tokenizer,
    OpenElementStack = require('./open_element_stack').OpenElementStack,
    FormattingElementList = require('./formatting_element_list').FormattingElementList,
    defaultTreeAdapter = require('./default_tree_adapter'),
    unicode = require('./unicode'),
    HTML = require('./html');

//Aliases
var $ = HTML.TAG_NAMES,
    NS = HTML.NAMESPACES;

//Attributes
var TYPE_ATTR = 'type',
    HIDDEN_INPUT_TYPE = 'hidden',
    XMLNS_ATTR = 'xmlns',
    XLINK_ATTR = 'xlink',
    COLOR_ATTR = 'color',
    FACE_ATTR = 'face',
    SIZE_ATTR = 'size',
    MATHML_DEFINITION_URL_ATTR_LOWERCASED = 'definitionurl',
    MATHML_DEFINITION_URL_ATTR_ADJUSTED = 'definitionURL',
    SVG_ATTRS_ADJUSTMENT_MAP = {
        'attributename': 'attributeName',
        'attributetype': 'attributeType',
        'basefrequency': 'baseFrequency',
        'baseprofile': 'baseProfile',
        'calcmode': 'calcMode',
        'clippathunits': 'clipPathUnits',
        'contentscripttype': 'contentScriptType',
        'contentstyletype': 'contentStyleType',
        'diffuseconstant': 'diffuseConstant',
        'edgemode': 'edgeMode',
        'externalresourcesrequired': 'externalResourcesRequired',
        'filterres': 'filterRes',
        'filterunits': 'filterUnits',
        'glyphref': 'glyphRef',
        'gradienttransform': 'gradientTransform',
        'gradientunits': 'gradientUnits',
        'kernelmatrix': 'kernelMatrix',
        'kernelunitlength': 'kernelUnitLength',
        'keypoints': 'keyPoints',
        'keysplines': 'keySplines',
        'keytimes': 'keyTimes',
        'lengthadjust': 'lengthAdjust',
        'limitingconeangle': 'limitingConeAngle',
        'markerheight': 'markerHeight',
        'markerunits': 'markerUnits',
        'markerwidth': 'markerWidth',
        'maskcontentunits': 'maskContentUnits',
        'maskunits': 'maskUnits',
        'numoctaves': 'numOctaves',
        'pathlength': 'pathLength',
        'patterncontentunits': 'patternContentUnits',
        'patterntransform': 'patternTransform',
        'patternunits': 'patternUnits',
        'pointsatx': 'pointsAtX',
        'pointsaty': 'pointsAtY',
        'pointsatz': 'pointsAtZ',
        'preservealpha': 'preserveAlpha',
        'preserveaspectratio': 'preserveAspectRatio',
        'primitiveunits': 'primitiveUnits',
        'refx': 'refX',
        'refy': 'refY',
        'repeatcount': 'repeatCount',
        'repeatdur': 'repeatDur',
        'requiredextensions': 'requiredExtensions',
        'requiredfeatures': 'requiredFeatures',
        'specularconstant': 'specularConstant',
        'specularexponent': 'specularExponent',
        'spreadmethod': 'spreadMethod',
        'startoffset': 'startOffset',
        'stddeviation': 'stdDeviation',
        'stitchtiles': 'stitchTiles',
        'surfacescale': 'surfaceScale',
        'systemlanguage': 'systemLanguage',
        'tablevalues': 'tableValues',
        'targetx': 'targetX',
        'targety': 'targetY',
        'textlength': 'textLength',
        'viewbox': 'viewBox',
        'viewtarget': 'viewTarget',
        'xchannelselector': 'xChannelSelector',
        'ychannelselector': 'yChannelSelector',
        'zoomandpan': 'zoomAndPan'
    },
    FOREIGN_ATTRS_ADJUSTMENT_MAP = {
        'xlink:actuate': {prefix: 'xlink', name: 'actuate', namespace: NS.XLINK},
        'xlink:arcrole': {prefix: 'xlink', name: 'arcrole', namespace: NS.XLINK},
        'xlink:href': {prefix: 'xlink', name: 'href', namespace: NS.XLINK},
        'xlink:role': {prefix: 'xlink', name: 'role', namespace: NS.XLINK},
        'xlink:show': {prefix: 'xlink', name: 'show', namespace: NS.XLINK},
        'xlink:title': {prefix: 'xlink', name: 'title', namespace: NS.XLINK},
        'xlink:type': {prefix: 'xlink', name: 'type', namespace: NS.XLINK},
        'xml:base': {prefix: 'xml', name: 'base', namespace: NS.XML},
        'xml:lang': {prefix: 'xml', name: 'lang', namespace: NS.XML},
        'xml:space': {prefix: 'xml', name: 'space', namespace: NS.XML},
        'xmlns': {prefix: '', name: 'xmlns', namespace: NS.XMLNS},
        'xmlns:xlink': {prefix: 'xmlns', name: 'xlink', namespace: NS.XMLNS}

    };

//SVG tag names adjustment map
var SVG_TAG_NAMES_ADJUSTMENT_MAP = {
    'altglyph': 'altGlyph',
    'altglyphdef': 'altGlyphDef',
    'altglyphitem': 'altGlyphItem',
    'animatecolor': 'animateColor',
    'animatemotion': 'animateMotion',
    'animatetransform': 'animateTransform',
    'clippath': 'clipPath',
    'feblend': 'feBlend',
    'fecolormatrix': 'feColorMatrix',
    'fecomponenttransfer': 'feComponentTransfer',
    'fecomposite': 'feComposite',
    'feconvolvematrix': 'feConvolveMatrix',
    'fediffuselighting': 'feDiffuseLighting',
    'fedisplacementmap': 'feDisplacementMap',
    'fedistantlight': 'feDistantLight',
    'feflood': 'feFlood',
    'fefunca': 'feFuncA',
    'fefuncb': 'feFuncB',
    'fefuncg': 'feFuncG',
    'fefuncr': 'feFuncR',
    'fegaussianblur': 'feGaussianBlur',
    'feimage': 'feImage',
    'femerge': 'feMerge',
    'femergenode': 'feMergeNode',
    'femorphology': 'feMorphology',
    'feoffset': 'feOffset',
    'fepointlight': 'fePointLight',
    'fespecularlighting': 'feSpecularLighting',
    'fespotlight': 'feSpotLight',
    'fetile': 'feTile',
    'feturbulence': 'feTurbulence',
    'foreignobject': 'foreignObject',
    'glyphref': 'glyphRef',
    'lineargradient': 'linearGradient',
    'radialgradient': 'radialGradient',
    'textpath': 'textPath'
};

//Tags that can remain open after </body>
var CAN_REMAIN_OPEN_AFTER_BODY = {};

CAN_REMAIN_OPEN_AFTER_BODY[$.DD] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.DT] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.LI] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.OPTGROUP] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.OPTION] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.P] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.RP] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.RT] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.TBODY] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.TD] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.TFOOT] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.TH] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.THEAD] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.TR] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.BODY] = true;
CAN_REMAIN_OPEN_AFTER_BODY[$.HTML] = true;

//Tags that are not allowed in foreign content
var NOT_ALLOWED_IN_FOREIGN_CONTENT = {};

NOT_ALLOWED_IN_FOREIGN_CONTENT[$.B] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.BIG] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.BLOCKQUOTE] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.BODY] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.BR] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.CENTER] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.CODE] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.DD] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.DIV] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.DL] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.DT] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.EM] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.EMBED] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.H1] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.H2] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.H3] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.H4] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.H5] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.H6] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.HEAD] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.HR] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.I] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.IMG] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.LI] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.LISTING] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.MENU] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.META] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.NOBR] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.OL] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.P] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.PRE] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.RUBY] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.S] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.SMALL] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.SPAN] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.STRONG] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.STRIKE] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.SUB] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.SUP] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.TABLE] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.TT] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.U] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.UL] = true;
NOT_ALLOWED_IN_FOREIGN_CONTENT[$.VAR] = true;

//Special elements
var SPECIAL_ELEMENTS = {};

SPECIAL_ELEMENTS[NS.HTML] = {};
SPECIAL_ELEMENTS[NS.HTML][$.ADDRESS] = true;
SPECIAL_ELEMENTS[NS.HTML][$.APPLET] = true;
SPECIAL_ELEMENTS[NS.HTML][$.AREA] = true;
SPECIAL_ELEMENTS[NS.HTML][$.ARTICLE] = true;
SPECIAL_ELEMENTS[NS.HTML][$.ASIDE] = true;
SPECIAL_ELEMENTS[NS.HTML][$.BASE] = true;
SPECIAL_ELEMENTS[NS.HTML][$.BASEFONT] = true;
SPECIAL_ELEMENTS[NS.HTML][$.BGSOUND] = true;
SPECIAL_ELEMENTS[NS.HTML][$.BLOCKQUOTE] = true;
SPECIAL_ELEMENTS[NS.HTML][$.BODY] = true;
SPECIAL_ELEMENTS[NS.HTML][$.BR] = true;
SPECIAL_ELEMENTS[NS.HTML][$.BUTTON] = true;
SPECIAL_ELEMENTS[NS.HTML][$.CAPTION] = true;
SPECIAL_ELEMENTS[NS.HTML][$.CENTER] = true;
SPECIAL_ELEMENTS[NS.HTML][$.COL] = true;
SPECIAL_ELEMENTS[NS.HTML][$.COLGROUP] = true;
SPECIAL_ELEMENTS[NS.HTML][$.DD] = true;
SPECIAL_ELEMENTS[NS.HTML][$.DETAILS] = true;
SPECIAL_ELEMENTS[NS.HTML][$.DIR] = true;
SPECIAL_ELEMENTS[NS.HTML][$.DIV] = true;
SPECIAL_ELEMENTS[NS.HTML][$.DL] = true;
SPECIAL_ELEMENTS[NS.HTML][$.DT] = true;
SPECIAL_ELEMENTS[NS.HTML][$.EMBED] = true;
SPECIAL_ELEMENTS[NS.HTML][$.FIELDSET] = true;
SPECIAL_ELEMENTS[NS.HTML][$.FIGCAPTION] = true;
SPECIAL_ELEMENTS[NS.HTML][$.FIGURE] = true;
SPECIAL_ELEMENTS[NS.HTML][$.FOOTER] = true;
SPECIAL_ELEMENTS[NS.HTML][$.FORM] = true;
SPECIAL_ELEMENTS[NS.HTML][$.FRAME] = true;
SPECIAL_ELEMENTS[NS.HTML][$.FRAMESET] = true;
SPECIAL_ELEMENTS[NS.HTML][$.H1] = true;
SPECIAL_ELEMENTS[NS.HTML][$.H2] = true;
SPECIAL_ELEMENTS[NS.HTML][$.H3] = true;
SPECIAL_ELEMENTS[NS.HTML][$.H4] = true;
SPECIAL_ELEMENTS[NS.HTML][$.H5] = true;
SPECIAL_ELEMENTS[NS.HTML][$.H6] = true;
SPECIAL_ELEMENTS[NS.HTML][$.HEAD] = true;
SPECIAL_ELEMENTS[NS.HTML][$.HEADER] = true;
SPECIAL_ELEMENTS[NS.HTML][$.HGROUP] = true;
SPECIAL_ELEMENTS[NS.HTML][$.HR] = true;
SPECIAL_ELEMENTS[NS.HTML][$.HTML] = true;
SPECIAL_ELEMENTS[NS.HTML][$.IFRAME] = true;
SPECIAL_ELEMENTS[NS.HTML][$.IMG] = true;
SPECIAL_ELEMENTS[NS.HTML][$.INPUT] = true;
SPECIAL_ELEMENTS[NS.HTML][$.ISINDEX] = true;
SPECIAL_ELEMENTS[NS.HTML][$.LI] = true;
SPECIAL_ELEMENTS[NS.HTML][$.LINK] = true;
SPECIAL_ELEMENTS[NS.HTML][$.LISTING] = true;
SPECIAL_ELEMENTS[NS.HTML][$.MAIN] = true;
SPECIAL_ELEMENTS[NS.HTML][$.MARQUEE] = true;
SPECIAL_ELEMENTS[NS.HTML][$.MENU] = true;
SPECIAL_ELEMENTS[NS.HTML][$.MENUITEM] = true;
SPECIAL_ELEMENTS[NS.HTML][$.META] = true;
SPECIAL_ELEMENTS[NS.HTML][$.NAV] = true;
SPECIAL_ELEMENTS[NS.HTML][$.NOEMBED] = true;
SPECIAL_ELEMENTS[NS.HTML][$.NOFRAMES] = true;
SPECIAL_ELEMENTS[NS.HTML][$.NOSCRIPT] = true;
SPECIAL_ELEMENTS[NS.HTML][$.OBJECT] = true;
SPECIAL_ELEMENTS[NS.HTML][$.OL] = true;
SPECIAL_ELEMENTS[NS.HTML][$.P] = true;
SPECIAL_ELEMENTS[NS.HTML][$.PARAM] = true;
SPECIAL_ELEMENTS[NS.HTML][$.PLAINTEXT] = true;
SPECIAL_ELEMENTS[NS.HTML][$.PRE] = true;
SPECIAL_ELEMENTS[NS.HTML][$.SCRIPT] = true;
SPECIAL_ELEMENTS[NS.HTML][$.SECTION] = true;
SPECIAL_ELEMENTS[NS.HTML][$.SELECT] = true;
SPECIAL_ELEMENTS[NS.HTML][$.SOURCE] = true;
SPECIAL_ELEMENTS[NS.HTML][$.STYLE] = true;
SPECIAL_ELEMENTS[NS.HTML][$.SUMMARY] = true;
SPECIAL_ELEMENTS[NS.HTML][$.TABLE] = true;
SPECIAL_ELEMENTS[NS.HTML][$.TBODY] = true;
SPECIAL_ELEMENTS[NS.HTML][$.TD] = true;
SPECIAL_ELEMENTS[NS.HTML][$.TEXTAREA] = true;
SPECIAL_ELEMENTS[NS.HTML][$.TFOOT] = true;
SPECIAL_ELEMENTS[NS.HTML][$.TH] = true;
SPECIAL_ELEMENTS[NS.HTML][$.THEAD] = true;
SPECIAL_ELEMENTS[NS.HTML][$.TITLE] = true;
SPECIAL_ELEMENTS[NS.HTML][$.TR] = true;
SPECIAL_ELEMENTS[NS.HTML][$.TRACK] = true;
SPECIAL_ELEMENTS[NS.HTML][$.UL] = true;
SPECIAL_ELEMENTS[NS.HTML][$.WBR] = true;
SPECIAL_ELEMENTS[NS.HTML][$.XMP] = true;

SPECIAL_ELEMENTS[NS.MATHML] = {};
SPECIAL_ELEMENTS[NS.MATHML][$.MI] = true;
SPECIAL_ELEMENTS[NS.MATHML][$.MO] = true;
SPECIAL_ELEMENTS[NS.MATHML][$.MN] = true;
SPECIAL_ELEMENTS[NS.MATHML][$.MS] = true;
SPECIAL_ELEMENTS[NS.MATHML][$.MTEXT] = true;
SPECIAL_ELEMENTS[NS.MATHML][$.ANNOTATION_XML] = true;

SPECIAL_ELEMENTS[NS.SVG] = {};
SPECIAL_ELEMENTS[NS.SVG][$.TITLE] = true;
SPECIAL_ELEMENTS[NS.SVG][$.FOREIGN_OBJECT] = true;
SPECIAL_ELEMENTS[NS.SVG][$.DESC] = true;

//Insertion modes
var INITIAL_MODE = 'INITIAL_MODE',
    BEFORE_HTML_MODE = 'BEFORE_HTML_MODE',
    BEFORE_HEAD_MODE = 'BEFORE_HEAD_MODE',
    IN_HEAD_MODE = 'IN_HEAD_MODE',
    AFTER_HEAD_MODE = 'AFTER_HEAD_MODE',
    IN_BODY_MODE = 'IN_BODY_MODE',
    TEXT_MODE = 'TEXT_MODE',
    IN_TABLE_MODE = 'IN_TABLE_MODE',
    IN_TABLE_TEXT_MODE = 'IN_TABLE_TEXT_MODE',
    IN_CAPTION_MODE = 'IN_CAPTION_MODE',
    IN_COLUMN_GROUP_MODE = 'IN_COLUMN_GROUP_MODE',
    IN_TABLE_BODY_MODE = 'IN_TABLE_BODY_MODE',
    IN_ROW_MODE = 'IN_ROW_MODE',
    IN_CELL_MODE = 'IN_CELL_MODE',
    IN_SELECT_MODE = 'IN_SELECT_MODE',
    IN_SELECT_IN_TABLE_MODE = 'IN_SELECT_IN_TABLE_MODE',
    AFTER_BODY_MODE = 'AFTER_BODY_MODE',
    IN_FRAMESET_MODE = 'IN_FRAMESET_MODE',
    AFTER_FRAMESET_MODE = 'AFTER_FRAMESET_MODE',
    AFTER_AFTER_BODY_MODE = 'AFTER_AFTER_BODY_MODE',
    AFTER_AFTER_FRAMESET_MODE = 'AFTER_AFTER_FRAMESET_MODE';

//Insertion mode reset map
var INSERTION_MODE_RESET_MAP = {};

INSERTION_MODE_RESET_MAP[$.SELECT] = IN_SELECT_MODE;
INSERTION_MODE_RESET_MAP[$.TR] = IN_ROW_MODE;
INSERTION_MODE_RESET_MAP[$.TBODY] =
INSERTION_MODE_RESET_MAP[$.THEAD] =
INSERTION_MODE_RESET_MAP[$.TFOOT] = IN_TABLE_BODY_MODE;
INSERTION_MODE_RESET_MAP[$.CAPTION] = IN_CAPTION_MODE;
INSERTION_MODE_RESET_MAP[$.COLGROUP] = IN_COLUMN_GROUP_MODE;
INSERTION_MODE_RESET_MAP[$.TABLE] = IN_TABLE_MODE;
INSERTION_MODE_RESET_MAP[$.HEAD] =
INSERTION_MODE_RESET_MAP[$.BODY] = IN_BODY_MODE;
INSERTION_MODE_RESET_MAP[$.FRAMESET] = IN_FRAMESET_MODE;
INSERTION_MODE_RESET_MAP[$.HTML] = BEFORE_HEAD_MODE;

//Token handlers map for insertion modes
var IM_ = {};

IM_[INITIAL_MODE] = {};
IM_[INITIAL_MODE][Tokenizer.CHARACTER_TOKEN] = characterInInitialMode;
IM_[INITIAL_MODE][Tokenizer.COMMENT_TOKEN] = commentInInitialMode;
IM_[INITIAL_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInInitialMode;
IM_[INITIAL_MODE][Tokenizer.START_TAG_TOKEN] =
IM_[INITIAL_MODE][Tokenizer.END_TAG_TOKEN] =
IM_[INITIAL_MODE][Tokenizer.EOF_TOKEN] = initialModeDefaultHandler;

IM_[BEFORE_HTML_MODE] = {};
IM_[BEFORE_HTML_MODE][Tokenizer.CHARACTER_TOKEN] = characterBeforeHtml;
IM_[BEFORE_HTML_MODE][Tokenizer.COMMENT_TOKEN] = commentBeforeHtml;
IM_[BEFORE_HTML_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeBeforeHtml;
IM_[BEFORE_HTML_MODE][Tokenizer.START_TAG_TOKEN] = startTagBeforeHtml;
IM_[BEFORE_HTML_MODE][Tokenizer.END_TAG_TOKEN] = endTagBeforeHtml;
IM_[BEFORE_HTML_MODE][Tokenizer.EOF_TOKEN] = beforeHtmlModeDefaultHandler;

IM_[BEFORE_HEAD_MODE] = {};
IM_[BEFORE_HEAD_MODE][Tokenizer.CHARACTER_TOKEN] = characterBeforeHead;
IM_[BEFORE_HEAD_MODE][Tokenizer.COMMENT_TOKEN] = commentBeforeHead;
IM_[BEFORE_HEAD_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeBeforeHead;
IM_[BEFORE_HEAD_MODE][Tokenizer.START_TAG_TOKEN] = startTagBeforeHead;
IM_[BEFORE_HEAD_MODE][Tokenizer.END_TAG_TOKEN] = endTagBeforeHead;
IM_[BEFORE_HEAD_MODE][Tokenizer.EOF_TOKEN] = beforeHeadModeDefaultHandler;

IM_[IN_HEAD_MODE] = {};
IM_[IN_HEAD_MODE][Tokenizer.CHARACTER_TOKEN] = characterInHead;
IM_[IN_HEAD_MODE][Tokenizer.COMMENT_TOKEN] = commentInHead;
IM_[IN_HEAD_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInHead;
IM_[IN_HEAD_MODE][Tokenizer.START_TAG_TOKEN] = startTagInHead;
IM_[IN_HEAD_MODE][Tokenizer.END_TAG_TOKEN] = endTagInHead;
IM_[IN_HEAD_MODE][Tokenizer.EOF_TOKEN] = inHeadModeDefaultHandler;

IM_[AFTER_HEAD_MODE] = {};
IM_[AFTER_HEAD_MODE][Tokenizer.CHARACTER_TOKEN] = characterAfterHead;
IM_[AFTER_HEAD_MODE][Tokenizer.COMMENT_TOKEN] = commentAfterHead;
IM_[AFTER_HEAD_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeAfterHead;
IM_[AFTER_HEAD_MODE][Tokenizer.START_TAG_TOKEN] = startTagAfterHead;
IM_[AFTER_HEAD_MODE][Tokenizer.END_TAG_TOKEN] = endTagAfterHead;
IM_[AFTER_HEAD_MODE][Tokenizer.EOF_TOKEN] = afterHeadModeDefaultHandler;

IM_[IN_BODY_MODE] = {};
IM_[IN_BODY_MODE][Tokenizer.CHARACTER_TOKEN] = characterInBody;
IM_[IN_BODY_MODE][Tokenizer.COMMENT_TOKEN] = commentInBody;
IM_[IN_BODY_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInBody;
IM_[IN_BODY_MODE][Tokenizer.START_TAG_TOKEN] = startTagInBody;
IM_[IN_BODY_MODE][Tokenizer.END_TAG_TOKEN] = endTagInBody;
IM_[IN_BODY_MODE][Tokenizer.EOF_TOKEN] = eofInBody;

IM_[TEXT_MODE] = {};
IM_[TEXT_MODE][Tokenizer.CHARACTER_TOKEN] = characterInText;
IM_[TEXT_MODE][Tokenizer.COMMENT_TOKEN] =
IM_[TEXT_MODE][Tokenizer.DOCTYPE_TOKEN] =
IM_[TEXT_MODE][Tokenizer.START_TAG_TOKEN] = doNothing;
IM_[TEXT_MODE][Tokenizer.END_TAG_TOKEN] = endTagInText;
IM_[TEXT_MODE][Tokenizer.EOF_TOKEN] = eofInText;

IM_[IN_TABLE_MODE] = {};
IM_[IN_TABLE_MODE][Tokenizer.CHARACTER_TOKEN] = characterInTable;
IM_[IN_TABLE_MODE][Tokenizer.COMMENT_TOKEN] = commentInTable;
IM_[IN_TABLE_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInTable;
IM_[IN_TABLE_MODE][Tokenizer.START_TAG_TOKEN] = startTagInTable;
IM_[IN_TABLE_MODE][Tokenizer.END_TAG_TOKEN] = endTagInTable;
IM_[IN_TABLE_MODE][Tokenizer.EOF_TOKEN] = eofInTable;

IM_[IN_TABLE_TEXT_MODE] = {};
IM_[IN_TABLE_TEXT_MODE][Tokenizer.CHARACTER_TOKEN] = characterInTableText;
IM_[IN_TABLE_TEXT_MODE][Tokenizer.COMMENT_TOKEN] =
IM_[IN_TABLE_TEXT_MODE][Tokenizer.DOCTYPE_TOKEN] =
IM_[IN_TABLE_TEXT_MODE][Tokenizer.START_TAG_TOKEN] =
IM_[IN_TABLE_TEXT_MODE][Tokenizer.END_TAG_TOKEN] =
IM_[IN_TABLE_TEXT_MODE][Tokenizer.EOF_TOKEN] = inTableTextModeDefaultHandler;

IM_[IN_CAPTION_MODE] = {};
IM_[IN_CAPTION_MODE][Tokenizer.CHARACTER_TOKEN] = characterInBody;
IM_[IN_CAPTION_MODE][Tokenizer.COMMENT_TOKEN] = commentInBody;
IM_[IN_CAPTION_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInBody;
IM_[IN_CAPTION_MODE][Tokenizer.START_TAG_TOKEN] = startTagInCaption;
IM_[IN_CAPTION_MODE][Tokenizer.END_TAG_TOKEN] = endTagInCaption;
IM_[IN_CAPTION_MODE][Tokenizer.EOF_TOKEN] = eofInBody;

IM_[IN_COLUMN_GROUP_MODE] = {};
IM_[IN_COLUMN_GROUP_MODE][Tokenizer.CHARACTER_TOKEN] = characterInColumnGroup;
IM_[IN_COLUMN_GROUP_MODE][Tokenizer.COMMENT_TOKEN] = commentInColumnGroup;
IM_[IN_COLUMN_GROUP_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInColumnGroup;
IM_[IN_COLUMN_GROUP_MODE][Tokenizer.START_TAG_TOKEN] = startTagInColumnGroup;
IM_[IN_COLUMN_GROUP_MODE][Tokenizer.END_TAG_TOKEN] = endTagInColumnGroup;
IM_[IN_COLUMN_GROUP_MODE][Tokenizer.EOF_TOKEN] = eofInColumnGroup;

IM_[IN_TABLE_BODY_MODE] = {};
IM_[IN_TABLE_BODY_MODE][Tokenizer.CHARACTER_TOKEN] = characterInTable;
IM_[IN_TABLE_BODY_MODE][Tokenizer.COMMENT_TOKEN] = commentInTable;
IM_[IN_TABLE_BODY_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInTable;
IM_[IN_TABLE_BODY_MODE][Tokenizer.START_TAG_TOKEN] = startTagInTableBody;
IM_[IN_TABLE_BODY_MODE][Tokenizer.END_TAG_TOKEN] = endTagInTableBody;
IM_[IN_TABLE_BODY_MODE][Tokenizer.EOF_TOKEN] = eofInTable;

IM_[IN_ROW_MODE] = {};
IM_[IN_ROW_MODE][Tokenizer.CHARACTER_TOKEN] = characterInTable;
IM_[IN_ROW_MODE][Tokenizer.COMMENT_TOKEN] = commentInTable;
IM_[IN_ROW_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInTable;
IM_[IN_ROW_MODE][Tokenizer.START_TAG_TOKEN] = startTagInRow;
IM_[IN_ROW_MODE][Tokenizer.END_TAG_TOKEN] = endTagInRow;
IM_[IN_ROW_MODE][Tokenizer.EOF_TOKEN] = eofInTable;

IM_[IN_CELL_MODE] = {};
IM_[IN_CELL_MODE][Tokenizer.CHARACTER_TOKEN] = characterInBody;
IM_[IN_CELL_MODE][Tokenizer.COMMENT_TOKEN] = commentInBody;
IM_[IN_CELL_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInBody;
IM_[IN_CELL_MODE][Tokenizer.START_TAG_TOKEN] = startTagInCell;
IM_[IN_CELL_MODE][Tokenizer.END_TAG_TOKEN] = endTagInCell;
IM_[IN_CELL_MODE][Tokenizer.EOF_TOKEN] = eofInBody;

IM_[IN_SELECT_MODE] = {};
IM_[IN_SELECT_MODE][Tokenizer.CHARACTER_TOKEN] = characterInSelect;
IM_[IN_SELECT_MODE][Tokenizer.COMMENT_TOKEN] = commentInSelect;
IM_[IN_SELECT_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInSelect;
IM_[IN_SELECT_MODE][Tokenizer.START_TAG_TOKEN] = startTagInSelect;
IM_[IN_SELECT_MODE][Tokenizer.END_TAG_TOKEN] = endTagInSelect;
IM_[IN_SELECT_MODE][Tokenizer.EOF_TOKEN] = eofInSelect;

IM_[IN_SELECT_IN_TABLE_MODE] = {};
IM_[IN_SELECT_IN_TABLE_MODE][Tokenizer.CHARACTER_TOKEN] = characterInSelect;
IM_[IN_SELECT_IN_TABLE_MODE][Tokenizer.COMMENT_TOKEN] = commentInSelect;
IM_[IN_SELECT_IN_TABLE_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInSelect;
IM_[IN_SELECT_IN_TABLE_MODE][Tokenizer.START_TAG_TOKEN] = startTagInSelectInTable;
IM_[IN_SELECT_IN_TABLE_MODE][Tokenizer.END_TAG_TOKEN] = startTagInSelectInTable;
IM_[IN_SELECT_IN_TABLE_MODE][Tokenizer.EOF_TOKEN] = eofInSelect;

IM_[AFTER_BODY_MODE] = {};
IM_[AFTER_BODY_MODE][Tokenizer.CHARACTER_TOKEN] = characterAfterBody;
IM_[AFTER_BODY_MODE][Tokenizer.COMMENT_TOKEN] = commentAfterBody;
IM_[AFTER_BODY_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeAfterBody;
IM_[AFTER_BODY_MODE][Tokenizer.START_TAG_TOKEN] = startTagAfterBody;
IM_[AFTER_BODY_MODE][Tokenizer.END_TAG_TOKEN] = endTagAfterBody;
IM_[AFTER_BODY_MODE][Tokenizer.EOF_TOKEN] = eofAfterBody;

IM_[IN_FRAMESET_MODE] = {};
IM_[IN_FRAMESET_MODE][Tokenizer.CHARACTER_TOKEN] = characterInFrameset;
IM_[IN_FRAMESET_MODE][Tokenizer.COMMENT_TOKEN] = commentInFrameset;
IM_[IN_FRAMESET_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInFrameset;
IM_[IN_FRAMESET_MODE][Tokenizer.START_TAG_TOKEN] = startTagInFrameset;
IM_[IN_FRAMESET_MODE][Tokenizer.END_TAG_TOKEN] = endTagInFrameset;
IM_[IN_FRAMESET_MODE][Tokenizer.EOF_TOKEN] = eofInFrameset;

IM_[AFTER_FRAMESET_MODE] = {};
IM_[AFTER_FRAMESET_MODE][Tokenizer.CHARACTER_TOKEN] = characterAfterFrameset;
IM_[AFTER_FRAMESET_MODE][Tokenizer.COMMENT_TOKEN] = commentAfterFrameset;
IM_[AFTER_FRAMESET_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeAfterFrameset;
IM_[AFTER_FRAMESET_MODE][Tokenizer.START_TAG_TOKEN] = startTagAfterFrameset;
IM_[AFTER_FRAMESET_MODE][Tokenizer.END_TAG_TOKEN] = endTagAfterFrameset;
IM_[AFTER_FRAMESET_MODE][Tokenizer.EOF_TOKEN] = eofAfterFrameset;

IM_[AFTER_AFTER_BODY_MODE] = {};
IM_[AFTER_AFTER_BODY_MODE][Tokenizer.CHARACTER_TOKEN] = characterAfterAfterBody;
IM_[AFTER_AFTER_BODY_MODE][Tokenizer.COMMENT_TOKEN] = commentAfterAfterBody;
IM_[AFTER_AFTER_BODY_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInBody;
IM_[AFTER_AFTER_BODY_MODE][Tokenizer.START_TAG_TOKEN] = startTagAfterAfterBody;
IM_[AFTER_AFTER_BODY_MODE][Tokenizer.END_TAG_TOKEN] = afterAfterBodyModeDefaultHandler;
IM_[AFTER_AFTER_BODY_MODE][Tokenizer.EOF_TOKEN] = eofAfterAfterBody;

IM_[AFTER_AFTER_FRAMESET_MODE] = {};
IM_[AFTER_AFTER_FRAMESET_MODE][Tokenizer.CHARACTER_TOKEN] = characterAfterAfterFrameset;
IM_[AFTER_AFTER_FRAMESET_MODE][Tokenizer.COMMENT_TOKEN] = commentAfterAfterFrameset;
IM_[AFTER_AFTER_FRAMESET_MODE][Tokenizer.DOCTYPE_TOKEN] = doctypeInBody;
IM_[AFTER_AFTER_FRAMESET_MODE][Tokenizer.START_TAG_TOKEN] = startTagAfterAfterFrameset;
IM_[AFTER_AFTER_FRAMESET_MODE][Tokenizer.END_TAG_TOKEN] = endTagAfterAfterFrameset;
IM_[AFTER_AFTER_FRAMESET_MODE][Tokenizer.EOF_TOKEN] = eofAfterAfterFrameset;

//Token handlers for the foreign content
var FC_ = {};

FC_[Tokenizer.CHARACTER_TOKEN] = characterInForeignContent;
FC_[Tokenizer.COMMENT_TOKEN] = commentInForeignContent;
FC_[Tokenizer.START_TAG_TOKEN] = startTagInForeignContent;
FC_[Tokenizer.END_TAG_TOKEN] = endTagInForeignContent;


//Utils
function doNothing() {
}

function isWhitespaceCharacter(ch) {
    return ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r' || ch === '\f';
}

function getTokenAttr(token, attrName) {
    for (var i = token.attrs.length - 1; i >= 0; i--) {
        if (token.attrs[i].name === attrName)
            return token.attrs[i].value;
    }

    return null;
}

//Parser
var Parser = exports.Parser = function (html, treeAdapter) {
    this.tokenizer = new Tokenizer(html);
    this.treeAdapter = treeAdapter || defaultTreeAdapter;

    this.stopped = false;
    this.errBuff = [];

    this.insertionMode = INITIAL_MODE;
    this.originalInsertionMode = '';

    this.document = this.treeAdapter.createDocument();
    this.headElement = null;
    this.formElement = null;
    this.openElements = new OpenElementStack(this.document, this.treeAdapter);
    this.activeFormattingElements = new FormattingElementList(this.treeAdapter);
    this.pendingTableCharacterTokens = [];

    this.framesetOk = true;
};

Parser.prototype._err = function (msg) {
    this.errBuff.push(msg);
};

//Parse
Parser.prototype.parse = function () {
    while (!this.stopped) {
        var token = this.tokenizer.getNextToken();

        if (this._shouldProcessTokenInForeignContent(token))
            FC_[token.type](this, token);

        else
            this._processToken(token);
    }

    return this.document;
};

Parser.prototype._parseText = function (currentToken, nextTokenizerState) {
    this._insertElement(currentToken, NS.HTML);
    this.tokenizer.state = nextTokenizerState;
    this.originalInsertionMode = this.insertionMode;
    this.insertionMode = TEXT_MODE;
};

//Create element
Parser.prototype._createElementForToken = function (token, namespaceURI, selfClosingAcknowledged) {
    if (token.selfClosing && !selfClosingAcknowledged)
        this._err('Parse error');

    if (namespaceURI !== NS.HTML) {
        for (var i = 0; i < token.attrs.length; i++) {
            var attr = token.attrs[i];

            if (attr.name === XMLNS_ATTR && attr.namespace === NS.XMLNS && attr.value !== namespaceURI)
                this._err('Parse error');

            if (attr.name === XLINK_ATTR && attr.namespace === NS.XMLNS && attr.value !== NS.XLINK)
                this._err('Parse error');
        }
    }

    return this.treeAdapter.createElement(token.tagName, token.attrs, namespaceURI);
};

//Tree mutation
Parser.prototype._appendElement = function (token, namespaceURI) {
    var element = this._createElementForToken(token, namespaceURI, true);
    this.treeAdapter.appendNode(this.openElements.current, element);
};

Parser.prototype._insertElement = function (token, namespaceURI) {
    var element = this._createElementForToken(token, namespaceURI, false);
    this.treeAdapter.appendNode(this.openElements.current, element);
    this.openElements.push(element);
};

Parser.prototype._insertFakeRootElement = function () {
    var element = this.treeAdapter.createElement($.HTML, [], NS.HTML);
    this.treeAdapter.appendNode(this.openElements.current, element);
    this.openElements.push(element);
};

Parser.prototype._appendCommentNode = function (token) {
    var commentNode = this.treeAdapter.createCommentNode(token.data);
    this.treeAdapter.appendNode(this.openElements.current, commentNode);
};

Parser.prototype._appendCommentNodeToRootHtmlElement = function (token) {
    var commentNode = this.treeAdapter.createCommentNode(token.data);
    this.treeAdapter.appendNode(this.openElements.items[0], commentNode);
};

Parser.prototype._appendCommentNodeToDocument = function (token) {
    var commentNode = this.treeAdapter.createCommentNode(token.data);
    this.treeAdapter.appendNode(this.document, commentNode);
};

Parser.prototype._insertCharacter = function (token) {
    this.treeAdapter.insertCharacterToNode(this.openElements.current, token.ch);
};


//Token processing
Parser.prototype._shouldProcessTokenInForeignContent = function (token) {
    var currentElement = this.openElements.current;

    if (currentElement === this.document || this.openElements.currentNamespaceURI === NS.HTML)
        return false;

    if (this.openElements.isMathMLTextIntegrationPoint() &&
        (token.type === Tokenizer.CHARACTER_TOKEN || (token.type === Tokenizer.START_TAG_TOKEN &&
                                                      token.tagName !== $.MGLYPH &&
                                                      token.tagName !== $.MALIGNMARK))) {
        return false;
    }

    if (this.openElements.currentTagName === $.ANNOTATION_XML &&
        this.openElements.currentNamespaceURI === NS.MATHML &&
        token.type === Tokenizer.START_TAG_TOKEN && token.tagName === $.SVG) {
        return false;
    }

    if (this.openElements.isHtmlIntegrationPoint() && (token.type === Tokenizer.START_TAG_TOKEN ||
                                                       token.type === Tokenizer.END_TAG_TOKEN)) {
        return false;
    }

    return token.type !== Tokenizer.EOF_TOKEN;
};

Parser.prototype._processToken = function (token) {
    IM_[this.insertionMode][token.type](this, token);
};

Parser.prototype._processFakeStartTag = function (tagName) {
    var fakeToken = this.tokenizer.buildStartTagToken(tagName);

    this._processToken(fakeToken);
    return fakeToken;
};

Parser.prototype._processFakeEndTag = function (tagName) {
    var fakeToken = this.tokenizer.buildEndTagToken(tagName);

    this._processToken(fakeToken);
    return fakeToken;
};

//Foreign content adjustment
Parser.prototype._adjustMathMLAttrs = function (token) {
    for (var i = 0; i < token.attrs.length; i++) {
        if (token.attrs[i].name === MATHML_DEFINITION_URL_ATTR_LOWERCASED) {
            token.attrs[i].name = MATHML_DEFINITION_URL_ATTR_ADJUSTED;
            break;
        }
    }
};

Parser.prototype._adjustSVGAttrs = function (token) {
    for (var i = 0; i < token.attrs.length; i++) {
        var adjustedAttrName = SVG_ATTRS_ADJUSTMENT_MAP[token.attrs[i].name];

        if (adjustedAttrName)
            token.attrs[i].name = adjustedAttrName;
    }
};

Parser.prototype._adjustForeignAttrs = function (token) {
    for (var i = 0; i < token.attrs.length; i++) {
        var adjustedAttrEntry = SVG_ATTRS_ADJUSTMENT_MAP[token.attrs[i].name];

        if (adjustedAttrEntry) {
            token.attrs[i].prefix = adjustedAttrEntry.prefix;
            token.attrs[i].name = adjustedAttrEntry.name;
            token.attrs[i].namespace = adjustedAttrEntry.namespace;
        }
    }
};

Parser.prototype._adjustSVGTagName = function (token) {
    var adjustedTagName = SVG_TAG_NAMES_ADJUSTMENT_MAP[token.tagName];

    if (adjustedTagName)
        token.tagName = adjustedTagName;
};

//Active formatting elements reconstruction
Parser.prototype._reconstructActiveFormattingElements = function () {
    var listLength = this.activeFormattingElements.length;

    if (listLength) {
        var unopenElementIdx = listLength,
            entry = null;

        for (var i = listLength - 1; i >= 0; i--) {
            entry = this.activeFormattingElements.entries[i];

            if (entry.type === FormattingElementList.MARKER_ENTRY || this.openElements.contains(entry.element)) {
                unopenElementIdx = i + 1;
                break;
            }
        }

        for (var i = unopenElementIdx; i < listLength; i++) {
            entry = this.activeFormattingElements.entries[i];
            //TODO here we should use _createElementForFormattingElementListEntry
            this._insertElement(entry.token, this.treeAdapter.getElementNamespaceURI(entry.element));
            entry.element = this.openElements.current;
        }
    }
};

//Check elements that should be closed after <body> tag
Parser.prototype._checkUnclosedElementsInBody = function () {
    for (var i = this.openElements.stackTop; i >= 0; i--) {
        var tn = this.treeAdapter.getElementTagName(this.openElements.items[i]);

        if (!CAN_REMAIN_OPEN_AFTER_BODY[tn]) {
            this._err('Parse error');
            break;
        }
    }
};

//Close cell
Parser.prototype._closeTableCell = function () {
    if (this.openElements.hasInTableScope($.TD))
        this._processFakeEndTag($.TD);

    else
        this._processFakeEndTag($.TH);
};

//Reset the insertion mode appropriately
Parser.prototype._resetInsertionModeAppropriately = function () {
    for (var i = this.openElements.stackTop, last = false; i >= 0; i--) {
        var element = this.openElements.items[i];

        if (this.openElements.items[0] === element) {
            last = true;
            //TODO set node to the context element. (fragment case)
        }

        var tn = this.treeAdapter.getElementTagName(element),
            resetInsertionMode = INSERTION_MODE_RESET_MAP[tn];

        if (resetInsertionMode) {
            this.insertionMode = resetInsertionMode;
            break;
        }

        else if (!last && (tn === $.TD || tn === $.TH)) {
            this.insertionMode = IN_CELL_MODE;
            break;
        }

        else if (last) {
            this.insertionMode = IN_BODY_MODE;
            break;
        }
    }
};

//Adoption agency alogrithm
//(see: http://www.whatwg.org/specs/web-apps/current-work/multipage/tree-construction.html#adoptionAgency)
Parser.prototype._obtainFormattingElementForAdoptionAgency = function (token) {
    //NOTE: step 4 of the algorithm
    var tn = token.tagName,
        formattingElement = this.activeFormattingElements.getElementInScopeWithTagName(tn);

    if (!formattingElement)
        endTagInBodyDefaultHandler(this, token);

    else if (this.openElements.contains(formattingElement)) {
        if (this.openElements.hasInScope(tn)) {
            if (formattingElement !== this.openElements.current)
                this._err('Parse error');
        }

        else {
            this._err('Parse error');
            formattingElement = null;
        }
    }

    else {
        this._err('Parse error');
        formattingElement = null;
    }

    return formattingElement;
};

Parser.prototype._obtainFurthestBlockForAdoptionAgency = function (formattingElement) {
    //NOTE: steps 5 and 6 of the algorithm
    var furthestBlock = null;

    for (var i = this.openElements.stackTop; i >= 0; i--) {
        var element = this.openElements.items[i];

        if (element === formattingElement)
            break;

        if (this._isSpecialElement(element))
            furthestBlock = element;
    }

    if (!furthestBlock) {
        this.openElements.popUntilElementPopped(formattingElement);
        this.activeFormattingElements.remove(formattingElement);
    }

    return furthestBlock;
};

Parser.prototype._adoptionAgencyInnerLoop = function (furthestBlock, formattingElement) {
    var element = null,
        lastElement = furthestBlock,
        nextElement = this.openElements.getCommonAncestor(furthestBlock);

    for (var i = 0; i < 3; i++) {
        element = nextElement;

        //NOTE: store next element for the next loop iteration (it may be deleted from the stack by step 9.5)
        nextElement = this.openElements.getCommonAncestor(element);

        var elementEntry = this.activeFormattingElements.getElementEntry(element);

        if (!elementEntry) {
            this.openElements.remove(element);
            continue;
        }

        if (element === formattingElement)
            break;

        //TODO
    }
};

Parser.prototype._callAdoptionAgency = function (token) {
    for (var i = 0; i < 8; i++) {
        var formattingElement = this._obtainFormattingElementForAdoptionAgency(token);

        if (!formattingElement)
            break;

        var furthestBlock = this._obtainFurthestBlockForAdoptionAgency(formattingElement);

        if (!furthestBlock)
            break;

        var commonAncestor = this.openElements.getCommonAncestor(formattingElement),
            bookmark = this.activeFormattingElements.getElementBookmark(formattingElement);
    }
};

//Special elements
Parser.prototype._isSpecialElement = function (element) {
    var tn = this.treeAdapter.getElementTagName(element),
        ns = this.treeAdapter.getElementNamespaceURI(element);

    return SPECIAL_ELEMENTS[ns][tn];
};

//12.2.5.4.1 The "initial" insertion mode
//------------------------------------------------------------------
function characterInInitialMode(p, token) {
    if (!isWhitespaceCharacter(token.ch))
        initialModeDefaultHandler(p, token);
}

function commentInInitialMode(p, token) {
    p._appendCommentNode(token)
}

function doctypeInInitialMode(p, token) {
    //TODO
}

function initialModeDefaultHandler(p, token) {
    p._err('Parse error');
    p.document.quirksMode = true;
    p.insertionMode = BEFORE_HTML_MODE;
    p._processToken(token);
}


//12.2.5.4.2 The "before html" insertion mode
//------------------------------------------------------------------
function characterBeforeHtml(p, token) {
    if (!isWhitespaceCharacter(token.ch))
        beforeHtmlModeDefaultHandler(p, token);
}

function commentBeforeHtml(p, token) {
    p._appendCommentNode(token);
}

function doctypeBeforeHtml(p, token) {
    p._err('Parse error');
}

function startTagBeforeHtml(p, token) {
    if (token.tagName === $.HTML) {
        p._insertElement(token, NS.HTML);
        p.insertionMode = BEFORE_HEAD_MODE;
    }

    else
        beforeHtmlModeDefaultHandler(p, token);
}

function endTagBeforeHtml(p, token) {
    var tn = token.tagName;

    if (tn === $.HTML || tn === $.HEAD || tn === $.BODY || tn === $.BR)
        beforeHtmlModeDefaultHandler(p, token);

    else
        p._err('Parse error');
}

function beforeHtmlModeDefaultHandler(p, token) {
    p._insertFakeRootElement();
    p.insertionMode = BEFORE_HEAD_MODE;
    p._processToken(token);
}


//12.2.5.4.3 The "before head" insertion mode
//------------------------------------------------------------------
function characterBeforeHead(p, token) {
    if (!isWhitespaceCharacter(token.ch))
        beforeHeadModeDefaultHandler(p, token);
}

function commentBeforeHead(p, token) {
    p._appendCommentNode(token);
}

function doctypeBeforeHead(p, token) {
    p._err('Parse error');
}

function startTagBeforeHead(p, token) {
    var tn = token.tagName;

    if (tn === $.HTML)
        startTagInBody(p, token);

    else if (tn === $.HEAD) {
        p._insertElement(token, NS.HTML);
        p.headElement = p.openElements.current;
        p.insertionMode = IN_HEAD_MODE;
    }

    else
        beforeHeadModeDefaultHandler(p, token);
}

function endTagBeforeHead(p, token) {
    var tn = token.tagName;

    if (tn === $.HEAD || tn === $.BODY || tn === $.HTML || tn === $.BR)
        beforeHeadModeDefaultHandler(p, token);

    else
        p._err('Parse error');
}

function beforeHeadModeDefaultHandler(p, token) {
    p._processFakeStartTag($.HEAD);
    p._processToken(token);
}


//12.2.5.4.4 The "in head" insertion mode
//------------------------------------------------------------------
function characterInHead(p, token) {
    if (isWhitespaceCharacter(token.ch))
        p._insertCharacter(token);

    else
        inHeadModeDefaultHandler(p, token);
}

function commentInHead(p, token) {
    p._appendCommentNode(token);
}

function doctypeInHead(p, token) {
    p._err('Parse error');
}

function startTagInHead(p, token) {
    var tn = token.tagName;

    if (tn === $.HTML)
        startTagInBody(p, token);

    else if (tn === $.BASE || tn === $.BASEFONT || tn === $.BGSOUND || tn === $.LINK || tn === $.META)
        p._appendElement(token, NS.HTML);

    else if (tn === $.TITLE)
        p._parseText(token, Tokenizer.RCDATA_STATE);

    //NOTE: here we assume that we always act as an interactive user agent with enabled scripting, so we parse
    //<noscript> as a rawtext.
    else if (tn === $.NOSCRIPT || tn === $.NOFRAMES || tn === $.STYLE)
        p._parseText(token, Tokenizer.RAWTEXT_STATE);

    else if (tn === $.SCRIPT) {
        p._insertElement(token, NS.HTML);
        p.tokenizer.state = Tokenizer.SCRIPT_DATA_STATE;
        p.originalInsertionMode = IN_HEAD_MODE;
        p.insertionMode = TEXT_MODE;
    }

    else if (tn === $.HEAD)
        p._err('Parsing error');

    else
        inHeadModeDefaultHandler(p, token);
}

function endTagInHead(p, token) {
    var tn = token.tagName;

    if (tn === $.HEAD) {
        p.openElements.pop();
        p.insertionMode = AFTER_HEAD_MODE;
    }

    else if (tn === $.BODY || tn === $.BR || tn === $.HTML)
        inHeadModeDefaultHandler(p, token);

    else
        p._err('Parse error');
}

function inHeadModeDefaultHandler(p, token) {
    p._processFakeEndTag($.HEAD);
    p._processToken(token);
}


//12.2.5.4.6 The "after head" insertion mode
//------------------------------------------------------------------
function characterAfterHead(p, token) {
    if (isWhitespaceCharacter(token.ch))
        p._insertCharacter(token);

    else
        afterHeadModeDefaultHandler(p, token);
}

function commentAfterHead(p, token) {
    p._appendCommentNode(token);
}

function doctypeAfterHead(p, token) {
    p._err('Parse error');
}

function startTagAfterHead(p, token) {
    var tn = token.tagName;

    if (tn === $.HTML)
        startTagInBody(p, token);

    else if (tn === $.BODY) {
        p._insertElement(token, NS.HTML);
        p.framesetOk = false;
        p.insertionMode = IN_BODY_MODE;
    }

    else if (tn === $.FRAMESET) {
        p._insertElement(token, NS.HTML);
        p.insertionMode = IN_FRAMESET_MODE;
    }

    else if (tn === $.BASE || tn === $.BASEFONT || tn === $.BGSOUND || tn === $.LINK || tn === $.META ||
             tn === $.NOFRAMES || tn === $.SCRIPT || tn === $.STYLE || tn === $.TITLE) {
        p.openElements.push(p.headElement);
        startTagInHead(p, token);
        p.openElements.remove(p.headElement);
    }

    else if (tn === $.HEAD)
        p._err('Parse error');

    else
        afterHeadModeDefaultHandler(p, token);
}

function endTagAfterHead(p, token) {
    var tn = token.tagName;

    if (tn === $.BODY || tn === $.HTML || tn === $.BR)
        afterHeadModeDefaultHandler(p, token);

    else
        p._err('Parse error');
}

function afterHeadModeDefaultHandler(p, token) {
    p._processFakeStartTag($.BODY);
    p._processToken(token);
}


//12.2.5.4.7 The "in body" insertion mode
//------------------------------------------------------------------
function characterInBody(p, token) {
    if (token.ch === unicode.NULL_CHARACTER)
        p._err('Parse error');

    else {
        p._reconstructActiveFormattingElements();
        p._insertCharacter(token);

        if (!isWhitespaceCharacter(token.ch))
            p.framesetOk = false;
    }
}

function commentInBody(p, token) {
    p._appendCommentNode(token);
}

function doctypeInBody(p, token) {
    p._err('Parse error');
}

//Start tag in body handlers
var startTagInBodyHandlers = {};

startTagInBodyHandlers[$.HTML] = function htmlStartTagInBody(p, token) {
    p._err('Parse error');
    p.treeAdapter.adoptAttributes(p.openElements.current, token.attrs);
};

startTagInBodyHandlers[$.BASE] =
startTagInBodyHandlers[$.BASEFONT] =
startTagInBodyHandlers[$.BGSOUND] =
startTagInBodyHandlers[$.LINK] =
startTagInBodyHandlers[$.MENUITEM] =
startTagInBodyHandlers[$.META] =
startTagInBodyHandlers[$.SCRIPT] =
startTagInBodyHandlers[$.STYLE] =
startTagInBodyHandlers[$.TITLE] = startTagInHead;

startTagInBodyHandlers[$.BODY] = function bodyStartTagInBody(p, token) {
    p._err('Parse error');

    var bodyElement = p.openElements.tryPeekProperlyNestedBodyElement();

    if (bodyElement) {
        p.framesetOk = false;
        p.treeAdapter.adoptAttributes(bodyElement, token.attrs);
    }
};

startTagInBodyHandlers[$.FRAMESET] = function framesetStartTagInBody(p, token) {
    p._err('Parse error');

    if (p.framesetOk && p.openElements.tryPeekProperlyNestedBodyElement()) {
        p.treeAdapter.detachNode(p.openElements.current);
        p.openElements.popAllUpToHtmlElement();
        p._insertElement(token, NS.HTML);
        p.insertionMode = IN_FRAMESET_MODE;
    }
};

startTagInBodyHandlers[$.ADDRESS] =
startTagInBodyHandlers[$.ARTICLE] =
startTagInBodyHandlers[$.ASIDE] =
startTagInBodyHandlers[$.BLOCKQUOTE] =
startTagInBodyHandlers[$.CENTER] =
startTagInBodyHandlers[$.DETAILS] =
startTagInBodyHandlers[$.DIR] =
startTagInBodyHandlers[$.DIV] =
startTagInBodyHandlers[$.DL] =
startTagInBodyHandlers[$.FIELDSET] =
startTagInBodyHandlers[$.FIGCAPTION] =
startTagInBodyHandlers[$.FIGURE] =
startTagInBodyHandlers[$.FOOTER] =
startTagInBodyHandlers[$.HEADER] =
startTagInBodyHandlers[$.HGROUP] =
startTagInBodyHandlers[$.MAIN] =
startTagInBodyHandlers[$.MENU] =
startTagInBodyHandlers[$.NAV] =
startTagInBodyHandlers[$.OL] =
startTagInBodyHandlers[$.P] =
startTagInBodyHandlers[$.SECTION] =
startTagInBodyHandlers[$.SUMMARY] =
startTagInBodyHandlers[$.UL] = function addressStartTagGroupInBody(p, token) {
    if (p.openElements.hasInButtonScope($.P))
        p._processFakeEndTag($.P);

    p._insertElement(token, NS.HTML);
};

startTagInBodyHandlers[$.H1] =
startTagInBodyHandlers[$.H2] =
startTagInBodyHandlers[$.H3] =
startTagInBodyHandlers[$.H4] =
startTagInBodyHandlers[$.H5] =
startTagInBodyHandlers[$.H6] = function numberedHeaderStartTagInBody(p, token) {
    if (p.openElements.hasInButtonScope($.P))
        p._processFakeEndTag($.P);

    var tn = p.openElements.currentTagName;

    if (tn === $.H1 || tn === $.H2 || tn === $.H3 || tn === $.H4 || tn === $.H5 || tn === $.H6) {
        p._err('Parse error');
        p.openElements.pop();
    }

    p._insertElement(token, NS.HTML);
};

startTagInBodyHandlers[$.PRE] =
startTagInBodyHandlers[$.LISTING] = function preStartTagGroupInBody(p, token) {
    if (p.openElements.hasInButtonScope($.P))
        p._processFakeEndTag($.P);

    p._insertElement(token, NS.HTML);

    //TODO If the next token is a U+000A LINE FEED (LF) character token, then ignore that token and move on to the next one. (Newlines at the start of pre blocks are ignored as an authoring convenience.)
    p.framesetOk = false;
};

startTagInBodyHandlers[$.FORM] = function formStartTagInBody(p, token) {
    if (p.formElement)
        p._err('Parse error');

    else {
        if (p.openElements.hasInButtonScope($.P))
            p._processFakeEndTag($.P);

        p._insertElement(token, NS.HTML);
        p.formElement = p.openElements.current;
    }
};

startTagInBodyHandlers[$.LI] =
startTagInBodyHandlers[$.DD] =
startTagInBodyHandlers[$.DT] = function listItemGroupStartTagInBody(p, token) {
    p.framesetOk = false;

    for (var i = p.openElements.stackTop; i >= 0; i--) {
        var element = p.openElements.items[i],
            tn = p.treeAdapter.getElementTagName(element);

        if (tn !== $.ADDRESS && tn !== $.DIV && tn !== $.P && p._isSpecialElement(element))
            break;

        if ((token.tagName === $.LI && tn === $.LI) ||
            ((token.tagName === $.DD || token.tagName === $.DT) && (tn === $.DD || tn == $.DT))) {
            p._processFakeEndTag(token.tagName);
            break;
        }
    }

    if (p.openElements.hasInButtonScope($.P))
        p._processFakeEndTag($.P);

    p._insertElement(token, NS.HTML);
};

startTagInBodyHandlers[$.PLAINTEXT] = function plaintextStartTagInBody(p, token) {
    if (p.openElements.hasInButtonScope($.P))
        p._processFakeEndTag($.P);

    p._insertElement(token, NS.HTML);
    p.tokenizer.state = Tokenizer.PLAINTEXT_STATE;
};

startTagInBodyHandlers[$.BUTTON] = function buttonStartTagInBody(p, token) {
    if (p.openElements.hasInScope($.BUTTON)) {
        p._err('Parse error');
        p._processFakeEndTag($.BUTTON);
        startTagInBodyHandlers[$.BUTTON](p, token);
    }

    else {
        p._reconstructActiveFormattingElements();
        p._insertElement(token, NS.HTML);
        p.framesetOk = false;
    }
};

startTagInBodyHandlers[$.A] = function aStartTagInBody(p, token) {
    var activeElement = p.activeFormattingElements.getElementInScopeWithTagName($.A);

    if (activeElement) {
        p._err('Parse error');
        p._processFakeEndTag($.A);
        p.openElements.remove(activeElement);
        p.activeFormattingElements.remove(activeElement);
    }

    p._reconstructActiveFormattingElements();
    p._insertElement(token, NS.HTML);
    p.activeFormattingElements.push(p.openElements.current, token);
};

startTagInBodyHandlers[$.B] =
startTagInBodyHandlers[$.BIG] =
startTagInBodyHandlers[$.CODE] =
startTagInBodyHandlers[$.EM] =
startTagInBodyHandlers[$.FONT] =
startTagInBodyHandlers[$.I] =
startTagInBodyHandlers[$.S] =
startTagInBodyHandlers[$.SMALL] =
startTagInBodyHandlers[$.STRIKE] =
startTagInBodyHandlers[$.STRONG] =
startTagInBodyHandlers[$.TT] =
startTagInBodyHandlers[$.U] = function bStartTagGroupInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._insertElement(token, NS.HTML);
    p.activeFormattingElements.push(p.openElements.current, token);
};

startTagInBodyHandlers[$.NOBR] = function nobrStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();

    if (p.openElements.hasInScope($.NOBR)) {
        p._err('Parse error');
        p._processFakeEndTag($.NOBR);
        p._reconstructActiveFormattingElements();
    }

    p._insertElement(token, NS.HTML);
    p.activeFormattingElements.push(p.openElements.current, token);
};

startTagInBodyHandlers[$.APPLET] =
startTagInBodyHandlers[$.MARQUEE] =
startTagInBodyHandlers[$.OBJECT] = function appletStartTagGroupInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._insertElement(token, NS.HTML);
    p.activeFormattingElements.insertMarker();
    p.framesetOk = false;
};

startTagInBodyHandlers[$.TABLE] = function tableStartTagInBody(p, token) {
    if (!p.document.quirksMode && p.openElements.hasInButtonScope($.P))
        p._processFakeEndTag($.P);

    p._insertElement(token, NS.HTML);
    p.framesetOk = false;
    p.insertionMode = IN_TABLE_MODE;
};

startTagInBodyHandlers[$.AREA] =
startTagInBodyHandlers[$.BR] =
startTagInBodyHandlers[$.EMBED] =
startTagInBodyHandlers[$.IMG] =
startTagInBodyHandlers[$.KEYGEN] =
startTagInBodyHandlers[$.WBR] = function areaStartTagGroupInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._appendElement(token, NS.HTML);
    p.framesetOk = false;
};

startTagInBodyHandlers[$.INPUT] = function inputStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._appendElement(token, NS.HTML);

    if (getTokenAttr(token, TYPE_ATTR).toLowerCase() === HIDDEN_INPUT_TYPE)
        p.framesetOk = false;

};

startTagInBodyHandlers[$.PARAM] =
startTagInBodyHandlers[$.SOURCE] =
startTagInBodyHandlers[$.TRACK] = function paramStartTagGroupInBody(p, token) {
    p._appendElement(token, NS.HTML);
};

startTagInBodyHandlers[$.HR] = function hrStartTagInBody(p, token) {
    if (p.openElements.hasInButtonScope($.P))
        p._processFakeEndTag($.P);

    p._appendElement(token, NS.HTML);
    p.framesetOk = false;
};

startTagInBodyHandlers[$.IMAGE] = function imageStartTagInBody(p, token) {
    p._err('Parse error');
    token.tagName = $.IMG;
    startTagInBodyHandlers[$.IMG](p, token);
};

startTagInBodyHandlers[$.ISINDEX] = function isindexStartTagInBody(p, token) {
    p._err('Parse error');

    if (!p.formElement) {
        //TODO
    }
};

startTagInBodyHandlers[$.TEXTAREA] = function textareaStartTagInBody(p, token) {
    p._insertElement(token, NS.HTML);
    //TODO If the next token is a U+000A LINE FEED (LF) character token, then ignore that token and move on to the next one. (Newlines at the start of textarea elements are ignored as an authoring convenience.)
    p.tokenizer.state = Tokenizer.RCDATA_STATE;
    p.originalInsertionMode = p.insertionMode;
    p.framesetOk = false;
    p.insertionMode = TEXT_MODE;
};

startTagInBodyHandlers[$.XMP] = function xmpStartTagInBody(p, token) {
    if (p.openElements.hasInButtonScope($.P))
        p._processFakeEndTag($.P);

    p._reconstructActiveFormattingElements();
    p.framesetOk = false;
    p._parseText(token, Tokenizer.RAWTEXT_STATE);
};

startTagInBodyHandlers[$.IFRAME] = function iframeStartTagInBody(p, token) {
    p.framesetOk = false;
    p._parseText(token, Tokenizer.RAWTEXT_STATE);
};

//NOTE: here we assume that we always act as an interactive user agent with enabled scripting, so we parse
//<noscript> as a rawtext.
startTagInBodyHandlers[$.NOEMBED] =
startTagInBodyHandlers[$.NOSCRIPT] = function noembedStartTagGroupInBody(p, token) {
    p._parseText(token, Tokenizer.RAWTEXT_STATE);
};

startTagInBodyHandlers[$.SELECT] = function selectStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._insertElement(token, NS.HTML);
    p.framesetOk = false;

    if (p.insertionMode === IN_TABLE_MODE || p.insertionMode === IN_CAPTION_MODE ||
        p.insertionMode === IN_TABLE_BODY_MODE || p.insertionMode === IN_ROW_MODE ||
        p.insertionMode === IN_CELL_MODE) {
        p.insertionMode = IN_SELECT_IN_TABLE_MODE;
    }

    else
        p.insertionMode = IN_SELECT_MODE;
};

startTagInBodyHandlers[$.OPTGROUP] =
startTagInBodyHandlers[$.OPTION] = function optgroupStartTagInBody(p, token) {
    if (p.openElements.currentTagName === $.OPTION)
        p._processFakeEndTag($.OPTION);

    p._reconstructActiveFormattingElements();
    p._insertElement(token, NS.HTML);
};

startTagInBodyHandlers[$.RP] =
startTagInBodyHandlers[$.RT] = function rpStartTagGroupInBody(p, token) {
    if (p.openElements.hasInScope($.RUBY)) {
        p.openElements.generateImpliedEndTags();

        if (p.openElements.currentTagName !== $.RUBY)
            p._err('Parse error');
    }

    p._insertElement(token, NS.HTML);
};

startTagInBodyHandlers[$.MATH] = function mathStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._adjustMathMLAttrs(token);
    p._adjustForeignAttrs(token);

    if (token.selfClosing)
        p._appendElement(token, NS.MATHML);
    else
        p._insertElement(token, NS.MATHML);
};

startTagInBodyHandlers[$.SVG] = function svgStartTagInBody(p, token) {
    p._reconstructActiveFormattingElements();
    p._adjustSVGAttrs(token);
    p._adjustForeignAttrs(token);

    if (token.selfClosing)
        p._appendElement(token, NS.SVG);
    else
        p._insertElement(token, NS.SVG);
};

startTagInBodyHandlers[$.CAPTION] =
startTagInBodyHandlers[$.COL] =
startTagInBodyHandlers[$.COLGROUP] =
startTagInBodyHandlers[$.FRAME] =
startTagInBodyHandlers[$.HEAD] =
startTagInBodyHandlers[$.TBODY] =
startTagInBodyHandlers[$.TD] =
startTagInBodyHandlers[$.TFOOT] =
startTagInBodyHandlers[$.TH] =
startTagInBodyHandlers[$.THEAD] =
startTagInBodyHandlers[$.TR] = function captionStartTagGroupInBody(p, token) {
    p._err('Parse error');
};

function startTagInBody(p, token) {
    var tn = token.tagName;

    if (startTagInBodyHandlers[tn])
        startTagInBodyHandlers[tn](p, token);

    else {
        p._reconstructActiveFormattingElements();
        p._insertElement(token, NS.HTML);
    }
}

//End tag in body
var endTagInBodyHandlers = {};

endTagInBodyHandlers[$.BODY] = function bodyEndTagInBody(p, token) {
    if (!p.openElements.hasInScope($.BODY)) {
        p._err('Parse error');
        token.ignored = true;
    }

    else {
        p._checkUnclosedElementsInBody();
        p.insertionMode = AFTER_BODY_MODE;
    }
};

endTagInBodyHandlers[$.HTML] = function htmlEndTagInBody(p, token) {
    var fakeToken = p._processFakeEndTag($.BODY);

    if (!fakeToken.ignored)
        p._processToken(token);
};

endTagInBodyHandlers[$.ADDRESS] =
endTagInBodyHandlers[$.ARTICLE] =
endTagInBodyHandlers[$.ASIDE] =
endTagInBodyHandlers[$.BLOCKQUOTE] =
endTagInBodyHandlers[$.CENTER] =
endTagInBodyHandlers[$.DETAILS] =
endTagInBodyHandlers[$.DIR] =
endTagInBodyHandlers[$.DIV] =
endTagInBodyHandlers[$.DL] =
endTagInBodyHandlers[$.FIELDSET] =
endTagInBodyHandlers[$.FIGCAPTION] =
endTagInBodyHandlers[$.FIGURE] =
endTagInBodyHandlers[$.FOOTER] =
endTagInBodyHandlers[$.HEADER] =
endTagInBodyHandlers[$.HGROUP] =
endTagInBodyHandlers[$.MAIN] =
endTagInBodyHandlers[$.MENU] =
endTagInBodyHandlers[$.NAV] =
endTagInBodyHandlers[$.OL] = 0
endTagInBodyHandlers[$.P] =
endTagInBodyHandlers[$.SECTION] =
endTagInBodyHandlers[$.SUMMARY] =
endTagInBodyHandlers[$.UL] = function addressEndTagGroupInBody(p, token) {
    var tn = token.tagName;

    if (p.openElements.hasInScope(tn)) {
        p.openElements.generateImpliedEndTags();

        if (p.openElements.currentTagName !== tn)
            p._err('Parse error');

        p.openElements.popUntilTagNamePopped(tn);
    }

    else
        p._err('Parse error');
};

endTagInBodyHandlers[$.FORM] = function formEndTagInBody(p, token) {
    var formElement = p.formElement;

    p.formElement = null;

    if (formElement && p.openElements.hasInScope($.FORM)) {
        p.openElements.generateImpliedEndTags();

        if (p.openElements.current !== formElement)
            p._err('Parse error');

        p.openElements.remove(formElement);
    }

    else
        p._err('Parse error');
};

endTagInBodyHandlers[$.P] = function pEndTagInBody(p, token) {
    if (p.openElements.hasInButtonScope($.P)) {
        p.openElements.generateImpliedEndTagsWithExclusion($.P);

        if (p.openElements.currentTagName !== $.P)
            p._err('Parse error');

        p.openElements.popUntilTagNamePopped($.P);
    }

    else {
        p._err('Parse error');
        p._processFakeStartTag($.P);
        p._processToken(token);
    }
};

endTagInBodyHandlers[$.LI] = function liEndTagInBody(p, token) {
    if (p.openElements.hasInListItemScope($.LI)) {
        p.openElements.generateImpliedEndTagsWithExclusion($.LI);

        if (p.openElements.currentTagName !== $.LI)
            p._err('Parse error');

        p.openElements.popUntilTagNamePopped($.LI);
    }

    else
        p._err('Parse error');
};

endTagInBodyHandlers[$.DD] =
endTagInBodyHandlers[$.DT] = function ddEndTagGroupInBody(p, token) {
    var tn = token.tagName;

    if (p.openElements.hasInScope(tn)) {
        p.openElements.generateImpliedEndTagsWithExclusion(tn);

        if (p.openElements.currentTagName !== tn)
            p._err('Parse error');

        p.openElements.popUntilTagNamePopped(tn);
    }

    else
        p._err('Parse error');
};

endTagInBodyHandlers[$.H1] =
endTagInBodyHandlers[$.H2] =
endTagInBodyHandlers[$.H3] =
endTagInBodyHandlers[$.H4] =
endTagInBodyHandlers[$.H5] =
endTagInBodyHandlers[$.H6] = function numberedHeaderEndTagInBody(p, token) {
    if (p.openElements.hasNumberedHeaderInScope()) {
        p.openElements.generateImpliedEndTags();

        var tn = token.tagName;

        if (p.openElements.currentTagName !== tn)
            p._err('Parse error');

        p.openElements.popUntilNumberedHeaderPopped();
    }
};

endTagInBodyHandlers[$.A] =
endTagInBodyHandlers[$.B] =
endTagInBodyHandlers[$.BIG] =
endTagInBodyHandlers[$.CODE] =
endTagInBodyHandlers[$.EM] =
endTagInBodyHandlers[$.FONT] =
endTagInBodyHandlers[$.I] =
endTagInBodyHandlers[$.NOBR] =
endTagInBodyHandlers[$.S] =
endTagInBodyHandlers[$.SMALL] =
endTagInBodyHandlers[$.STRIKE] =
endTagInBodyHandlers[$.STRONG] =
endTagInBodyHandlers[$.TT] =
endTagInBodyHandlers[$.U] = function aEndTagGroupInBody(p, token) {
    p._callAdoptionAgency(token);
};

endTagInBodyHandlers[$.APPLET] =
endTagInBodyHandlers[$.MARQUEE] =
endTagInBodyHandlers[$.OBJECT] = function appletEndTagInBody(p, token) {
    var tn = token.tagName;

    if (p.openElements.hasInScope(tn)) {
        p.openElements.generateImpliedEndTags();

        if (p.openElements.currentTagName !== tn)
            p._err('Parse error');

        p.openElements.popUntilTagNamePopped(tn);
        p.activeFormattingElements.clearToLastMarker();
    }

    else
        p._err('Parse error');
};

endTagInBodyHandlers[$.BR] = function brEndTagInBody(p, token) {
    p._err('Parse error');
    p._processFakeStartTag($.BR);
};


function endTagInBodyDefaultHandler(p, token) {
    var tn = token.tagName;

    for (var i = p.openElements.stackTop; i > 0; i--) {
        var element = p.openElements.items[i];

        if (element.tagName === tn) {
            p.openElements.generateImpliedEndTagsWithExclusion(tn);

            if (p.openElements.currentTagName === tn)
                p._err('Parse error');

            p.openElements.popUntilElementPopped(element);
            break;
        }

        if (p._isSpecialElement(element)) {
            p._err('Parse error');
            break;
        }
    }
}

function endTagInBody(p, token) {
    var tn = token.tagName;

    if (endTagInBodyHandlers[tn])
        endTagInBodyHandlers[tn](p, token);

    else
        endTagInBodyDefaultHandler(p, token);
}

function eofInBody(p, token) {
    p._checkUnclosedElementsInBody();
    p.stopped = false;
}


//12.2.5.4.8 The "text" insertion mode
//------------------------------------------------------------------
function characterInText(p, token) {
    p._insertCharacter(token);
}

function endTagInText(p, token) {
    //NOTE: we are not in interactive user agent, so we don't process script here and just pop it out of the open
    //element stack like any other end tag.
    p.openElements.pop();
    p.insertionMode = p.originalInsertionMode;
}

function eofInText(p, token) {
    p._err('Parse error');
    p.openElements.pop();
    p.insertionMode = p.originalInsertionMode;
    p._processToken(token);
}

//12.2.5.4.9 The "in table" insertion mode
//------------------------------------------------------------------
function characterInTable(p, token) {
    var curTn = p.openElements.currentTagName;

    if (curTn === $.TABLE || curTn === $.TBODY || curTn === $.TFOOT || curTn === $.THEAD || curTn === $.TR) {
        p.pendingTableCharacterTokens = [];
        p.originalInsertionMode = p.insertionMode;
        p.insertionMode = IN_TABLE_TEXT_MODE;
        p._processToken(token);
    }

    else
        inTableModeDefaultHandler(p, token);
}

function commentInTable(p, token) {
    p._appendCommentNode(token);
}

function doctypeInTable(p, token) {
    p._err('Parse error');
}

//Start tag in table
var startTagInTableHandlers = {};

startTagInTableHandlers[$.CAPTION] = function captionStartTagInTable(p, token) {
    p.openElements.clearBackToTableContext();
    p.activeFormattingElements.insertMarker();
    p._insertElement(token, NS.HTML);
    p.insertionMode = IN_CAPTION_MODE;
};

startTagInTableHandlers[$.COLGROUP] = function colgroupStartTagInTable(p, token) {
    p.openElements.clearBackToTableContext();
    p._insertElement(token, NS.HTML);
    p.insertionMode = IN_COLUMN_GROUP_MODE;
};

startTagInTableHandlers[$.COL] = function (p, token) {
    p._processFakeStartTag($.COLGROUP);
    p._processToken(token);
};

startTagInTableHandlers[$.TBODY] =
startTagInTableHandlers[$.TFOOT] =
startTagInTableHandlers[$.THEAD] = function tbodyStartTagGroupInTable(p, token) {
    p.openElements.clearBackToTableContext();
    p._insertElement(token, NS.HTML);
    p.insertionMode = IN_TABLE_BODY_MODE;
};

startTagInTableHandlers[$.TD] =
startTagInTableHandlers[$.TH] =
startTagInTableHandlers[$.TR] = function tdStartTagGroupInTable(p, token) {
    p._processFakeStartTag($.TBODY);
    p._processToken(token);
};

startTagInTableHandlers[$.TABLE] = function tableStartTagInTable(p, token) {
    p._err('Parse error');

    var fakeToken = p._processFakeEndTag($.TABLE);

    //NOTE: The fake end tag token here can only be ignored in the fragment case.
    if (!fakeToken.ignored)
        p._processToken(token);
};

startTagInTableHandlers[$.STYLE] =
startTagInTableHandlers[$.SCRIPT] = startTagInHead;

startTagInTableHandlers[$.INPUT] = function inputStartTagInTable(p, token) {
    if (getTokenAttr(token, TYPE_ATTR).toLowerCase() === HIDDEN_INPUT_TYPE) {
        p._err('Parse error');
        p._appendElement(token, NS.HTML);
    }

    else
        inTableModeDefaultHandler(p, token);
};

startTagInTableHandlers[$.FORM] = function formStartTagInTable(p, token) {
    p._err('Parse error');

    if (!p.formElement) {
        p._insertElement(token, NS.HTML);
        p.formElement = p.openElements.current;
        p.openElements.pop();
    }
};

function startTagInTable(p, token) {
    var tn = token.tagName;

    if (startTagInTableHandlers[tn])
        startTagInTableHandlers[tn](p, token);

    else
        inTableModeDefaultHandler(p, token);
}

function endTagInTable(p, token) {
    var tn = token.tagName;

    if (tn === $.TABLE) {
        if (p.openElements.hasInTableScope($.TABLE)) {
            p.openElements.popUntilTagNamePopped($.TABLE);
            p._resetInsertionModeAppropriately();
        }

        else {
            p._err('Parse error');
            token.ignored = true;
        }
    }

    else if (tn === $.BODY || tn === $.CAPTION || tn === $.COL || tn === $.COLGROUP || tn === $.HTML ||
             tn === $.TBODY || tn === $.TD || tn === $.TFOOT || tn === $.TH || tn === $.THEAD || tn === $.TR) {
        p._err('Parse error');
    }

    else
        inTableModeDefaultHandler(p, token);
}

function eofInTable(p, token) {
    if (!p.openElements.isRootHtmlElementCurrent())
        p._err('Parse error');

    p.stopped = true;
}

function inTableModeDefaultHandler(p, token) {
    //TODO Parse error. Process the token using the rules for the "in body" insertion mode, except that whenever a node
    //would be inserted into the current node when the current node is a table, tbody, tfoot, thead, or tr
    //element, then it must instead be foster parented.
}


//12.2.5.4.10 The "in table text" insertion mode
//------------------------------------------------------------------
function characterInTableText(p, token) {
    if (token.ch === unicode.NULL_CHARACTER)
        p._err('Parse error');

    else
        p.pendingTableCharacterTokens.push(token);
}

function inTableTextModeDefaultHandler(p, token) {
    //TODO
}


//12.2.5.4.11 The "in caption" insertion mode
//------------------------------------------------------------------
function startTagInCaption(o, token) {
    var tn = token.tagName;

    if (tn === $.CAPTION || tn === $.COL || tn === $.COLGROUP || tn === $.TBODY ||
        tn === $.TD || tn === $.TFOOT || tn === $.TH || tn === $.THEAD || tn === $.TR) {
        var fakeToken = p._processFakeEndTag($.CAPTION);

        //NOTE: The fake end tag token here can only be ignored in the fragment case.
        if (!fakeToken.ignored)
            p._processToken(token);
    }

    else
        startTagInBody(p, token);
}

function endTagInCaption(p, token) {
    var tn = token.tagName;

    if (tn === $.CAPTION) {
        if (p.openElements.hasInTableScope($.CAPTION)) {
            p.openElements.generateImpliedEndTags();

            if (p.openElements.currentTagName !== $.CAPTION)
                p._err('Parse error');

            p.openElements.popUntilTagNamePopped($.CAPTION);
            p.activeFormattingElements.clearToLastMarker();
            p.insertionMode = IN_TABLE_MODE;
        }

        else {
            p._err('Parse error');
            token.ignored = true;
        }
    }

    else if (tn === $.TABLE) {
        var fakeToken = p._processFakeEndTag($.CAPTION);

        //NOTE: The fake end tag token here can only be ignored in the fragment case.
        if (!fakeToken.ignored)
            p._processToken(token);
    }

    else if (tn === $.BODY || tn === $.COL || tn === $.COLGROUP || tn === $.HTML || tn === $.TBODY ||
             tn === $.TD || tn === $.TFOOT || tn === $.TH || tn === $.THEAD || tn === $.TR) {
        p._err('Parse error');
    }

    else
        endTagInBody(p, token);
}


//12.2.5.4.12 The "in column group" insertion mode
//------------------------------------------------------------------
function characterInColumnGroup(p, token) {
    if (isWhitespaceCharacter(token.ch))
        p._insertCharacter(token);

    else
        inColumnGroupModeDefaultHandler(p, token);
}

function commentInColumnGroup(p, token) {
    p._appendCommentNode(token);
}

function doctypeInColumnGroup(p, token) {
    p._err('Parse error');
}

function startTagInColumnGroup(p, token) {
    var tn = token.tagName;

    if (tn === $.HTML)
        startTagInBody(p, token);

    else if (tn === $.COL)
        p._appendElement(token, NS.HTML);

    else
        inColumnGroupModeDefaultHandler(p, token);
}

function endTagInColumnGroup(p, token) {
    var tn = token.tagName;

    if (tn === $.COLGROUP) {
        if (p.openElements.isRootHtmlElementCurrent())
            p._err('Parse error');

        else {
            p.openElements.pop();
            p.insertionMode = IN_TABLE_MODE;
        }
    }

    else if (tn === $.COL)
        p._err('Parse error')

    else
        inColumnGroupModeDefaultHandler(p, token);
}

function eofInColumnGroup(p, token) {
    if (p.openElements.isRootHtmlElementCurrent())
        p.stopped = true;

    else
        inColumnGroupModeDefaultHandler(p, token);
}

function inColumnGroupModeDefaultHandler(p, token) {
    var fakeToken = p._processFakeEndTag($.COLGROUP);

    //NOTE: The fake end tag token here can only be ignored in the fragment case.
    if (!fakeToken.ignored)
        p._processToken(token);
}

//12.2.5.4.13 The "in table body" insertion mode
//------------------------------------------------------------------
function startTagInTableBody(p, token) {
    var tn = token.tagName;

    if (tn === $.TR) {
        p.openElements.clearBackToTableContext();
        p._insertElement(token, NS.HTML);
        p.insertionMode = IN_ROW_MODE;
    }

    else if (tn === $.TH || tn === $.TD) {
        p._err('Parse error');
        p._processFakeStartTag($.TR);
        p._processToken(token);
    }

    else if (tn === $.CAPTION || tn === $.COL || tn === $.COLGROUP ||
             tn === $.TBODY || tn === $.TFOOT || tn === $.THEAD) {
        //TODO
    }

    else
        startTagInTable(p, token);
}

function endTagInTableBody(p, token) {
    var tn = token.tagName;

    if (tn === $.TBODY || tn === $.TFOOT || tn === $.THEAD) {
        if (p.openElements.hasInTableScope(tn)) {
            p.openElements.clearBackToTableContext();
            p.openElements.pop();
            p.insertionMode = IN_TABLE_MODE;
        }

        else
            p._err('Parse error');
    }

    else if (tn === $.TABLE) {
        //TODO
    }

    else if (tn === $.BODY || tn === $.CAPTION || tn === $.COL || tn === $.COLGROUP ||
             tn === $.HTML || tn === $.TD || tn === $.TH || tn === $.TR) {
        p._err('Parse error');
    }

    else
        endTagInTable(p, token);
}

//12.2.5.4.14 The "in row" insertion mode
//------------------------------------------------------------------
function startTagInRow(p, token) {
    var tn = token.tagName;

    if (tn === $.TH || tn === $.TD) {
        p.openElements.clearBackToTableContext();
        p._insertElement(token, NS.HTML);
        p.insertionMode = IN_CELL_MODE;
        p.activeFormattingElements.insertMarker();
    }

    else if (tn === $.CAPTION || tn === $.COL || tn === $.COLGROUP || tn === $.TBODY ||
             tn === $.TFOOT || tn === $.THEAD || tn === $.TR) {
        var fakeToken = p._processFakeEndTag($.TR);

        //NOTE: The fake end tag token here can only be ignored in the fragment case.
        if (!fakeToken.ignored)
            p._processToken(token);
    }

    else
        startTagInTable(p, token);
}

function endTagInRow(p, token) {
    var tn = token.tagName;

    if (tn === $.TR) {
        if (p.openElements.hasInTableScope($.TR)) {
            p.openElements.clearBackToTableRowContext();
            p.openElements.pop();
            p.insertionMode = IN_TABLE_BODY_MODE;
        }

        else {
            p._err('Parse error');
            token.ignored = true;
        }
    }

    else if (tn === $.TABLE) {
        var fakeToken = p._processFakeEndTag($.TR);

        //NOTE: The fake end tag token here can only be ignored in the fragment case.
        if (!fakeToken.ignored)
            p._processToken(token);
    }

    else if (tn === $.TBODY || tn === $.TFOOT || tn === $.THEAD) {
        if (p.openElements.hasInTableScope(tn)) {
            p._processFakeEndTag($.TR);
            p._processToken(token);
        }

        else
            p._err('Parse error');
    }

    else if (tn === $.BODY || tn === $.CAPTION || tn === $.COL || tn === $.COLGROUP ||
             tn === $.HTML || tn === $.TD || tn === $.TH) {
        p._err('Parse error');
    }

    else
        endTagInTable(p, token);
}


//12.2.5.4.15 The "in cell" insertion mode
//------------------------------------------------------------------
function startTagInCell(p, token) {
    var tn = token.tagName;
    if (tn === $.CAPTION || tn === $.COL || tn === $.COLGROUP || tn === $.TBODY ||
        tn === $.TD || tn === $.TFOOT || tn === $.TH || tn === $.THEAD || tn === $.TR) {
        if (p.openElements.hasInTableScope($.TD) || p.openElements.hasInTableScope($.TH)) {
            p._closeTableCell();
            p._processToken(token);
        }

        else
            p._err('Parse error');
    }

    else
        startTagInBody(p, token);
}

function endTagInCell(p, token) {
    var tn = token.tagName;

    if (tn === $.TD || tn === $.TH) {
        if (p.openElements.hasInTableScope(tn)) {
            p.openElements.generateImpliedEndTags();

            if (p.openElements.currentTagName !== tn)
                p._err('Parse error');

            p.openElements.popUntilTagNamePopped(tn);
            p.activeFormattingElements.clearToLastMarker();
            p.insertionMode = IN_ROW_MODE;
        }

        else
            p._err('Parse error');
    }

    else if (tn === $.BODY || tn === $.CAPTION || tn === $.COL || tn === $.COLGROUP || tn === $.HTML)
        p._err('Parse error');

    else if (tn === $.TABLE || tn === $.TBODY || tn === $.TFOOT || tn === $.THEAD || tn === $.TR) {
        if (p.openElements.hasInTableScope(tn)) {
            p._closeTableCell();
            p._processToken(token);
        }

        else
            p._err('Parse error');
    }

    else
        endTagInBody(p, token);
}

//12.2.5.4.16 The "in select" insertion mode
//------------------------------------------------------------------
function characterInSelect(p, token) {
    if (token.ch === unicode.NULL_CHARACTER)
        p._err('Parse error');
    else
        p._insertCharacter(token);
}

function commentInSelect(p, token) {
    p._appendCommentNode(token);
}

function doctypeInSelect(p, token) {
    p._err('Parse error');
}

function startTagInSelect(p, token) {
    var tn = token.tagName;

    if (tn === $.HTML)
        startTagInBody(p, token);

    else if (tn === $.OPTION) {
        if (p.openElements.currentTagName === $.OPTION)
            p._processFakeEndTag($.OPTION);

        p._insertElement(token, NS.HTML);
    }

    else if (tn === $.OPTGROUP) {
        if (p.openElements.currentTagName === $.OPTION)
            p._processFakeEndTag($.OPTION);

        if (p.openElements.currentTagName === $.OPTGROUP)
            p._processFakeEndTag($.OPTGROUP);

        p._insertElement(token, NS.HTML);
    }

    else if (tn === $.SELECT) {
        p._err('Parse error');
        p._processFakeEndTag($.SELECT);
    }

    else if (tn === $.INPUT || tn === $.KEYGEN || tn === $.TEXTAREA) {
        p._err('Parse error');

        if (p.openElements.hasInSelectScope($.SELECT)) {
            p._processFakeEndTag($.SELECT);
            p._processToken(token);
        }
    }

    else if (tn === $.SCRIPT)
        startTagInHead(p, token);

    else
        p._err('Parse error');
}

function endTagInSelect(p, token) {
    var tn = token.tagName;

    if (tn === $.OPTGROUP) {
        var prevOpenElement = p.openElements.items[p.openElements.stackTop - 1],
            prevOpenElementTn = prevOpenElement && this.treeAdapter.getElementTagName(prevOpenElement);

        if (p.openElements.currentTagName === $.OPTION && prevOpenElementTn === $.OPTGROUP)
            p._processFakeEndTag($.OPTION);

        if (p.openElements.currentTagName === $.OPTGROUP)
            p.openElements.pop();

        else
            p._err('Parse error');
    }

    else if (tn === $.OPTION) {
        if (p.openElements.currentTagName === $.OPTION)
            p.openElements.pop();

        else
            p._err('Parse error');
    }

    else if (tn === $.SELECT) {
        if (p.openElements.hasInSelectScope($.SELECT)) {
            p.openElements.popUntilTagNamePopped($.SELECT);
            p._resetInsertionModeAppropriately();
        }

        else
            p._err('Parse error');
    }

    else
        p._err('Parse error');
}

function eofInSelect(p, token) {
    if (!p.openElements.isRootHtmlElementCurrent())
        p._err('Parse error');

    p.stopped = true;
}


//12.2.5.4.17 The "in select in table" insertion mode
//------------------------------------------------------------------
function startTagInSelectInTable(p, token) {
    var tn = token.tagName;

    if (tn === $.CAPTION || tn === $.TABLE || tn === $.TBODY || tn === $.TFOOT ||
        tn === $.THEAD || tn === $.TR || tn === $.TD || tn === $.TH) {
        p._err('Parse error');
        p._processFakeEndTag($.SELECT);
        p._processToken(token);
    }

    else
        startTagInSelect(p, token);
}

function endTagInSelectInTable(p, token) {
    var tn = token.tagName;

    if (tn === $.CAPTION || tn === $.TABLE || tn === $.TBODY || tn === $.TFOOT ||
        tn === $.THEAD || tn === $.TR || tn === $.TD || tn === $.TH) {
        p._err('Parse error');

        if (p.openElements.hasInTableScope(tn)) {
            p._processFakeEndTag($.SELECT);
            p._processToken(token);
        }
    }

    else
        endTagInSelect(p, token);
}

//12.2.5.4.18 The "after body" insertion mode
//------------------------------------------------------------------
function characterAfterBody(p, token) {
    if (isWhitespaceCharacter(token.ch))
        characterInBody(p, token);

    else
        afterBodyModeDefaultHandler(p, token);
}

function commentAfterBody(p, token) {
    p._appendCommentNodeToRootHtmlElement(token);
}

function doctypeAfterBody(p, token) {
    p._err('Parse error');
}

function startTagAfterBody(p, token) {
    if (token.tagName === $.HTML)
        startTagInBody(p, token);

    else
        afterBodyModeDefaultHandler(p, token);
}

function endTagAfterBody(p, token) {
    if (token.tagName === $.HTML) {
        //TODO If the parser was originally created as part of the HTML fragment parsing algorithm, this is a parse error; ignore the token. (fragment case)
        //Otherwise, switch the insertion mode to "after after body".
    }

    else
        afterBodyModeDefaultHandler(p, token);
}

function eofAfterBody(p, token) {
    p.stopped = true;
}

function afterBodyModeDefaultHandler(p, token) {
    p._err('Parse error');
    p.insertionMode = IN_BODY_MODE;
    p._processToken(token);
}

//12.2.5.4.19 The "in frameset" insertion mode
//------------------------------------------------------------------
function characterInFrameset(p, token) {
    if (isWhitespaceCharacter(token.ch))
        p._insertCharacter(token);

    else
        p._err('Parse error');
}

function commentInFrameset(p, token) {
    p._appendCommentNode(token);
}

function doctypeInFrameset(p, token) {
    p._err('Parse error');
}

function startTagInFrameset(p, token) {
    var tn = token.tagName;

    if (tn === $.HTML)
        startTagInBody(p, token);

    else if (tn === $.FRAMESET)
        p._insertElement(token, NS.HTML);

    else if (tn === $.FRAME)
        p._appendElement(token, NS.HTML);

    else if (tn === $.NOFRAMES)
        startTagInHead(p, token);

    else
        p._err('Parse error');
}

function endTagInFrameset(p, token) {
    if (token.tagName === $.FRAMESET) {
        if (p.openElements.isRootHtmlElementCurrent())
            p._err('Parse error');

        else {
            p.openElements.pop();
            //TODO If the parser was not originally created as part of the HTML fragment parsing algorithm (fragment case),
            //and the current node is no longer a frameset element, then switch the insertion mode to "after frameset".
        }
    }

    else
        p._err('Parse error');
}

function eofInFrameset(p, token) {
    if (!p.openElements.isRootHtmlElementCurrent())
        p._err('Parse error');

    p.stopped = true;
}

//12.2.5.4.20 The "after frameset" insertion mode
//------------------------------------------------------------------
function characterAfterFrameset(p, token) {
    if (isWhitespaceCharacter(token.ch))
        p._insertCharacter(token);

    else
        p._err('Parse error');
}

function commentAfterFrameset(p, token) {
    p._appendCommentNode(token);
}

function doctypeAfterFrameset(p, token) {
    p._err('Parse error');
}

function startTagAfterFrameset(p, token) {
    var tn = token.tagName;

    if (tn === $.HTML)
        startTagInBody(p, token);

    else if (tn === $.NOFRAMES)
        startTagInHead(p, token);

    else
        p._err('Parse error');
}

function endTagAfterFrameset(p, token) {
    if (token.tagName === $.HTML)
        p.insertionMode = AFTER_AFTER_FRAMESET_MODE;

    else
        p._err('Parse error');
}

function eofAfterFrameset(p, token) {
    p.stopped = true;
}

//12.2.5.4.21 The "after after body" insertion mode
//------------------------------------------------------------------
function characterAfterAfterBody(p, token) {
    if (isWhitespaceCharacter(token.ch))
        characterInBody(p, token);

    else
        afterAfterBodyModeDefaultHandler(p, token);
}

function commentAfterAfterBody(p, token) {
    p._appendCommentNodeToDocument(token);
}

function startTagAfterAfterBody(p, token) {
    if (token.tagName === $.HTML)
        startTagInBody(p, token);

    else
        afterAfterBodyModeDefaultHandler(p, token);
}

function eofAfterAfterBody(p, token) {
    p.stopped = true;
}

function afterAfterBodyModeDefaultHandler(p, token) {
    p._err('Parse error');
    p.insertionMode = IN_BODY_MODE;
    p._processToken(token);
}

//12.2.5.4.22 The "after after frameset" insertion mode
//------------------------------------------------------------------
function characterAfterAfterFrameset(p, token) {
    if (isWhitespaceCharacter(token.ch))
        characterInBody(p, token);

    else
        p._err('Parse error');
}

function commentAfterAfterFrameset(p, token) {
    p._appendCommentNodeToDocument(token);
}

function startTagAfterAfterFrameset(p, token) {
    var tn = token.tagName;

    if (tn === $.HTML)
        startTagInBody(p, token);

    else if (tn === $.NOFRAMES)
        startTagInHead(p, token);

    else
        p._err('Parse error');
}

function endTagAfterAfterFrameset(p, token) {
    p._err('Parse error');
}

function eofAfterAfterFrameset(p, token) {
    p.stopped = true;
}

//12.2.5.5 The rules for parsing tokens in foreign content
//------------------------------------------------------------------
function characterInForeignContent(p, token) {
    if (token.ch === unicode.NULL_CHARACTER) {
        p._err('Parse error');
        token.ch = unicode.REPLACEMENT_CHARACTER;
        p._insertCharacter(token);
    }

    else {
        p._insertCharacter(token);
        p.framesetOk &= isWhitespaceCharacter(token.ch);
    }
}

function commentInForeignContent(p, token) {
    p._appendCommentNode(token);
}

function doctypeInForeignContent(p, token) {
    p._err('Parse error');
}

function startTagInForeignContent(p, token) {
    var tn = token.tagName;

    if (NOT_ALLOWED_IN_FOREIGN_CONTENT[tn] || (tn === $.FONT && (getTokenAttr(token, COLOR_ATTR) !== null ||
                                                                 getTokenAttr(token, FACE_ATTR) !== null ||
                                                                 getTokenAttr(token, SIZE_ATTR) !== null))) {
        p._err('Parse error');
        //TODO If the parser was originally created for the HTML fragment parsing algorithm, then act as described in the "any other start tag" entry below. (fragment case)
        p.openElements.clearBackToNonForeignContext();
        p._processToken(token);
    }

    else {
        if (p.openElements.currentNamespaceURI === NS.MATHML)
            p._adjustMathMLAttrs(token);
        else if (p.openElements.currentNamespaceURI === NS.SVG) {
            p._adjustSVGTagName(token);
            p._adjustSVGAttrs(token);
        }

        p._adjustForeignAttrs(token);

        if (token.selfClosing)
            p._appendElement(token, p.openElements.currentNamespaceURI);
        else
            p._insertElement(token, p.openElements.currentNamespaceURI);
    }
}

function endTagInForeignContent(p, token) {
    //TODO
}