// TODO UPDATE IMPORTS
import {
  NODEJS_RELATIVE_PATH,
  NODEJS_RELATIVE_PATH_JOIN,
} from '@octolinker/helper-grammar-regex-collection';
import relativeFile from '@octolinker/resolver-relative-file';
import { plugin as JavaScript } from '../javascript';
import { plugin as TypeScript } from '../typescript';
import { definePlugin } from '../../plugin';

export const plugin = definePlugin({
  name: 'NodejsRelativePath',

  patterns: {
    pathRegexes: [
      ...JavaScript.patterns.pathRegexes,
      ...TypeScript.patterns.pathRegexes,
    ],
    githubClasses: [
      ...JavaScript.patterns.githubClasses,
      ...TypeScript.patterns.githubClasses,
    ],
  },

  resolve(path, [target]) {
    return relativeFile({ path, target });
  },

  getLinkRegexes() {
    return [NODEJS_RELATIVE_PATH, NODEJS_RELATIVE_PATH_JOIN];
  },
});
