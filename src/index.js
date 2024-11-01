const VOWEL_REGEX = /[aeiouy]/i
const VOWEL_REGEX_NOY = /[aeiou]/i
const VOWEL_REGEX_G = /[aeiouy]/ig
const WHITESPACE_EQUIV_REGEX_G = /[-_.,+]/g
const IGNORED_CHARS_REGEX_G = /[^\w\s]/g

class Strings {
  static normalizeLocale (locale) {
    if (!locale) return undefined

    // split on comma, map to value + q, find first highest q, grab value
    let tokens
    locale = [].concat(locale).filter(Boolean).join(',').split(',').map(l => {
      tokens = l.trim().split(';')
      return {
        l: tokens[0].trim(),
        q: (tokens[1] && Number(tokens[1].replace('q', '').replace('=', ''))) || 1
      }
    }).reduce((a, o) => {
      return (o.l && o.l !== '*' && (!a.l || o.q > a.q)) ? o : a
    }, { q: 0 }).l

    // then replace _ with -
    return locale && locale.replace(/_/g, '-')
  }

  static toUpper (s, locale) {
    if (!s) return ''
    s = String(s)
    try {
      return s.toLocaleUpperCase(Strings.normalizeLocale(locale))
    } catch (_) {}
    return s.toUpperCase()
  }

  static toLower (s, locale) {
    if (!s) return ''
    s = String(s)
    try {
      return s.toLocaleLowerCase(Strings.normalizeLocale(locale))
    } catch (_) {}
    return s.toLowerCase()
  }

  static toFirstLetterUpper (s, locale) {
    if (!s) return ''
    s = String(s)

    try {
      return s.charAt(0).toLocaleUpperCase(Strings.normalizeLocale(locale)) + s.slice(1)
    } catch (_) {}

    return s.charAt(0).toUpperCase() + s.slice(1)
  }

  static isUpper (c, locale) {
    if (!c) return false
    return String(c) !== Strings.toLower(c, locale)
  }

  // valid opts:
  // - suffix (string, default based on str) to customize pluralization
  // - locale (string, no default) to respect user's language + region
  static toPlural (str, opts) {
    if (!str) return ''
    opts = opts || {}
    str = String(str)
    const last = str.slice(-1)
    let add
    if (opts.suffix) add = opts.suffix
    else {
      add = 's'
      if (~['y', 'Y'].indexOf(last)) {
        str = str.slice(0, -1)
        add = 'ies'
      } else if (~['h', 'j', 'o', 's', 'x', 'z', 'H', 'J', 'O', 'S', 'X', 'Z'].indexOf(last)) {
        add = 'es'
      }
    }
    return Strings.isUpper(last, opts.locale) ? str + Strings.toUpper(add, opts.locale) : str + add
  }

  static formatInt (integer, locale) {
    try {
      return new Intl.NumberFormat(Strings.normalizeLocale(locale), { maximumFractionDigits: 0 }).format(integer)
    } catch (_) {}
    return String(integer)
  }

  // valid opts:
  // - plural or other (string, no default) to specify the whole plural form of the word rather than just the suffix
  // - suffix (string, default based on str) to customize pluralization
  // - locale (string, no default) to respect user's language + region
  // - includeCount (boolean, default true) to include the formatted number in the returned string
  static pluralize (count, noun, opts) {
    if (!noun) return ''
    noun = String(noun)
    if (typeof count !== 'number') count = Number(count)
    if (Number.isNaN(count)) count = 0
    let suffix, locale, plural, includeCount
    if (typeof opts === 'string') {
      suffix = opts
      includeCount = true
    } else {
      opts = opts || {}
      suffix = opts.suffix
      locale = opts.locale
      plural = opts.plural || opts.other
      includeCount = typeof opts.includeCount === 'boolean' ? opts.includeCount : true
    }
    if (count !== 1) {
      noun = plural || Strings.toPlural(noun, { suffix, locale })
    }
    return (includeCount ? Strings.formatInt(count, locale) + ' ' : '') + noun
  }

  static isVowel (char, includeY = true) {
    return !!char && (includeY ? VOWEL_REGEX : VOWEL_REGEX_NOY).test(char)
  }

  static startsWithVowel (str) {
    return !!str && Strings.isVowel(String(str).charAt(0), false)
  }

  static withArticle (str, opts) {
    if (!str) return ''

    str = String(str)
    let article
    if (Strings.startsWithVowel(str)) {
      article = (opts && opts.vowel) || 'an'
    } else {
      article = (opts && opts.consonant) || 'a'
    }

    const locale = opts && opts.locale
    if (Strings.isUpper(str.charAt(0), locale)) {
      article = Strings.toFirstLetterUpper(article, locale)
    }
    return (article ? article + ' ' : '') + str
  }

