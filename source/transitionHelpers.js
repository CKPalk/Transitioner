/* eslint-disable no-restricted-syntax, guard-for-in, no-prototype-builtins, no-underscore-dangle */
import { Children } from 'react'


/**
 * Given `this.props.children`, return an object mapping key to child.
 *
 * @param {*} children `this.props.children`
 * @return {object} Mapping of key to child
 */
export function getChildMapping(children) {
  if (!children)
    return children

  return Children.toArray(children).reduce(
    (agg, child) => ({ ...agg, [child.key]: child }), {}
  )
}

/**
 * When you're adding or removing children some may be added or removed in the
 * same render pass. We want to show *both* since we want to simultaneously
 * animate elements in and out. This function takes a previous set of keys
 * and a new set of keys and merges them with its best guess of the correct
 * ordering. In the future we may expose some of the utilities in
 * ReactMultiChild to make this easy, but for now React itself does not
 * directly have this concept of the union of prevChildren and nextChildren
 * so we implement it here.
 *
 * @param {object} prev prev children as returned from
 * `ReactTransitionChildMapping.getChildMapping()`.
 * @param {object} next next children as returned from
 * `ReactTransitionChildMapping.getChildMapping()`.
 * @return {object} a key set that contains all keys in `prev` and all keys
 * in `next` in a reasonable order.
 */
export function mergeChildMappings(prev = {}, next = {}) {
  function getValueForKey(key) {
    if (next.hasOwnProperty(key))
      return next[key]

    return prev[key]
  }

  // For each key of `next`, the list of keys to insert before that key in
  // the combined list
  const nextKeysPending = {}

  let pendingKeys = []
  for (const prevKey in prev)
    if (next.hasOwnProperty(prevKey)) {
      if (pendingKeys.length) {
        nextKeysPending[prevKey] = pendingKeys
        pendingKeys = []
      }
    } else {
      pendingKeys.push(prevKey)
    }

  let i
  const childMapping = {}
  for (const nextKey in next) {
    if (nextKeysPending.hasOwnProperty(nextKey))
      for (i = 0; i < nextKeysPending[nextKey].length; i += 1) {
        const pendingNextKey = nextKeysPending[nextKey][i]
        childMapping[nextKeysPending[nextKey][i]] = getValueForKey(
          pendingNextKey,
        )
      }

    childMapping[nextKey] = getValueForKey(nextKey)
  }

  // Finally, add the keys which didn't appear before any key in `next`
  for (i = 0; i < pendingKeys.length; i += 1)
    childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i])

  return childMapping
}

export function camelToDashString(string = '') {
  return (string.match(/(^|[A-Z]).+?(?=([A-Z]|$))/g) || [])
    .map(s => s.toLowerCase())
    .join('-')
}


export const timingFunctions = {

  // defaults
  linear: 'linear',
  ease: 'ease',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',

  // Penner equations
  cubic: {
    easeIn: 'cubic-bezier(.55,.055,.675,.19)',
    easeOut: 'cubic-bezier(.215,.61,.355,1)',
    easeInOut: 'cubic-bezier(.645,.045,.355,1)'
  },

  circ: {
    easeIn: 'cubic-bezier(.6,.04,.98,.335)',
    easeOut: 'cubic-bezier(.075,.82,.165,1)',
    easeInOut: 'cubic-bezier(.785,.135,.15,.86)'
  },

  expo: {
    easeIn: 'cubic-bezier(.95,.05,.795,.035)',
    easeOut: 'cubic-bezier(.19,1,.22,1)',
    easeInOut: 'cubic-bezier(1,0,0,1)'
  },

  quad: {
    easeIn: 'cubic-bezier(.55,.085,.68,.53)',
    easeOut: 'cubic-bezier(.25,.46,.45,.94)',
    easeInOut: 'cubic-bezier(.455,.03,.515,.955)'
  },

  quart: {
    easeIn: 'cubic-bezier(.895,.03,.685,.22)',
    easeOut: 'cubic-bezier(.165,.84,.44,1)',
    easeInOut: 'cubic-bezier(.77,0,.175,1)'
  },

  quint: {
    easeIn: 'cubic-bezier(.755,.05,.855,.06)',
    easeOut: 'cubic-bezier(.23,1,.32,1)',
    easeInOut: 'cubic-bezier(.86,0,.07,1)'
  },

  sine: {
    easeIn: 'cubic-bezier(.47,0,.745,.715)',
    easeOut: 'cubic-bezier(.39,.575,.565,1)',
    easeInOut: 'cubic-bezier(.445,.05,.55,.95)'
  },

  back: {
    easeIn: 'cubic-bezier(.6,-.28,.735,.045)',
    easeOut: 'cubic-bezier(.175, .885,.32,1.275)',
    easeInOut: 'cubic-bezier(.68,-.55,.265,1.55)'
  }
}


function flatten(object = {}, keyTemplate = ((p, c) => `${p}_${c}`)) {
  function recFlatten(obj, parentKey) {
    return Object.keys(obj).reduce((agg, key) => {
      const value = obj[key]
      return (typeof value === 'object') ?
        { ...agg, ...recFlatten(obj[key], key) } :
        { ...agg, [parentKey ? keyTemplate(parentKey, key) : key]: value }
    }, {})
  }
  return recFlatten(object)
}


const keyCombiner = (pk, ck) => `${ck}${pk.charAt(0).toUpperCase()}${pk.slice(1)}`
export const STRING_TO_TIMING_FUNCTION = flatten(timingFunctions, keyCombiner)
