import Blob from './blob';
import {
  getBlobWrappers,
  getPath,
  readLines,
  getParentSha,
  isGist,
} from './helper';

// TODO - UPDATE ALL `getBlobWrappers` and `parseBlob` to have individual flows for individual cases,
//        AND for individual versions of Github UI.
//        So there would be a list of implementations, from newest to oldest, with some checks that
//        determine which one implementation to select, and also checks for whether we're inside commit, diff, etc.
//        So basically like a data versioning policy.
//        - NOTE: Each version should be defined in its own file, with e.g. date as identifier (e.g. `2024-07-01.js`)
//                and imported as `import { TEST } from './2024-07-01'`
//                If there is like multiple versions, it could extend it, e.g. `2024-07-01--mobile.js` or `2024-07-01--dark-mode.js`
//        - NOTE: Idenfitying pages by URLs should be safer, because those should be less likely to change.
//        - NOTE: PLugins should be also versioned!!!
//
//      - CASES TO HANDLE:
//        1. FILE VIEW
//           - IDentify by having `/tree/` URL
//             - either points to the latest commit of given branch
//               https://github.com/OctoLinker/OctoLinker/tree/main/packages/core/background/index.js#L1
//               https://github.com/OctoLinker/OctoLinker/blob/main/babel.config.js
//             - or specific file version
//               https://github.com/OctoLinker/OctoLinker/blob/b97dfbfdbf3dee5f4836426e6dac6d6f473461db/.babelrc
//               https://github.com/OctoLinker/OctoLinker/blob/cf7ec7de084da1c946c3450929d911800591e7e6/packages/core/background/index.js#L1
//        2. FILE BLAME VIEW
//           - IDentify by URL - Same as file view, but with `/blame/` instead of `/tree/` or `/blob/`
//             - Either points to the latest commit of given branch
//               https://github.com/OctoLinker/OctoLinker/blame/main/packages/core/background/index.js#L1
//               https://github.com/OctoLinker/OctoLinker/blame/main/babel.config.js
//             - Or specific file version
//               https://github.com/OctoLinker/OctoLinker/blame/b97dfbfdbf3dee5f4836426e6dac6d6f473461db/.babelrc
//               https://github.com/OctoLinker/OctoLinker/blame/cf7ec7de084da1c946c3450929d911800591e7e6/packages/core/background/index.js#L1
//        3. EDIT VIEW
//           - Identified by having `/edit/` in URL, and then selecting PREVIEW tab (a `<table>` will appear in HTML)
//             https://github.com/OctoLinker/OctoLinker/edit/main/babel.config.js
//           - NOTE: The ACTUAL edit view, where one is writing code, should NOT be highlighted.
//        4. COMMIT
//           - Identified by having `/commit/` in URL, e.g.
//             https://github.com/OctoLinker/OctoLinker/commit/b97dfbfdbf3dee5f4836426e6dac6d6f473461db?diff=unified#diff-e56633f72ecc521128b3db6586074d2c
//           4.1. Layout - Unified
//             https://github.com/OctoLinker/OctoLinker/commit/b97dfbfdbf3dee5f4836426e6dac6d6f473461db?diff=unified#diff-e56633f72ecc521128b3db6586074d2c
//           4.2. Layout - Split
//             https://github.com/OctoLinker/OctoLinker/commit/b97dfbfdbf3dee5f4836426e6dac6d6f473461db?diff=split#diff-e56633f72ecc521128b3db6586074d2c
//        5. PR DIFF VIEW (after PR was created)
//            - Identified by PR URL:
//              https://github.com/OctoLinker/OctoLinker/pull/873/files
//            - TODO - DOES IT CHANGE IF THERE ARE COMMENTS?
//        6. COMPARE VIEW (before PR is created)
//            - Identified by `/compare/` in URL
//              https://github.com/OctoLinker/OctoLinker/compare/main...fix-1165?diff=split&w
//           6.1. Layout - Unified
//             https://github.com/OctoLinker/OctoLinker/compare/main...fix-1165?diff=unified
//           6.2. Layout - Split
//             https://github.com/OctoLinker/OctoLinker/compare/main...fix-1165?diff=split
//
//
// THEN, THE OVERALL FLOW WOULD BE:
//
// 1. Identify which page we are on.
// 2. Go over implementations, from latest to oldest, and run checks to identify which one we are on.
// 3. `getBlobs` - Find the code text areas (one ones with lines, e.g. below)
//                 ```
//                 69  function parseBlob(el) {
//                 70    const path = getPath(el);
//                 71    const lines = readLines(el);
//                 72    if (!lines.length) return;
//                 73  }
//                 ```
//   - NOTE 1: Also plugins should be versioned. Altho it can be that a lot of versions may share the same plugin versions.
//   - NOTE 2: The logic for getters (querying the DOM) should be also defined within the versioned code.
//             Because if we were to put it in "non-versioned" part, e.g. "shared", then it would drift.
// 4. Use the plugin-specific code to translate the text to links, e.g.
//    `require('axios')` -> `require('<a href="https://...">axios</a>')`
//    Steps:
//    1. Take the text from `<textarea>`, which contains the full file text.
//    2. Use regex to find indices and ranges where the text should be replaced.
//       NOTE: Be newline-aware, so we know also the line where the match is.
//    3. Next, we have to update the DOM, where the actual text is split into tokens for syntax highlight.
//       So there, each token may be wrapped separately, e.g. `<span>(</span><span>)</span>`
//       The line will be easy to find, because it has ID like `LC1`, `LC2`, etc.
//    4. Once we've matched the line, we want to walk token by token (AKA `<span>`s), and count the characters,
//       until we arrive at the start index (matched range === matched `<span>`).
//       NOTE: The match may be only a PART of the `<span>`, e.g. in the case that the text does not have syntax highlight!!!
//    5. Wrap the contents of the token in `<a>`,
//       e.g. `<span>axios</span>` -> `<span><a class="okto-link" href="https://...">axios</a></span>`
//       This will give the links a blue color.
// 5. Adding links is sufficient for some pages, e.g. diff / commit views like
//      https://github.com/OctoLinker/OctoLinker/commit/a9c7c1dbc64f48a994364e973438abfeb13968a7
//    But for some pages like the default code view, the whole code HTML is hidden behind an element
//    that probably manages interactions (e.g. setting cursor, opening the symbol search, etc).
//    In that case we need to manually handler user interactions:
//      1. Underline link on hover
//      2. Navigate on click
//      3. Open in new tab on CTRL/CMD + CLICK
//      NOTE: See more info https://chatgpt.com/share/688c9c3a-72f8-8004-8733-7c6a82b3201e
//    To do this, we will need to:
//    1. Add a mousemove event listener to the element that blocks the code underneath.
//    2. On each callback, get the X and Y coords of the mouse.
//    3. Call `document.elementsFromPoint()`.
//    4. Go over the list of results until we find one with `okto-link` class.
//       or other span element with class starting with `pl-*` (these are the syntax tokens).
//       If we found `okto-link`, that's our `<a>`.
//    5. SHOWING LINK
//       5.1. Keep a list / set / var of `<a>` with active links.
//       5.2. When we reach `okto-link` el, and it DOES NOT have hover CSS class,
//            add the CSS class and add it to the list.
//            This will replicate hover behavior.
//       HIDING LINK
//       5.3. When we reach non-"okto-link" el, and thers is an active link in our set,
//            then remove the el from our set and remove the hover CSS class.
//            This will replicate the un-hover behavior.
//    6. CLICKING LINKS
//       6.1. Similarly, add click event handler to the top blocking element.
//       6.2. When click happens, and the set contains an active link, it means user clicked on it.
//       6.3. Check if user also clicked CTRL/META key (see ChatGPT link above),
//            open the link in new tab.use `elementsFromPoint()`.


