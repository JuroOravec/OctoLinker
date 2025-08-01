import {
  LESS_IMPORT,
  CSS_URL,
} from '@octolinker/helper-grammar-regex-collection';
import relativeFile from '@octolinker/resolver-relative-file';
import githubSearch from '@octolinker/resolver-github-search';

export default {
  name: 'Less',

  patterns: {
    pathRegexes: [/\.less$/],
    githubClasses: ['type-less', 'highlight-source-css-less'],
  },

  resolve(path, [target]) {
    const list = [relativeFile({ path, target })];

    if (!target.endsWith('.less')) {
      list.push(relativeFile({ path, target: `${target}.less` }));
    }

    list.push(githubSearch({ path, target }));

    return list;
  },

  getLinkRegexes() {
    return [LESS_IMPORT, CSS_URL];
  },
};
