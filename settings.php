<?php
declare(strict_types = 1);
namespace Anura\MainSettings;

use Anura\Settings_Manager\Settings_Manager;

require_once __DIR__ . '/class-settings-manager.php';
require_once __DIR__ . '/rest-handlers.php';
require_once __DIR__ . '/login-protection-db.php';

use function Anura\LoginLogs\create_blocked_logins_table;

define( 'ICON_SVG_URI', 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjQuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA0ODAgNDgwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA0ODAgNDgwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cgkuc3Qxe2ZpbGw6IzAwOTFFQTt9Cgkuc3Qye2ZpbGw6IzAwNTA4Mjt9Cgkuc3Qze2ZpbGw6IzAwQjBGRjt9Cgkuc3Q0e2ZpbGw6IzlFOUU5RTt9Cgkuc3Q1e2ZpbGw6IzQwQzRGRjt9Cgkuc3Q2e2ZpbGw6IzIwRTNGRjt9Cgkuc3Q3e2ZpbGw6dXJsKCNTVkdJRF8xXyk7fQoJLnN0OHtmaWxsOiNERDVBMDA7fQoJLnN0OXtmaWxsOm5vbmU7c3Ryb2tlOiMyMzFGMjA7c3Ryb2tlLXdpZHRoOjAuMjU7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fQoJLnN0MTB7ZmlsbDojM0UzRTNFO30KCS5zdDExe2ZpbGw6IzlEOUQ5RDt9Cgkuc3QxMntmaWxsOiM1NUJGRUQ7fQoJLnN0MTN7ZmlsbDojNDRBOERFO30KCS5zdDE0e2ZpbGw6IzM5OEFDQTt9Cgkuc3QxNXtmaWxsOm5vbmU7c3Ryb2tlOiM4MDgxODQ7c3Ryb2tlLXdpZHRoOjAuNTtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9Cgkuc3QxNntmaWxsOiM2NjY2NjY7fQoJLnN0MTd7ZmlsbDojMjMxRjIwO30KCS5zdDE4e2ZpbGw6I0VGRUZFRjt9Cgkuc3QxOXtmaWxsOiM2RTZFNkU7fQoJLnN0MjB7ZmlsbDojMDBCODJFO30KCS5zdDIxe2ZpbGw6I0ZGQzcwMDt9Cgkuc3QyMntmaWxsOm5vbmU7c3Ryb2tlOiMyMzFGMjA7c3Ryb2tlLXdpZHRoOjAuNTtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9Cgkuc3QyM3tvcGFjaXR5OjAuNzt9Cgkuc3QyNHtmaWxsOiM4MEQ4RkY7ZmlsbC1vcGFjaXR5OjAuNzt9Cgkuc3QyNXtmaWxsOiM4MEQ4RkY7ZmlsbC1vcGFjaXR5OjAuNztzdHJva2U6IzgwRDhGRjtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9Cgkuc3QyNntmaWxsOnVybCgjU1ZHSURfMDAwMDAxMjA1NTcxNzU2MzE1NTQ4Mzk0MTAwMDAwMTgzNjQyMzE2NDU4Nzg5OTM1OTlfKTt9Cgkuc3QyN3tmaWxsOnVybCgjU1ZHSURfMDAwMDAxMjc3MzgwNTc2NjI2NTczODk0NTAwMDAwMDM1NzMyMDU3OTI1ODM0OTEyMDhfKTt9Cgkuc3QyOHtmaWxsOnVybCgjU1ZHSURfMDAwMDAxMjc3NDI2MDEyMjkyMDExMTAxMTAwMDAwMTY1NzUwNzAyNzE3NDQzNzE2MDJfKTt9Cgkuc3QyOXtjbGlwLXBhdGg6dXJsKCNTVkdJRF8wMDAwMDE1NTEzMzA1MDE0ODYzODMzODI3MDAwMDAwNDgxNzgzNDE1ODU0NTEzMjk1OV8pO2ZpbGw6I0ZGRkZGRjt9Cgkuc3QzMHtjbGlwLXBhdGg6dXJsKCNTVkdJRF8wMDAwMDE1NTEzMzA1MDE0ODYzODMzODI3MDAwMDAwNDgxNzgzNDE1ODU0NTEzMjk1OV8pO2ZpbGw6IzQ0QThERTt9Cgkuc3QzMXtjbGlwLXBhdGg6dXJsKCNTVkdJRF8wMDAwMDE1NTEzMzA1MDE0ODYzODMzODI3MDAwMDAwNDgxNzgzNDE1ODU0NTEzMjk1OV8pO2ZpbGw6IzU1QkZFRDt9Cgkuc3QzMntjbGlwLXBhdGg6dXJsKCNTVkdJRF8wMDAwMDE1NTEzMzA1MDE0ODYzODMzODI3MDAwMDAwNDgxNzgzNDE1ODU0NTEzMjk1OV8pO2ZpbGw6IzM5OEFDQTt9Cgkuc3QzM3tmaWxsOm5vbmU7c3Ryb2tlOiM1NUJGRUQ7c3Ryb2tlLXdpZHRoOjAuNTtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9Cgkuc3QzNHtmaWxsOiMzOThBQzk7fQoJLnN0MzV7ZmlsbDojNThCRUVDO30KCS5zdDM2e2ZpbGw6IzlEOUM5RDt9Cgkuc3QzN3tmaWxsOm5vbmU7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjAuMzt9Cgkuc3QzOHtmaWxsOm5vbmU7c3Ryb2tlOiNFQzAwOEM7c3Ryb2tlLXdpZHRoOjI7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fQoJLnN0Mzl7ZmlsbDojRDFEM0Q0O30KCS5zdDQwe2ZpbGw6bm9uZTtzdHJva2U6I0ZGRkZGRjtzdHJva2UtbWl0ZXJsaW1pdDoxMDt9Cgkuc3Q0MXtmaWxsOm5vbmU7c3Ryb2tlOiNGRkZGRkY7c3Ryb2tlLXdpZHRoOjAuNzU7c3Ryb2tlLW1pdGVybGltaXQ6MTA7fQo8L3N0eWxlPgo8Zz4KCTxnPgoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xNDUuOSwyODkuN3YxMzEuOGw4MS44LDQ3LjJjMy40LDEuOSw3LjgsMi45LDEyLjMsMi45djBsMCwwYzQuNCwwLDguOS0xLDEyLjMtMi45bDgxLjgtNDcuMlYyODkuN0gxNDUuOXoiCgkJCS8+CgkJPHBvbHlnb24gY2xhc3M9InN0MCIgcG9pbnRzPSIzMzMuOSwxODUuNyAzMzMuOSwxODUuNyAyMzkuOSwxMzEuNSAxNDUuOSwxODUuNyAxNDUuOSwyNDAuMSAyMzkuOSwyNDAuMSAzMzMuOSwyNDAuMSAJCSIvPgoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00NDAuNSwxMjQuM0M0NDAuNCwxMjQuMyw0NDAuNCwxMjQuMiw0NDAuNSwxMjQuM0w0NDAuNSwxMjQuM2MtMi4zLTMuOS01LjMtNy4yLTguNy05LjJMMjUyLjIsMTEuNAoJCQljLTYuNy0zLjktMTcuOC0zLjktMjQuNSwwTDQ4LDExNS4xYy0zLjQsMS45LTYuNCw1LjMtOC42LDkuMXYwYzAsMCwwLDAuMS0wLjEsMC4xYy0yLjIsMy44LTMuNiw4LjItMy42LDEyLjF2MjA3LjQKCQkJYzAsNy44LDUuNSwxNy4zLDEyLjMsMjEuMmw0OC4zLDI3LjlWMTU3LjF2MGwxNDMuNi04Mi45bDE0My42LDgyLjlsMCwwdjIzNS44bDQ4LjMtMjcuOWM2LjctMy45LDEyLjMtMTMuNSwxMi4zLTIxLjJWMTM2LjQKCQkJQzQ0NCwxMzIuNSw0NDIuNywxMjguMSw0NDAuNSwxMjQuM3oiLz4KCTwvZz4KPC9nPgo8L3N2Zz4K' );
define( 'OPTION_NAME', 'anura_settings' );

add_filter(
	'plugin_action_links_' . ANURA_PLUGIN_BASENAME,
	function ( $links ) {
		$settings_link = '<a href="admin.php?page=anura-settings">' . __( 'Settings' ) . '</a>';
		array_push( $links, $settings_link );
		return $links;
	}
);

add_action(
	'admin_menu',
	function () {
		add_menu_page(
			'Anura Settings',
			'Anura',
			'manage_options',
			'anura-settings',
			__NAMESPACE__ . '\create_admin_settings_page',
			ICON_SVG_URI,
			67
		);
	}
);

add_action(
	'admin_enqueue_scripts',
	function ( $hook ) {
		if ( $hook !== 'toplevel_page_anura-settings' ) {
			return;
		}

		wp_enqueue_script(
			'anura-react-js',
			plugins_url( '/front-end/dist/index.js', __FILE__ ),
			array(),
			'3.0.0'
		);

		wp_enqueue_style(
			'anura-react-css',
			plugins_url( '/front-end/dist/index.css', __FILE__ ),
			array(),
			'3.0.0'
		);

		wp_localize_script(
			'anura-react-js',
			'anuraAdmin',
			array(
				'restUrl'   => rest_url( 'anura/v1/settings' ),
				'restNonce' => wp_create_nonce( 'wp_rest' ),
				'settings'  => get_option( 'anura_settings', array() ),
				'pluginUrl' => plugins_url( '', __FILE__ ),
			)
		);
	}
);

/**
 * Renders the admin settings page.
 */
function create_admin_settings_page(): void {
	?>
	<div class="wrap">
		<div id="root"></div>
	</div>
	<?php
}

add_action(
	'rest_api_init',
	function () {
		register_routes();
	}
);

/**
 * Registers REST API routes for plugin settings and logs
 */
function register_routes(): void {
	register_rest_route(
		'anura/v1',
		'anura-settings',
		array(
			array(
				'methods'             => 'GET',
				'callback'            => 'Anura\Rest_Handlers\get_settings_handler',
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			),
			array(
				'methods'             => 'POST',
				'callback'            => 'Anura\Rest_Handlers\save_settings_handler',
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			),
		)
	);

	register_rest_route(
		'anura/v1',
		'blocked-logins',
		array(
			array(
				'methods'             => 'GET',
				'callback'            => 'Anura\Rest_Handlers\get_blocked_logins_handler',
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			),
		)
	);
}

add_action(
	'plugins_loaded',
	function () {
		/**
		 * Checking that the version number stored within the user's WordPress database is equal
		 * to this plugin's version. If it is, return and do nothing. Otherwise, perform any needed update logic.
		 */
		if ( ANURA_PLUGIN_VERSION === get_option( 'anura_plugin_version' ) ) {
			return;
		}

		// Create blocked logins table if upgrading from version < 3 or if version is invalid
		if ( empty( ANURA_PLUGIN_VERSION ) || ANURA_PLUGIN_VERSION[0] < '3' ) {
			create_blocked_logins_table();
		}

		$settings_manager = new Settings_Manager();
		$settings         = $settings_manager->get_settings();
		$settings_manager->repair_settings( $settings );
		update_option( 'anura_plugin_version', ANURA_PLUGIN_VERSION );
	}
);