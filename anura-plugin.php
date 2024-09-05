<?php

/*
   Plugin Name: Anura.io
   Plugin URI: https://wordpress.org/plugins/anura-io/
   description: Anura is an Ad Fraud solution designed to accurately eliminate fraud to improve conversion rates. With the Anura for WordPress plugin, you can easily set up a real-time visitor firewall to keep the fraud off of your site.  Before you can set this up, be sure to reach out to <a href="mailto:sales@anura.io">sales@anura.io</a> to get your account set up first.
   Version: 2.2.1
   Author: Anura Solutions, LLC
   Author URI: https://www.anura.io/
 */

namespace Anura;
if (!defined("ANURA_PLUGIN_VERSION")) {
  define("ANURA_PLUGIN_VERSION", "2.2.1");
}

define("ANURA_PLUGIN_BASENAME", plugin_basename(__FILE__));

require_once __DIR__ . "/vendor/autoload.php";
require_once __DIR__ . "/settings.php";
require_once __DIR__ . "/anura_script.php";


