import { join, dirname, extname } from 'path';
import relativeFile from '@octolinker/resolver-relative-file';
import resolverTrustedUrl from '@octolinker/resolver-trusted-url';

export default {
  name: 'GithubCodeowners',

  patterns: {
    pathRegexes: [/\.github\/CODEOWNERS$/],
    githubClasses: [],
  },

  resolve(path, [target]) {
    if (target.endsWith('/**')) {
      target = target.replace('/**', '');
    }

    if (target.endsWith('/*')) {
      target = target.replace('/*', '');
    }

    if (target.includes('*')) {
      return '';
    }

    if (target.startsWith('/')) {
      target = `.${target}`;
    }

    target = join('../', target);

    const basePath = join(dirname(path), target);
    const fileExt = extname(basePath);

    if (!fileExt) {
      return resolverTrustedUrl({ target: basePath });
    }

    return relativeFile({ path, target });
  },

  getLinkRegexes() {
    return /^([^\s#]+)/gm;
  },
};
