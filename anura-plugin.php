<?php

/*
	Plugin Name: Anura.io
	Plugin URI: https://wordpress.org/plugins/anura-io/
	description: Anura is an Ad Fraud solution designed to accurately eliminate fraud to improve conversion rates. With the Anura for WordPress plugin, you can easily set up a real-time visitor firewall to keep the fraud off of your site.  Before you can set this up, be sure to reach out to <a href="mailto:sales@anura.io">sales@anura.io</a> to get your account set up first.
	Version: 3.0.2
	Requires at least: 5.3
	Requires PHP: 7.4
	Author: Anura Solutions, LLC
	Author URI: https://www.anura.io/
 */

namespace Anura;

if ( ! defined( 'ANURA_PLUGIN_VERSION' ) ) {
	define( 'ANURA_PLUGIN_VERSION', '3.0.2' );
}

define( 'ANURA_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/settings.php';
require_once __DIR__ . '/anura-script.php';
require_once __DIR__ . '/anura-utilities.php';
require_once __DIR__ . '/login-protection-db.php';
require_once __DIR__ . '/login-protection.php';

// Create database table and schedule cron on plugin activation
register_activation_hook(
	__FILE__,
	function () {
		\Anura\LoginLogs\create_blocked_logins_table();

		// Schedule daily cleanup of old blocked login records
		if ( ! wp_next_scheduled( 'anura_cleanup_blocked_logins' ) ) {
			wp_schedule_event( time(), 'daily', 'anura_cleanup_blocked_logins' );
		}
	}
);

// Clean up scheduled cron on plugin deactivation
register_deactivation_hook(
	__FILE__,
	function () {
		$timestamp = wp_next_scheduled( 'anura_cleanup_blocked_logins' );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, 'anura_cleanup_blocked_logins' );
		}
	}
);

// Hook the cleanup function to the scheduled event
add_action( 'anura_cleanup_blocked_logins', 'Anura\LoginLogs\cleanup_old_blocked_logins_cron' );
