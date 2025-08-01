import { go } from '@octolinker/helper-grammar-regex-collection';
import liveResolverQuery from '@octolinker/resolver-live-query';
import relativeFile from '@octolinker/resolver-relative-file';

function goFile({ path, target }) {
  const list = [];
  const basePath = relativeFile({ path, target });
  const filename = target.slice(target.lastIndexOf('/') + 1);

  list.push(`/${filename}.go`);
  list.push('.go');
  list.push('');

  return list.map((file) => `${basePath}${file}`);
}

function githubUrls(url) {
  const [, user, repo, ...path] = url.split('/');

  if (!path.length) {
    return [
      `{BASE_URL}/${user}/${repo}/blob/master/${repo}.go`,
      `{BASE_URL}/${user}/${repo}`,
    ];
  }

  const fullPath = path.join('/');
  const last = path.slice(-1);

  return [
    `{BASE_URL}/${user}/${repo}/blob/master/${fullPath}/${last}.go`,
    `{BASE_URL}/${user}/${repo}/tree/master/${fullPath}`,
    `{BASE_URL}/${user}/${repo}`,
  ];
}

export default {
  name: 'Go',

  patterns: {
    pathRegexes: [/\.go$/, /go\.mod$/],
    githubClasses: ['type-go', 'highlight-source-go'],
  },

  resolve(path, [target]) {
    const isPath = !!target.match(/^\.\.?[\\|\/]?/);

    if (isPath) {
      return goFile({ path, target });
    }

    if (target.startsWith('github.com')) {
      return githubUrls(target);
    }

    return [
      `https://${target}`,
      `https://pkg.go.dev/${target}`,
      liveResolverQuery({ type: 'go', target }),
    ];
  },

  // TOOD - THIS CAN BE ACTUALLY MADE INTO STATIC PROPERTY!!!
  // THE ONLY COMPLICATION IS GOLANG, BUT THERE, EVEN AT THE END OF THE DAY,
  // THE REGEX CONTAINS ONLY URLs THAT START WITH ALLOWED DOMAINS.
  // SO INSTEAD THE REGEXES CAN BE SET TO INCLUDE THOSE FROM THE GET-GO
  getLinkRegexes(blob) {
    return go(blob.toString());
  },
};