/** @param {HTMLElement} el */
function parseBlob(el) {
  const path = getPath(el);
  const lines = readLines(el);

  if (!lines.length) {
    return;
  }

  // Does not work if left side is empty (eg new files) https://github.com/OctoLinker/OctoLinker/commit/b97dfbfdbf3dee5f4836426e6dac6d6f473461db?diff=split#diff-e56633f72ecc521128b3db6586074d2c
  const isDiff =
    lines.filter(({ side }) => ['left', 'right'].includes(side)).length > 0;

  if (isDiff) {
    const diffLineFilter =
      (type) =>
      ({ side, ...rest }) => {
        if ([type, 'context'].includes(side)) {
          return { ...rest };
        }
      };

    const leftBlob = new Blob({
      el,
      path,
      lines: lines.map(diffLineFilter('left')).filter(Boolean),
      branch: getParentSha(),
      type: 'diffLeft',
    });

    const rightBlob = new Blob({
      el,
      path,
      lines: lines.map(diffLineFilter('right')).filter(Boolean),
      type: 'diffRight',
    });

    return [leftBlob, rightBlob];
  }

  let type = isGist() ? 'gist' : 'full';
  if (el.getElementsByTagName('pre').length) {
    type = 'snippet';
  }

  return new Blob({ el, path, lines, type });
}

// API used in the main flow
export default class BlobReader {
  /** Check if the document contains any blobs (AKA source files) */
  hasBlobs() {
    return !!getBlobWrappers(document).length;
  }

  /**
   * Parse the present blobs (AKA source files) into Blob data
   * @param {Document|HTMLElement} rootElement
   */
  read(rootElement) {
    return [].concat(
      ...getBlobWrappers(rootElement)
        .map((el) => parseBlob(el))
        .filter(Boolean),
    );
  }
}
