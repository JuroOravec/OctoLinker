// TODO UPDATE IMPORTS
import { TYPESCRIPT_REFERENCE } from '@octolinker/helper-grammar-regex-collection';
import { plugin as JavaScript } from '../javascript';
import { definePlugin } from '../../plugin';

export const plugin = definePlugin({
  name: 'TypeScript',

  patterns: {
    pathRegexes: [/\.tsx?$/],
    githubClasses: ['type-typescript', 'highlight-source-ts'],
  },

  // TODO - NOT TYPED
  resolve: JavaScript.resolve,

  getLinkRegexes(blob) {
    return JavaScript.getLinkRegexes(blob).concat(TYPESCRIPT_REFERENCE);
  },
});
