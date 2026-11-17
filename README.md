# Parth Pawar's portfolio previews

The [portfolio entrance](https://parthawe.github.io/portfolio-split/) opens Design That Plays. Its [MIT Media Lab selection](https://parthawe.github.io/portfolio-split/experimental/mit/) leads to the relevant artwork and project evidence. Existing Product Design URLs continue to work directly. Both builds share their case-study components and typography. Project selections and homepage order live in `src/config/portfolios.json`.

Use Bun 1.3.10 and Node 20 or later. Run `bun install --frozen-lockfile` and `bun run build`. The Pages workflow publishes both builds together from `dist`. With a web server that serves `dist` at `/portfolio-split/`, pass its origin as `PREVIEW_ORIGIN` to `bun run qa:previews`.

The source baseline is Parthawe/Portfolio.github.io at `f9c839c3025e7113bb46424cef91882eed255694`. These public, non-indexed previews use no production credentials. Access-limited case studies show their public overview and link to the live portfolio for requests.
