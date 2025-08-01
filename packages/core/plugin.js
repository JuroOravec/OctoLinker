/** @typedef { { pathRegexes: RegExp[]; githubClasses: string[]; } } PluginPatterns */
/** @typedef { { name: string; needsContext: boolean; patterns: PluginPatterns; } } Plugin */

// TODO
// getLinkRegexes
// parseBlob
// getLinkRegexes

/**
 * @template {Plugin} T
 * @param {T} pluginData
 * */
export const definePlugin = (pluginData) => {
  if (!pluginData.name) {
    throw Error('Plugin is missing name');
  }
  if (!pluginData.patterns) {
    throw Error('Plugin is missing patterns');
  }
  if (!pluginData.patterns.pathRegexes) {
    throw Error('Plugin is missing patterns.pathRegexes');
  }
  if (!pluginData.patterns.githubClasses) {
    throw Error('Plugin is missing patterns.githubClasses');
  }

  return pluginData;
};
