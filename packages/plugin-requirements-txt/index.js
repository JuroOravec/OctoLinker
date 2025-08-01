import { REQUIREMENTS_TXT } from '@octolinker/helper-grammar-regex-collection';
import liveResolverQuery from '@octolinker/resolver-live-query';

export default {
  name: 'RequirementsTxt',

  pattern: {
    pathRegexes: [/requirements\.txt$/],
    githubClasses: [],
  },

  resolve(path, [target]) {
    return liveResolverQuery({
      target,
      type: 'pypi',
    });
  },

  getLinkRegexes() {
    return REQUIREMENTS_TXT;
  },
};
