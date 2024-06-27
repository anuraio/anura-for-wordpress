<?php
// This file is magically executed by WordPress when this plugin is uninstalled.


// if uninstall.php is not called by WordPress, die
if (!defined('WP_UNINSTALL_PLUGIN')) {
    die;
}

$option_name = 'anura_settings';
$old_option_name = 'anura_settings_option_name';
$plugin_version_option = "anura_plugin_version";


delete_option($option_name);
delete_option($old_option_name);

delete_option($plugin_version_option);