/** @typedef { { pathRegexes: RegExp[]; githubClasses: string[]; } } PluginPatterns */
/** @typedef { { name: string; needsContext: boolean; patterns: PluginPatterns; } } Plugin */
/** @typedef { Map<string | RegExp, Set<Plugin>> } PluginCache */

/**
 * @template T
 * @param {T[][]} arr
 * @returns {T[]}
 */
function flattenAndCompact(arr) {
  return [].concat(...arr).filter((item) => !!item);
}

/**
 * @param {PluginCache} cache
 * @param {string | RegExp} key
 * @param {Plugin} plugin
 */
function addPluginToKey(cache, key, plugin) {
  const pluginsForKey = cache.get(key) || new Set();

  pluginsForKey.add(plugin);

  if (!cache.has(key)) {
    cache.set(key, pluginsForKey);
  }
}

/** @param {Plugin[]} plugins */
function buildPluginCache(plugins) {
  /** @type {PluginCache} */
  const cache = new Map();

  plugins.forEach((plugin) => {
    plugin.patterns.pathRegexes.forEach((pattern) => {
      addPluginToKey(cache, pattern, plugin);
    });

    plugin.patterns.githubClasses.forEach((githubClass) => {
      addPluginToKey(cache, githubClass, plugin);
    });
  });

  return cache;
}

/**
 * @param {PluginCache} plugins
 * @param {string} filepath
 */
function getPluginsForPath(plugins, filepath) {
  /** @type {Plugin[]} */
  const results = [];
  for (const [key, matchedPlugins] of plugins) {
    // NOTE: Use string.match(regex) to avoid stateful RegExp.test()
    if (key instanceof RegExp && filepath.match(key)) {
      results.push(...matchedPlugins);
    }
  }
  return results;
}

export class Plugins {
  /** @param {Record<string, Plugin>} plugins */
  constructor(plugins) {
    const pluginsArr = Object.values(plugins);
    // Pre-compute cache so plugins can be searched by files or CSS classes.
    /** @type {PluginCache} */
    this._pluginsByFilesAndClasses = buildPluginCache(pluginsArr);
  }

  /**
   * @param {string} filepath
   * @param {HTMLElement["classList"]} classList
   */
  get(filepath, classList) {
    const filepathPlugins = flattenAndCompact([
      getPluginsForPath(this._pluginsByFilesAndClasses, filepath),
    ]);
    if (filepathPlugins.length) {
      return filepathPlugins;
    }
    // if we didn't find any plugins by inspecting the file path,
    // resort to class-based detection
    return flattenAndCompact(
      Array.from(classList).map((cssClass) => {
        const matchedPlugins = this._pluginsByFilesAndClasses.get(cssClass);
        // Coerce to array
        return [...(matchedPlugins || [])];
      }),
    );
  }
}
