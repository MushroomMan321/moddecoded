# Mod Decoded

**[moddecoded.com](https://moddecoded.com)**: modded Minecraft calculators built from the mods' own code.

Most modded-MC numbers come from creative-mode trial and error. Here, each calculator reimplements the
mod's actual logic, pins it to a mod version, and loads each modpack's own config so the numbers match
your server.

| Calculator | Mod version |
|---|---|
| [Extreme Reactors turbine](https://moddecoded.com/tools/extreme-reactors/turbine-calculator/) | 2.4.28 (MC 1.21.1) |
| [Extreme Reactors reactor](https://moddecoded.com/tools/extreme-reactors/reactor-calculator/) | 2.4.28 (MC 1.21.1) |
| [Mekanism fission reactor + turbine](https://moddecoded.com/tools/mekanism/fission-reactor-calculator/) | 10.7.19 (MC 1.21.1) |
| [Create Aeronautics airship](https://moddecoded.com/tools/create-aeronautics/airship-calculator/) | 1.3.2 |

## Contributing

- **Your pack isn't listed?** Add it in [`site/data/packs.js`](site/data/packs.js), or open an
  [Add a modpack](../../issues/new?template=add-modpack.yml) issue with its config files.
- **Numbers don't match your build?** Open a
  [Calculator doesn't match in-game](../../issues/new?template=wrong-result.yml) issue. These are the most useful reports.
- **Want another mod decoded?** [Request it](../../issues/new?template=request.yml), or 👍 an existing request.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the config keys each calculator reads.

## Layout

```
site/                          everything that gets deployed (static, no build step)
  data/packs.js                modpack config presets used by the calculators
  tools/<mod>/<tool>/index.html  one self-contained page per calculator
  guides/                      articles
scripts/                       maintainer deploy helpers (Cloudflare Pages)
```

Preview locally with `python -m http.server 8000 -d site`, then open http://localhost:8000.

Pushes to `main` are deployed to Cloudflare Pages by the maintainer.

## License

Code is [MIT](LICENSE). Pack data (`site/data/packs.js`) is
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Mod names belong to their authors.
This project isn't affiliated with any mod or modpack.
