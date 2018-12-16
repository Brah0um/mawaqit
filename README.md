# Mawaqit - Prayer times for mosques

![Mawaqit clock](https://mawaqit.net/bundles/app/agency/img/software/1.jpg)

![Mawaqit clock in arabic](https://mawaqit.net/bundles/app/agency/img/software/5.jpg?3.37.1)

![Doua](https://mawaqit.net/bundles/app/agency/img/software/9.jpg?3.37.1)

![Another doua](https://mawaqit.net/bundles/app/agency/img/software/13.jpg?3.37.1)

![Mobile view calendar clock](https://mawaqit.net/bundles/app/agency/img/software/16.png?3.37.1)

![Mobile view admin dashboard](https://mawaqit.net/bundles/app/agency/img/software/18.png?3.37.1)

## Introduction

[Mawaqit](https://mawaqit.net) is a web-based [Symfony](https://symfony.com/) app that allows to manage and display your prayer times in your mosque or your personal home.

Please visit [our website](http://mawaqit.net) for more information.

## Requirements

- [Docker](https://www.docker.com/) in [swarm mode](https://docs.docker.com/engine/swarm/)

## Installation

At the project root directory, run the following commands :

```bash
# Run reverse proxy if is needed
make start-reverse-proxy

# Run Docker services
make start

# Install dependencies. Wait until all Docker services is launched.
make install
```

Add `mawaqit.local` and `adminer.mawaqit.local` in your `/etc/hosts` file.

```bash
sudo make install-hosts
```
