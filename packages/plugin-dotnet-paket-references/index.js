import { PAKET_REFERENCES } from '@octolinker/helper-grammar-regex-collection';
import nugetResolver from '@octolinker/resolver-nuget';

export default {
  name: 'DotNetPaketReferences',

  patterns: {
    pathRegexes: [/paket\.references$/],
    githubClasses: [],
  },

  resolve(_path, [target]) {
    return nugetResolver({ target });
  },

  getLinkRegexes() {
    return [PAKET_REFERENCES];
  },
};
