import {
  R_LIBRARY,
  R_NAMESPACE,
} from '@octolinker/helper-grammar-regex-collection';
import liveResolverQuery from '@octolinker/resolver-live-query';

export default {
  name: 'r',

  pattern: {
    pathRegexes: [/\.R$/, /\.Rmd$/],
    githubClasses: ['type-r', 'highlight-source-r'],
  },

  resolve(path, [target]) {
    return liveResolverQuery({ type: 'cran', target });
  },

  getLinkRegexes() {
    return [R_LIBRARY, R_NAMESPACE];
  },
};
