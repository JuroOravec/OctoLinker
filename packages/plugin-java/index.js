import { JAVA_IMPORT } from '@octolinker/helper-grammar-regex-collection';
import liveResolverQuery from '@octolinker/resolver-live-query';

export default {
  name: 'Java',

  patterns: {
    pathRegexes: [/\.java$/],
    githubClasses: ['type-java', 'highlight-source-java'],
  },

  resolve(path, [target]) {
    return liveResolverQuery({ type: 'java', target });
  },

  getLinkRegexes() {
    return JAVA_IMPORT;
  },
};
