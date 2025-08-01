import {
  CSS_IMPORT,
  CSS_URL,
} from '@octolinker/helper-grammar-regex-collection';
import relativeFile from '@octolinker/resolver-relative-file';

export default {
  name: 'CSS',

  patterns: {
    pathRegexes: [/\.css$/],
    githubClasses: ['type-css', 'highlight-source-css'],
  },

  resolve(path, [target]) {
    return relativeFile({ path, target });
  },

  getLinkRegexes() {
    return [CSS_IMPORT, CSS_URL];
  },
};
