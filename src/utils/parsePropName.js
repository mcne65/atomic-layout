// @flow
import type { TBreakpointBehavior } from '../const/defaultOptions'
import Layout from '../Layout'

export type TParsedProp = {
  purePropName: string,
  breakpointName?: string,
  behavior: TBreakpointBehavior,
}

/**
 * Returns a parsed prop summary, which includes pure prop name,
 * an optional breakpoint name and breakpoint behavior.
 */
export default function parsePropName(propName: string): TParsedProp {
  const joinedBreakpointNames = Layout.getBreakpointsNames().join('|')
  const joinedBehaviors = ['down', 'only'].join('|')
  const breakpointExp = new RegExp(`(${joinedBreakpointNames})$`, 'gi')
  const behaviorExp = new RegExp(`(${joinedBehaviors})$`, 'gi')

  const behaviorMatch = propName.match(behaviorExp)
  const behavior = behaviorMatch && behaviorMatch[0]
  const breakpointMatch = propName.replace(behavior, '').match(breakpointExp)
  const breakpointName = breakpointMatch && breakpointMatch[0]
  const purePropName = propName
    .replace(breakpointName, '')
    .replace(behavior, '')

  return {
    purePropName,
    breakpointName: breakpointName ? breakpointName.toLowerCase() : 'xs',
    behavior: behavior ? behavior.toLowerCase() : 'up',
  }
}