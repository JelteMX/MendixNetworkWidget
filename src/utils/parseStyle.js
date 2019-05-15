/**
 *  Parse the added styles to the widget via the 'style' field in the modeler.
 * @public
 * @method
 * @param {string} style - styles as string
 * @return {Object} the resulted style object
 */
export function parseStyle(style = '') {
  try {
    return style.split(';').reduce((styleObject, line) => {
      const pair = line.split(':');
      if (pair.length === 2) {
        const name = pair[0].trim().replace(/(-.)/g, match => match[1].toUpperCase());
        styleObject[name] = pair[1].trim();
      }
      return styleObject;
    }, {});
  } catch (error) {
    console.log('Failed to parse style', style, error);
  }
  return {};
}
