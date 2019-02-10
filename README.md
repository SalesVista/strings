# @salesvista/strings

> Library to easily consume customizable display strings

[![Build Status](https://travis-ci.org/SalesVista/strings.svg?branch=master)](https://travis-ci.org/SalesVista/strings)
[![Coverage Status](https://coveralls.io/repos/github/SalesVista/strings/badge.svg?branch=master)](https://coveralls.io/github/SalesVista/strings?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

This package is a central library for getting customizable, user-facing strings. It defines which strings support customization, via keys exported on the main class, along with default singular and plural values for each.

## Install

```console
$ npm i --save @salesvista/strings
```

```js
// with babel
import Strings from '@salesvista/strings'
// without babel
const Strings = require('@salesvista/strings')
```

## Usage

This library is meant to consume an object representing display strings, allowing easy access to either the singular form or plural form of the string. The display strings object should look like this:

```json
{
  "key_one": "singular_value_one",
  "key_two": {
    "singular": "singular_value_two",
    "plural": "plural_value_two"
  }
}
```

Where the value for each key should either be a string or an object with `singular` and `plural` values.

If no explicit `plural` value is defined, this library will attempt to auto-pluralize the singular form of the string when a plural form is requested.

This library consumes a display strings object in one of two ways:

1. by passing the object and desired key to a static method
2. by wrapping the object in an instance of `Strings` and then passing a desired key to an instance method

Here's an example:

```js
const Strings = require('@salesvista/strings')
const strings = {
  [Strings.GROSS_MARGIN]: {
    singular: 'Profit',
    plural: 'Profit'
  },
  [Strings.EXTENDED_AMOUNT]: {
    singular: 'Revenue',
    plural: 'Revenue'
  },
  [Strings.UNIT]: 'Item'
}
// static usage
Strings.getSingular(strings, Strings.GROSS_MARGIN) //=> 'Profit'
Strings.getPlural(strings, Strings.UNIT) //=> 'Items'
Strings.get(strings, Strings.EXTENDED_AMOUNT) //=> Revenue
// instance usage
const s = Strings.wrap(strings)
s.getSingular(Strings.GROSS_MARGIN) //=> 'Profit'
s.getPlural(Strings.UNIT) //=> 'Items'
s.get(Strings.EXTENDED_AMOUNT) //=> Revenue
```

Each method can also accept an additional options object supporting the following properties:

- `plural` (boolean) or `count` (number): to more easily support conditional plurality using `get()`
- `lc` (boolean) or `uc` (boolean): to transform the display value to lowercase or uppercase, respectively
- `abbrev` (boolean): to abbreviate the display value to the first letter of each word in the string
- `locale` (string): to make sure case-sensitivity respects rules and characters for the user's language and region

## Primary API

### `Strings.get(strings, key, opts)`

Get either the singular or plural value defined in `strings` for `key`. If no value is defined for `key` in `strings`, a default value will be returned instead, if one exists. If a default value does not exist, an empty string will be returned.

`strings` should be an object defined as above.

`key` should be a string representing which value to get. It should typically be a constant defined on the `Strings` class.

For convenience, the first two arguments are interchangeable.

`opts` may be either a boolean, a number, or an object. If it is a boolean, it represents whether to use the plural form or not. If it is a number, it represents the count of items that should be translated to plurality (i.e. `1` for singular, all others for plural). If it is an object, it may contain any of the following properties:

- `plural` (boolean): whether to use the plural form or not (mutually exclusive with `count`)
- `count` (number): number of items that should be translated for plurality (mutually exclusive with `plural`)
- `lc` (boolean): transform the display string to lowercase (mutually exclusive with `uc`)
- `uc` (boolean): transform the display string to uppercase (mutually exclusive with `lc`)
- `abbrev` (boolean): transform the display string to its abbreviated form
- `locale` (string): the user's locale e.g. `'en-US'` or `'en_US'`

### `Strings.getSingular(strings, key, opts)`

Shortcut to get the singular value defined in `strings` for `key`. If no value is defined for `key` in `strings`, a default value will be returned instead, if one exists. If a default value does not exist, an empty string will be returned.

`strings` should be an object defined as above.

`key` should be a string representing which singular value to get. It should typically be a constant defined on the `Strings` class.

For convenience, the first two arguments are interchangeable.

`opts` may be an object representing transformation options. See the static `String.get()` method above.

### `Strings.getPlural(strings, key, opts)`

Shortcut to get the plural value defined in `strings` for `key`. If a singular value is defined for `key` but a plural value is not, the singular value will be auto-pluralized and returned. If no singular or plural value is defined for `key` in `strings`, a default value will be returned instead, if one exists. If a default value does not exist, an empty string will be returned.

`strings` should be an object defined as above.

`key` should be a string representing which plural value to get. It should typically be a constant defined on the `Strings` class.

For convenience, the first two arguments are interchangeable.

`opts` may be an object representing transformation options. See the static `String.get()` method above.

### `Strings.wrap(strings)`

Construct a `Strings` instance that wraps the given `strings` object.

`strings` should be an object defined as above.

Use the instance to pull display string values out of the wrapped object.

### `instance.get(key, opts)`

Get either the singular or plural value defined for `key`. If no value is defined for `key` in the wrapped `strings`, a default value will be returned instead, if one exists. If a default value does not exist, an empty string will be returned.

`key` should be a string representing which value to get. It should typically be a constant defined on the `Strings` class.

### `instance.getSingular(key, opts)`

Shortcut to get the singular value defined for `key`. If no value is defined for `key` in the wrapped `strings`, a default value will be returned instead, if one exists. If a default value does not exist, an empty string will be returned.

`key` should be a string representing which singular value to get. It should typically be a constant defined on the `Strings` class.

`opts` may be an object representing transformation options. See the static `String.get()` method above.

### `instance.getPlural(key, opts)`

Shortcut to get the plural value defined for `key`. If a singular value is defined for `key` but a plural value is not, the singular value will be auto-pluralized and returned. If no singular or plural value is defined for `key` in the wrapped `strings`, a default value will be returned instead, if one exists. If a default value does not exist, an empty string will be returned.

`key` should be a string representing which plural value to get. It should typically be a constant defined on the `Strings` class.

`opts` may be an object representing transformation options. See the static `String.get()` method above.

## Supported Keys

- `Strings.ANNUAL_CONTRACT_VALUE`
- `Strings.CATEGORY`
- `Strings.CLOSED`
- `Strings.COMPENSATION`
- `Strings.DISPUTE`
- `Strings.DRAFT`
- `Strings.EXTENDED_AMOUNT`
- `Strings.GROSS_MARGIN`
- `Strings.MEMBER`
- `Strings.PLAN`
- `Strings.PRODUCT`
- `Strings.PUBLISHED`
- `Strings.QUOTA`
- `Strings.REP`
- `Strings.REPORT`
- `Strings.RULE`
- `Strings.SALE`
- `Strings.TEAM`
- `Strings.UNIT`
- `Strings.VOLUME`

## Secondary API

### `Strings.abbreviate(str)`

Abbreviate the given string by grabbing the first letter/character of each word, where words are separated by whitespace. If no string is given, an empty string will be returned.

E.g. turns `'Annual Contract Value'` into `'ACV'`

### `Strings.isUpper(str, locale)`

Returns a boolean indicating whether the given string is uppercase (in the given locale) or not.

### `Strings.normalizeLocale(locale)`

Naively attempts to normalize the given locale string into the language tag format expected by [`toLocaleUpperCase`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleUpperCase) or [`toLocaleLowerCase`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toLocaleLowerCase), by replacing underscores with hyphens.

E.g. turns `'en_US'` into `'en-US'`

### `Strings.pluralize(str, locale)`

Attempts to apply pluralization to the given string in a case-sensitive manner.

E.g. turns `'plan'` into `'plans'`, turns `'box'` into `'boxes'`, and turns `'fly'` into `'flies'`

### `Strings.toLower(str, locale)`

Attempts to safely transform the given string into lowercase. If a locale is given, it will be normalized. If the locale-specific operation fails, it will fall back to a locale-agnostic operation.

### `Strings.toUpper(str, locale)`

Attempts to safely transform the given string into uppercase. If a locale is given, it will be normalized. If the locale-specific operation fails, it will fall back to a locale-agnostic operation.

## Releasing

After one or more PRs have been merged to master, you can cut a new release with the following commands:

```bash
# update local master branch
git checkout master && git pull origin master
# make sure tests pass
npm it
# bump version, update changelog, and create git tag
npm run release
# push release to github
git push -u --follow-tags origin master
# publish release to npm
npm publish --access public
```

Then you can update the version referenced by any apps/packages that use this as a dependency.
