<?php

declare(strict_types=1);

namespace Anura\Script;

use Anura\Settings_Manager\Settings_Manager;

use function Anura\Utilities\{
	prepare_anura_settings,
	enqueue_anura_script
};

/**
 * Creates and injects an Anura Script tag onto the user's WordPress site.
 * Also adds other scripts that it requires such as callbacks and
 * real time actions.
 */
add_action(
	'wp_head',
	function () {
		$settings_manager = new Settings_Manager();
		$settings         = $settings_manager->get_settings();
		if ( ! $settings ) {
			return;
		}

		$instance_id = $settings['script']['instanceId'] ?? '';
		if ( empty( $instance_id ) ) {
			return;
		}

		$prepared_settings = prepare_anura_settings( $settings );

		enqueue_anura_script(
			'anura-includes',
			plugins_url( '/anura-script/dist/anura-includes.iife.js', __FILE__ ),
			$prepared_settings
		);
	},
	1
);


add_filter(
	'script_loader_tag',
	function ( $tag, $handle ) {
		if ( $handle !== 'anura-includes' ) {
			return $tag;
		}

		return str_replace( ' src', ' async src', $tag );
	},
	10,
	2
);

/**
 * Calculate the header priority number to give to WordPress
 * according to the user's preferences.
 */
function get_header_priority( string $priority ): int {
	switch ( $priority ) {
		case 'lowest':
			return 99;
		case 'low':
			return 74;
		case 'medium':
			return 49;
		case 'high':
			return 24;
		case 'highest':
			return 0;
		default:
			return 49;
	}
}

/**
 * Sending additional headers used by Anura Script.
 */
add_action(
	'send_headers',
	function () {
		$settings_manager = new Settings_Manager();
		$settings         = $settings_manager->get_settings();
		$server_actions   = $settings['advanced']['serverActions'];

		if ( $server_actions['addHeaders'] ) {
			header( 'Accept-CH: Device-Memory, Content-DPR, DPR, Viewport-Width, Width, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Form-Factors, Sec-CH-UA-Full-Version, Sec-CH-UA-Full-Version-List, Sec-CH-UA-Mobile, Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-WoW64', false );
			header( 'Permissions-Policy: ch-device-memory=(self "https://*.anura.io"), ch-content-dpr=(self "https://*.anura.io"), ch-dpr=(self "https://*.anura.io"), ch-viewport-width=(self "https://*.anura.io"), ch-width=(self "https://*.anura.io"), ch-ua-arch=(self "https://*.anura.io"), ch-ua-bitness=(self "https://*.anura.io"), ch-ua-form-factors=(self "https://*.anura.io"), ch-ua-full-version=(self "https://*.anura.io"), ch-ua-full-version-list=(self "https://*.anura.io"), ch-ua-mobile=(self "https://*.anura.io"), ch-ua-model=(self "https://*.anura.io"), ch-ua-platform=(self "https://*.anura.io"), ch-ua-platform-version=(self "https://*.anura.io"), ch-ua-wow64=(self "https://*.anura.io")', false );
		}
	},
	( function () {
		$settings_manager = new Settings_Manager();
		$settings         = $settings_manager->get_settings();
		return get_header_priority( $settings['advanced']['serverActions']['headerPriority'] ?? 'medium' );
	} )()
);