  static abbreviate (str, singleWordSize) {
    if (!str) return ''
    const words = String(str).replace(WHITESPACE_EQUIV_REGEX_G, ' ').replace(IGNORED_CHARS_REGEX_G, '').split(/\s/)
    if (words.length === 1) {
      const w = words[0]
      singleWordSize = parseInt(singleWordSize, 10)
      if (isNaN(singleWordSize) || singleWordSize < 1) singleWordSize = 3
      // first check SPECIAL_ABBREVS
      for (const [regex, indices] of Strings.SPECIAL_ABBREVS) {
        if (regex.test(w) && singleWordSize <= indices.length) {
          return indices.reduce((abbr, i) => abbr + (abbr.length < singleWordSize ? w[i] : ''), '') // singleWordSize behaving as "max" here
        }
      }
      // otherwise use default logic:
      // whole word if less than 4 chars
      if (w.length <= singleWordSize) return w
      // first char only if 4 chars e.g. 'unit' -> 'u'
      // if (w.length === 4) return w[0]
      // first 3 chars if ends in vowel e.g. 'volume' -> 'vol', 'revenue' -> 'rev'
      if (Strings.isVowel(w.slice(-1))) return w.slice(0, singleWordSize)
      // otherwise take first char + next two consonants
      return w.slice(0, 1) + w.slice(1).replace(VOWEL_REGEX_G, '').slice(0, singleWordSize - 1)
    }
    return words.reduce((abbr, word) => abbr + word.slice(0, 1), '')
  }

  // valid opts:
  // - plural (boolean, no default) or count (number, no default) to determine whether singular or plural value should be used
  // - suffix (string, default based on value) to customize auto-pluralization
  // - lc (boolean, default false) or uc (boolean, default false) to transform value to lower or upper case before returning
  // - abbrev (boolean, default false) to abbreviate the value before returning
  // - strict (boolean, default true) to return empty string if key not in strings nor in DEFAULTS
  // - locale (string, no default) to respect user's language + region
  // - min (integer, no default) to specify the minimum number of chars returned (if possible) when abbreviation is used
  // - max (integer, no default) to specify the maximum number of chars allowed before abbreviation is used
  // - includeCount (boolean, default false) to include count as formatted integer in returned string (requires count option)
  // - withArticle (boolean, default false) to prefix returned string with 'a'/'an' (or with given `consonant`/`vowel` opts)
  static get (strings, key, opts) {
    // allow first two args to be interchangeable
    if (typeof strings === 'string') {
      if (typeof key === 'object') {
        const k = strings
        strings = key
        key = k
      } else {
        key = strings
        strings = Strings.DEFAULTS
      }
    }
    if (strings == null) strings = Strings.DEFAULTS
    // must have first two args
    if (typeof strings !== 'object' || typeof key !== 'string') return ''
    // check third arg
    if (typeof opts === 'boolean') opts = { plural: opts }
    else if (typeof opts === 'number') opts = { count: opts }
    else opts = opts || {}
    if (typeof opts.strict !== 'boolean') opts.strict = true
    // get value (object or singular string)
    let val = typeof strings.strings === 'object' ? strings.strings[key] : strings[key]
    if (val == null) val = Strings.DEFAULTS[key]

    if (val == null) {
      if (opts.strict) return ''
      val = key
    }

    // check for locale
    const locale = opts.locale || strings.locale

    // if includeCount and count given, use pluralize to include formatted integer
    if (opts.includeCount === true && typeof opts.count === 'number') {
      return Strings.pluralize(
        opts.count,
        Strings.get(strings, key, Object.assign({}, opts, { includeCount: false, plural: false })),
        {
          locale,
          plural: Strings.get(strings, key, Object.assign({}, opts, { includeCount: false, plural: true }))
        }
      )
    }

    // determine plurality
    let usePlural = false
    if (typeof opts.plural === 'boolean') usePlural = opts.plural
    else if (typeof opts.count === 'number') usePlural = opts.count !== 1
    // extract value
    if (usePlural) {
      if (typeof val === 'string') val = Strings.toPlural(val, { locale, suffix: opts.suffix })
      else if (val.plural || val.other) val = val.plural || val.other
      else if (val.singular || val.one) val = Strings.toPlural(val.singular || val.one, { locale, suffix: opts.suffix })
    } else if (typeof val !== 'string' && (val.singular || val.one)) {
      val = val.singular || val.one
    }
    if (typeof val !== 'string') {
      if (opts.strict) return ''
      val = key
    }
    // should now have val to use, apply transformational opts
    let max = NaN
    if (opts.max != null) max = parseInt(opts.max, 10)
    if (opts.lc) val = Strings.toLower(val, locale)
    else if (opts.uc) val = Strings.toUpper(val, locale)
    else if (opts.flu) val = Strings.toFirstLetterUpper(val, locale)

    if (opts.abbrev || (!isNaN(max) && String(val).length > max)) return Strings.abbreviate(val, opts.min)

    if (opts.withArticle) {
      return Strings.withArticle(val, Object.assign({}, opts, { locale }))
    }
    return val
  }

