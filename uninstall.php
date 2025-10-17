<?php
/**
 * Uninstall script for Anura plugin.
 *
 * This file is executed by WordPress when the plugin is uninstalled.
 * Cleans up all plugin data including settings and database tables.
 *
 * @package Anura
 */

// If uninstall.php is not called by WordPress, die.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	die;
}

$option_name           = 'anura_settings';
$old_option_name       = 'anura_settings_option_name';
$plugin_version_option = 'anura_plugin_version';

delete_option( $option_name );
delete_option( $old_option_name );

delete_option( $plugin_version_option );

// Drop the blocked logins table.
global $wpdb;
$table_name = $wpdb->prefix . 'anura_blocked_logins';
$wpdb->query( $wpdb->prepare( 'DROP TABLE IF EXISTS %i', $table_name ) );
