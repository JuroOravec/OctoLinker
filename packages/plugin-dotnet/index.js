import {
  NET_PACKAGE,
  NET_PROJ_PACKAGE,
  NET_PROJ_SDK,
} from '@octolinker/helper-grammar-regex-collection';
import nugetResolver from '@octolinker/resolver-nuget';

export default {
  name: 'DotNet',

  patterns: {
    pathRegexes: [
      /packages\.config$/,
      /\.(cs|fs|vb)proj$/,
      /\.props$/,
      /\.targets$/,
    ],
    githubClasses: [],
  },

  resolve(path, [target]) {
    return nugetResolver({ target });
  },

  getLinkRegexes() {
    return [NET_PACKAGE, NET_PROJ_PACKAGE, NET_PROJ_SDK];
  },
};