  // valid opts:
  // - lc (boolean, default false) or uc (boolean, default false) to transform value to lower or upper case before returning
  // - abbrev (boolean, default false) to abbreviate the value before returning
  // - strict (boolean, default true) to return empty string if key not in strings nor in DEFAULTS
  // - locale (string, no default) to respect user's language + region
  static getSingular (strings, key, opts) {
    return Strings.get(strings, key, Object.assign({}, opts, { plural: false }))
  }

  // valid opts:
  // - suffix (string, default based on value) to customize auto-pluralization
  // - lc (boolean, default false) or uc (boolean, default false) to transform value to lower or upper case before returning
  // - abbrev (boolean, default false) to abbreviate the value before returning
  // - strict (boolean, default true) to return empty string if key not in strings nor in DEFAULTS
  // - locale (string, no default) to respect user's language + region
  static getPlural (strings, key, opts) {
    return Strings.get(strings, key, Object.assign({}, opts, { plural: true }))
  }

  static wrap (strings) {
    return new Strings(strings)
  }

  constructor (strings) {
    this.strings = strings
  }

  // valid opts: plural (boolean), count (number), suffix (string), lc (boolean), uc (boolean), abbrev (boolean), strict (boolean), locale (string)
  get (key, opts) {
    return Strings.get(this.strings, key, opts)
  }

  // valid opts: lc (boolean), uc (boolean), abbrev (boolean), strict (boolean), locale (string)
  getSingular (key, opts) {
    return Strings.getSingular(this.strings, key, opts)
  }

  // valid opts: suffix (string), lc (boolean), uc (boolean), abbrev (boolean), strict (boolean), locale (string)
  getPlural (key, opts) {
    return Strings.getPlural(this.strings, key, opts)
  }
}

Strings.GROSS_MARGIN = 'gross_margin'
Strings.EXTENDED_AMOUNT = 'extended_amount'
Strings.ANNUAL_CONTRACT_VALUE = 'annual_contract_value'
Strings.VOLUME = 'volume'
Strings.UNIT = 'unit'
Strings.PRODUCT = 'product'
Strings.CATEGORY = 'category'
Strings.PLAN = 'plan'
Strings.QUOTA = 'quota'
Strings.RULE = 'rule'
Strings.SALE = 'sale'
Strings.TRANSACTION_DATE = 'transaction_date'
Strings.OTHER_COMP = 'other_comp'
Strings.COMPENSATION = 'compensation'
Strings.REPORT = 'report'
Strings.DRAFT = 'draft'
Strings.PUBLISHED = 'published'
Strings.CLOSED = 'closed'
Strings.DISPUTE = 'dispute'
Strings.MEMBER = 'member'
Strings.REP = 'rep'
Strings.TEAM = 'team'
Strings.ADJUSTMENT = 'adjustment'
Strings.BATCH = 'batch'

Strings.DEFAULTS = {
  [Strings.GROSS_MARGIN]: {
    singular: 'Gross Margin',
    plural: 'Gross Margin'
  },
  [Strings.EXTENDED_AMOUNT]: {
    singular: 'Extended Amount',
    plural: 'Extended Amount'
  },
  [Strings.ANNUAL_CONTRACT_VALUE]: {
    singular: 'Annual Contract Value',
    plural: 'Annual Contract Value'
  },
  [Strings.VOLUME]: {
    singular: 'Volume',
    plural: 'Volume'
  },
  [Strings.UNIT]: 'Unit',
  [Strings.PRODUCT]: 'Product',
  [Strings.CATEGORY]: {
    singular: 'Category',
    plural: 'Categories'
  },
  [Strings.PLAN]: 'Plan',
  [Strings.QUOTA]: 'Quota',
  [Strings.RULE]: 'Rule',
  [Strings.SALE]: 'Sale',
  [Strings.TRANSACTION_DATE]: 'Transaction Date',
  [Strings.OTHER_COMP]: {
    singular: 'Other Compensation',
    plural: 'Other Compensation'
  },
  [Strings.COMPENSATION]: {
    singular: 'Compensation',
    plural: 'Compensation'
  },
  [Strings.REPORT]: 'Report',
  [Strings.DRAFT]: {
    singular: 'Draft',
    plural: 'Draft'
  },
  [Strings.PUBLISHED]: {
    singular: 'Published',
    plural: 'Published'
  },
  [Strings.CLOSED]: {
    singular: 'Closed',
    plural: 'Closed'
  },
  [Strings.DISPUTE]: 'Dispute',
  [Strings.MEMBER]: 'Member',
  [Strings.REP]: 'Rep',
  [Strings.TEAM]: 'Team',
  [Strings.ADJUSTMENT]: 'Adjustment',
  [Strings.BATCH]: 'Batch'
}

Strings.SPECIAL_ABBREVS = new Map([
  [/amount/i, [0, 1, 5]], // amt
  [/profit/i, [0, 3, 5]], // pft
  [/margin/i, [0, 3, 5]], // mgn
  [/report/i, [0, 2, 5]], // rpt
  [/member/i, [0, 3, 5]], // mbr
  [/payment/i, [0, 3, 6]], // pmt
  [/commission/i, [0, 1, 2]] // com
])

module.exports = Strings
