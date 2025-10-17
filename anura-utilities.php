<?php
/**
 * Utility functions for Anura plugin.
 *
 * Provides helper functions for processing traffic details, querying Anura API,
 * and managing script enqueuing for fraud detection.
 *
 * @package Anura
 */

declare(strict_types=1);

namespace Anura\Utilities;

use Exception;

/**
 * Process traffic detail (source/campaign) based on method and settings.
 *
 * @param string $method The method to retrieve data ('get', 'post', 'hardCoded').
 * @param string $value The value/key to look up.
 * @param array  $fallback_values Array of fallback keys to try.
 * @return string The processed traffic detail value.
 */
function get_traffic_detail( string $method, string $value, array $fallback_values ): string {
	switch ( $method ) {
		case 'get':
			return isset( $_GET[ $value ] ) ? sanitize_text_field( $_GET[ $value ] ) : get_fallback_detail( $fallback_values, $method );
		case 'post':
			return isset( $_POST[ $value ] ) ? sanitize_text_field( $_POST[ $value ] ) : get_fallback_detail( $fallback_values, $method );
		case 'hardCoded':
			return sanitize_text_field( $value ?? '' );
		default:
			return '';
	}
}

/**
 * Get fallback traffic detail from available sources.
 *
 * @param array  $fallback_values Array of fallback keys to try.
 * @param string $method The method to retrieve data ('get', 'post').
 * @return string The fallback traffic detail value.
 */
function get_fallback_detail( array $fallback_values, string $method ): string {
	foreach ( $fallback_values as $fallback_value ) {
		switch ( $method ) {
			case 'get':
				if ( isset( $_GET[ $fallback_value ] ) ) {
					return sanitize_text_field( $_GET[ $fallback_value ] );
				}
				break;
			case 'post':
				if ( isset( $_POST[ $fallback_value ] ) ) {
					return sanitize_text_field( $_POST[ $fallback_value ] );
				}
				break;
		}
	}
	return '';
}

/**
 * Process additional data array according to their method settings.
 *
 * @param array $additional_data Array of additional data items with method and value.
 * @return array Processed additional data values.
 */
function process_additional_data( array $additional_data ): array {
	$processed_values = array();

	foreach ( $additional_data as $index => $data_item ) {
		if ( ! \is_array( $data_item ) || ! isset( $data_item['method'], $data_item['value'] ) ) {
			continue;
		}

		$processed_value = get_traffic_detail(
			$data_item['method'],
			$data_item['value'],
			array()
		);

		if ( $processed_value !== '' ) {
			$processed_values[ $index ] = $processed_value;
		}
	}

	return $processed_values;
}

/**
 * Find a specific real-time action by name in settings
 */
function find_action_by_name( array $settings, string $action_name ): ?array {
	$actions = $settings['realTimeActions']['actions'] ?? array();

	foreach ( $actions as $action ) {
		if ( isset( $action['name'] ) && $action['name'] === $action_name ) {
			return $action;
		}
	}

	return null;
}

/**
 * Check if a real-time action is enabled (not set to 'noDisable')
 */
function is_action_enabled( array $settings, string $action_name ): bool {
	$action = find_action_by_name( $settings, $action_name );
	return $action && ( $action['resultCondition'] ?? 'noDisable' ) !== 'noDisable';
}

/**
 * Get the condition for a specific action (onWarning, onBad, onBoth)
 */
function get_action_condition( array $settings, string $action_name ): string {
	$action = find_action_by_name( $settings, $action_name );
	return $action['resultCondition'] ?? 'noDisable';
}

/**
 * Check if Anura service is available via health check
 */
function is_anura_service_available(): bool {
	$response = wp_remote_head(
		'https://script.anura.io/request.js',
		array(
			'timeout'   => 5,
			'sslverify' => true,
		)
	);

	if ( is_wp_error( $response ) ) {
		return false;
	}

	$status       = wp_remote_retrieve_response_code( $response );
	$is_available = $status < 500;

	return $is_available;
}

/**
 * Returns whether or not $instance is an ID for an active instance.
 */
function is_instance_valid( string $instance ): bool {
	$response = wp_remote_get( 'https://script.anura.io/result.json?' . http_build_query( array( 'instance' => $instance ) ) );
	if ( is_wp_error( $response ) ) {
		return false;
	}

	$status_code = wp_remote_retrieve_response_code( $response );
	if ( $status_code >= 500 ) {
		return false;
	}

	$body = wp_remote_retrieve_body( $response );
	$data = json_decode( $body, true );
	if ( json_last_error() !== JSON_ERROR_NONE ) {
		return false;
	}

	$instance_valid = stripos( $data['error'], 'instance' ) === false;
	return $instance_valid;
}

/**
 * Query Anura API for visitor validation result
 */
function query_anura_visitor( string $id, string $instance ): array {
	$response = wp_remote_get(
		'https://script.anura.io/result.json?' . http_build_query(
			array(
				'instance' => $instance,
				'id'       => $id,
			)
		)
	);

	if ( is_wp_error( $response ) ) {
		throw new Exception( 'Network error: ' . $response->get_error_message() );
	}

	$status_code = wp_remote_retrieve_response_code( $response );
	$body        = wp_remote_retrieve_body( $response );

	return handle_api_response( $status_code, $body );
}

/**
 * Handle Anura API response and throw appropriate exceptions
 */
function handle_api_response( int $status_code, string $body ): array {
	if ( $status_code !== 200 ) {
		throw new Exception( 'Request failed' );
	}

	$data = json_decode( $body, true );
	if ( json_last_error() !== JSON_ERROR_NONE ) {
		throw new Exception( 'Invalid JSON response from Anura API' );
	}

	return $data;
}

/**
 * Determine if action should trigger based on Anura result and condition
 */
function result_matches_protect_condition( string $result, string $condition ): bool {
	switch ( $condition ) {
		case 'onWarning':
			return $result === 'warn';
		case 'onBad':
			return $result === 'bad';
		case 'onBoth':
			return $result === 'warn' || $result === 'bad';
		default:
			return false;
	}
}

/**
 * Prepare complete Anura settings with processed traffic details
 */
function prepare_anura_settings( array $raw_settings ): array {
	$settings          = $raw_settings;
	$script_settings   = $settings['script'] ?? array();
	$fallback_settings = $settings['advanced']['fallbacks'] ?? array(
		'sources'   => array(),
		'campaigns' => array(),
	);

	$settings['script']['source'] = get_traffic_detail(
		$script_settings['sourceMethod'] ?? 'none',
		$script_settings['sourceValue'] ?? '',
		$fallback_settings['sources'] ?? array()
	);

	$settings['script']['campaign'] = get_traffic_detail(
		$script_settings['campaignMethod'] ?? 'none',
		$script_settings['campaignValue'] ?? '',
		$fallback_settings['campaigns'] ?? array()
	);

	$settings['script']['additionalData'] = process_additional_data(
		$script_settings['additionalData'] ?? array()
	);

	return $settings;
}

/**
 * Enqueue Anura script with settings
 *
 * @param string $handle The script handle identifier
 * @param string $script_url The URL to the script file
 * @param array  $settings The settings to pass to the script
 */
function enqueue_anura_script( string $handle, string $script_url, array $settings ): void {
	wp_enqueue_script( $handle, $script_url );
	wp_localize_script( $handle, 'anuraOptions', $settings );
}
