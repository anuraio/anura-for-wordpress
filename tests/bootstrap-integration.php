<?php
/**
 * PHPUnit bootstrap file for integration tests running in wp-env.
 *
 * @package Anura_Io
 */

// Load PHPUnit Polyfills FIRST to support PHPUnit 9.x
if ( file_exists( dirname( __DIR__ ) . '/vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php' ) ) {
	require_once dirname( __DIR__ ) . '/vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php';
} elseif ( defined( 'WP_TESTS_PHPUNIT_POLYFILLS_PATH' ) ) {
	require_once WP_TESTS_PHPUNIT_POLYFILLS_PATH;
}

// Load the WordPress test suite bootstrap from wp-env container
$_tests_dir = getenv( 'WP_TESTS_DIR' );

// In wp-env, WordPress test library is at /wordpress-phpunit
if ( ! $_tests_dir ) {
	$_tests_dir = '/wordpress-phpunit';

	// Fallback: try alternative wp-env paths
	if ( ! file_exists( $_tests_dir . '/includes' ) ) {
		$_tests_dir = '/var/www/html/wp-content/plugins/wordpress-develop/tests/phpunit';
	}

	// Fallback: try standard WordPress test library location
	if ( ! file_exists( $_tests_dir . '/includes' ) ) {
		$_tests_dir = '/tmp/wordpress-tests-lib';
	}
}

// Give access to tests_add_filter() function.
if ( file_exists( "{$_tests_dir}/includes/functions.php" ) ) {
	require_once "{$_tests_dir}/includes/functions.php";
} else {
	// For wp-env, we can bootstrap directly from the WordPress installation
	require_once '/var/www/html/wp-load.php';

	// Define minimal test functions if needed
	if ( ! function_exists( 'tests_add_filter' ) ) {
		function tests_add_filter( $hook, $callback ) {
			add_filter( $hook, $callback );
		}
	}
}

/**
 * Manually load and activate the plugin being tested.
 */
function _manually_load_plugin() {
	require dirname( __DIR__ ) . '/anura-plugin.php';
	\Anura\LoginLogs\create_blocked_logins_table();
}

// Load plugin early
if ( function_exists( 'tests_add_filter' ) ) {
	tests_add_filter( 'muplugins_loaded', '_manually_load_plugin' );
} else {
	_manually_load_plugin();
}

// Start up the WP testing environment if available
if ( file_exists( "{$_tests_dir}/includes/bootstrap.php" ) ) {
	require "{$_tests_dir}/includes/bootstrap.php";
}
