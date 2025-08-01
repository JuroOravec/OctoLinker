import { GEM } from '@octolinker/helper-grammar-regex-collection';
import liveResolverQuery from '@octolinker/resolver-live-query';

export default {
  name: 'Rubygems',

  patterns: {
    pathRegexes: [/Gemfile$/],
    githubClasses: [],
  },

  resolve(path, [target]) {
    return liveResolverQuery({
      target: target.split('.')[0],
      type: 'rubygems',
    });
  },

  getLinkRegexes() {
    return GEM;
  },
};
