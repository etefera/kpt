# How to Contribute

We'd love to accept your patches and contributions to this project. There are
just a few small guidelines you need to follow.

## Contributor License Agreement

Contributions to this project must be accompanied by a Contributor License
Agreement. You (or your employer) retain the copyright to your contribution;
this simply gives us permission to use and redistribute your contributions as
part of the project. Head over to <https://cla.developers.google.com/> to see
your current agreements on file or to sign a new one.

You generally only need to submit a CLA once, so if you've already submitted one
(even if it was for a different project), you probably don't need to do it
again.

## Code reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult [GitHub Help] for more
information on using pull requests.

## Community Guidelines

This project follows [Google's Open Source Community Guidelines] and a [Code of
Conduct].

## Building the Source

1. Clone the project

   ```sh
   git clone https://github.com/GoogleContainerTools/kpt
   cd kpt
   ```

2. Build `kpt` to `$(go env GOPATH)/bin/kpt`

   ```sh
   make
   ```

3. Run test

   ```sh
   make all
   ```

## Contributing to docs

If you are updating the documentation, please do it in separate PRs from
code changes and the commit message should start with `Docs:`.

### Run the docs locally

Make markdown docs changes and test them by using any server hosting the [site/]
directory. With `python` installed, this can be done with one line:

```sh
(cd site && python -m SimpleHTTPServer 3000)
```

It's usually a good idea to test locally for the following:

- Broken links
- Rendering static content

### Adding or updating diagrams

- Diagrams are created using Omnigraffle
- Open site/diagrams/diagrams.graffle in omnigraffle
- Change the diagram you want (or add a new canvas)
- **Convert text to shapes!!!** -> Edit -> Objects -> Convert Text to Shapes
- Export the canvas as an svg to `site/static/images`
- **Undo convert text to shapes!!!** with command-z
  - This is important
- Reference the image using the `svg` shortcode

### Adding or updating asciinema

- asciinema casts are under `site/static/casts`
- add or modify a `*.sh*` script which will run the commands that will be
  recorded
- run `make-gif.sh` with the script name (without extension) as the argument
- add the updated cast to git
- Reference the cast using the `asciinema` shortcode

### Docs Hygiene

The kpt website uses markdownlint to lint docs for formatting and style. Use
prettier with the `"prettier.proseWrap": "always"` setting to auto-format docs
in VSCode.

This includes:

- Lint docs with markdownlint to standardize them and make them easier to
  update. `make lintdocs`
- Run the kpt website through the [W3 Link Checker] in recursive mode and fix
  warnings and errors.

[github help]: https://help.github.com/articles/about-pull-requests/
[google's open source community guidelines]:
  https://opensource.google.com/conduct/
[code of conduct]: CODE_OF_CONDUCT.md
[docsy]: https://github.com/google/docsy/
[docsy docs]: https://www.docsy.dev/docs/
[site/]: site/
[w3 link checker]: https://validator.w3.org/checklink/
[this node package]: site/content/en/guides/consumer/function/catalog/catalog/
