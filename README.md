# Parth Pawar's portfolio previews

[Product Design](https://parthawe.github.io/portfolio-split/product/) and [Design That Plays](https://parthawe.github.io/portfolio-split/experimental/) use the same case-study components, typography, and navigation. Project selections and homepage order live in `src/config/portfolios.json`.

Use Bun 1.3.10 and Node 20 or later. Run `bun install --frozen-lockfile` and `bun run build`. The Pages workflow publishes both builds together from `dist`. With a web server that serves `dist` at `/portfolio-split/`, pass its origin as `PREVIEW_ORIGIN` to `bun run qa:previews`.

The source baseline is Parthawe/Portfolio.github.io at `f9c839c3025e7113bb46424cef91882eed255694`. These public, non-indexed previews use no production credentials. Access-limited case studies show their public overview and link to the live portfolio for requests.
