import { RUST_CRATE } from '@octolinker/helper-grammar-regex-collection';
import liveResolverQuery from '@octolinker/resolver-live-query';

export default {
  name: 'Rust',

  patterns: {
    pathRegexes: [/\.rs$/],
    githubClasses: ['type-rust', 'highlight-source-rust'],
  },

  resolve(path, [target]) {
    return liveResolverQuery({ type: 'crates', target });
  },

  getLinkRegexes() {
    return RUST_CRATE;
  },
};
