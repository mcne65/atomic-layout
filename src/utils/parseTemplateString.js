import * as R from 'ramda'
import resolutions, { getResolutionFor } from '../const/resolutions'
import sanitizeTemplateString from './sanitizeTemplateString'
import generateComponents from './generateComponents'

export default function parseTemplates(templates) {
  const templatesCount = templates.length

  // Remap template data to more readable format.
  // TODO Consider changing "parseResponsiveProp" return API
  // because this is the only place it's used.
  const cleanTemplates = templates.map(
    ({ behavior, mediaQuery, propValue }) => ({
      behavior,
      mediaQuery,
      areas: sanitizeTemplateString(propValue),
    }),
  )

  // Reduce template data into { [areaName]: areaResolutions } object.
  const reducedAreas = cleanTemplates.reduce((all, template, index) => {
    const { areas, behavior } = template
    const mediaQuery = template.mediaQuery || 'xs'
    const areaResolution = getResolutionFor(mediaQuery)
    const isLast = index === templatesCount - 1

    return areas.reduce((allAreasOptions, areaName) => {
      const prevAreaOptions = allAreasOptions[areaName] || []
      const lastAreaOptions = prevAreaOptions[prevAreaOptions.length - 1]

      const shouldUpdateLast =
        !!lastAreaOptions &&
        (lastAreaOptions.to + 1 === areaResolution.from ||
          (behavior === lastAreaOptions.behavior ||
            (lastAreaOptions.behavior === 'up' && behavior === 'down')))

      if (shouldUpdateLast) {
        const nextTo =
          isLast && behavior === 'up' ? undefined : areaResolution.to

        prevAreaOptions[prevAreaOptions.length - 1] = {
          from: lastAreaOptions.from,
          to: nextTo,
        }

        return Object.assign({}, allAreasOptions, {
          [areaName]: prevAreaOptions,
        })
      }

      const nextAreaOptions = prevAreaOptions.concat({
        behavior,
        from: areaResolution.from,
        to: areaResolution.to,
      })

      return Object.assign({}, allAreasOptions, {
        [areaName]: nextAreaOptions,
      })
    }, all)
  }, {})

  // 3. Generate components based on reducedAreas and their resolutions
  const areaComponents = generateComponents(reducedAreas)

  return areaComponents
}
