![Anura For WordPress](assets/anura-header-sm.png)

![Tests](https://github.com/anuraio/anura-for-wordpress/actions/workflows/tests.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-77%25-brightgreen)
![License](https://img.shields.io/badge/license-GPL%20v3-blue.svg)

Welcome to Anura's WordPress plug-in. Anura is an Ad Fraud solution designed to accurately eliminate fraud to improve conversion rates. With this plug in, you can easily set up a real-time visitor firewall to keep the fraud off of your site. Before you can set this up, be sure to reach out to <sales@anura.io> to get your account set up first.

## Requirements

- WordPress version 5.3 or higher
- PHP version 7.4 or higher
- An active Anura account and Instance ID

## Installation

### From Your WordPress Dashboard

1. Go to Plugins > **Add New Plugin**
2. Search for **Anura.io**
3. Press **Install Now**
4. Press **Activate**

### From WordPress.org

1. Click the **Download** button to download the plugin to your computer
2. Extract the anura-io.zip file
3. Upload the **anura-io** folder to the WordPress plugins directory: **/wp-content/plugins/**

## Development

### Testing

```bash
# Install dependencies
composer install

# Run unit tests
composer test:unit

# Run integration tests (requires wp-env)
composer test:integration

# Generate coverage reports
composer coverage

# Run code standards checks
composer phpcs
composer phpcs:tests

# Auto-fix code standards
composer lint
```

Integration tests require [@wordpress/env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/) to be installed globally.

## Frequently Asked Questions

### How do I start using Anura?

To get started, you **must** have an open active account with us.

You can see more about Anura's offerings [here.](https://www.anura.io/product#plans-pricing)

If you're interested in opening an account, you can send an email to [sales@anura.io](mailto:sales@anura.io) to get started.
