<?php

declare(strict_types=1);

namespace Anura\LoginLogs;

/**
 * Create the blocked logins table in the database
 *
 * This function creates the wp_anura_blocked_logins table if it doesn't exist,
 * or updates the schema if the table already exists (via dbDelta).
 * Called during plugin activation and version upgrades.
 */
function create_blocked_logins_table(): void {
	global $wpdb;

	$table_name      = $wpdb->prefix . 'anura_blocked_logins';
	$charset_collate = $wpdb->get_charset_collate();

	$sql = "CREATE TABLE $table_name (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        username varchar(60) NOT NULL,
        result varchar(20) DEFAULT NULL,
        ip_address varchar(45) DEFAULT NULL,
        user_agent varchar(255) DEFAULT NULL,
        blocked_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        KEY blocked_at (blocked_at)
    ) $charset_collate;";

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';
	dbDelta( $sql );
}

/**
 * Insert a blocked login attempt into the database
 *
 * Records a login attempt that was blocked by Anura fraud detection.
 * Stores the username, Anura result, IP address, user agent, and timestamp.
 *
 * @param string      $username    The username that attempted to log in
 * @param string      $result      The Anura result ('warn', 'bad', etc.)
 * @param string|null $ip_address  The IP address of the login attempt
 * @param string|null $user_agent  The user agent string from the browser
 */
function insert_blocked_login(
	string $username,
	?string $result,
	?string $ip_address,
	?string $user_agent
): void {
	global $wpdb;

	$table_name = $wpdb->prefix . 'anura_blocked_logins';

	$result = $wpdb->insert(
		$table_name,
		array(
			'username'   => $username,
			'result'     => $result,
			'ip_address' => $ip_address,
			'user_agent' => $user_agent,
			'blocked_at' => current_time( 'mysql' ),
		),
		array( '%s', '%s', '%s', '%s', '%s', '%s' )
	);
}

/**
 * Get blocked login attempts with pagination and filters
 *
 * Retrieves blocked login logs from the database with support for filtering
 * by username, result, IP address, and date range. Results are paginated.
 *
 * @param int    $page            Current page number (1-indexed)
 * @param int    $per_page        Number of results per page
 * @param string $username_filter Filter by username (partial match)
 * @param string $result_filter   Filter by exact Anura result ('warn', 'bad')
 * @param string $ip_filter       Filter by IP address (partial match)
 * @param string $start_date      Filter by start date (ISO 8601 format)
 * @param string $end_date        Filter by end date (ISO 8601 format)
 * @return array {
 *     @type array $logs        Array of blocked login records
 *     @type int   $total       Total number of matching records
 *     @type int   $page        Current page number
 *     @type int   $per_page    Results per page
 *     @type int   $total_pages Total number of pages
 * }
 * @throws \Exception If database query fails
 */
function get_blocked_logins(
	int $page = 1,
	int $per_page = 50,
	string $username_filter = '',
	string $result_filter = '',
	string $ip_filter = '',
	string $start_date = '',
	string $end_date = ''
): array {
	global $wpdb;

	$table_name = $wpdb->prefix . 'anura_blocked_logins';
	$offset     = ( $page - 1 ) * $per_page;

	// Build WHERE clause based on filters
	$where_conditions = array();
	$where_values     = array();

	if ( ! empty( $username_filter ) ) {
		$where_conditions[] = 'username LIKE %s';
		$where_values[]     = '%' . $wpdb->esc_like( $username_filter ) . '%';
	}

	if ( ! empty( $result_filter ) ) {
		$where_conditions[] = 'result = %s';
		$where_values[]     = $result_filter;
	}

	if ( ! empty( $ip_filter ) ) {
		$where_conditions[] = 'ip_address LIKE %s';
		$where_values[]     = '%' . $wpdb->esc_like( $ip_filter ) . '%';
	}

	if ( ! empty( $start_date ) ) {
		$where_conditions[] = 'blocked_at >= %s';
		$where_values[]     = $start_date;
	}

	if ( ! empty( $end_date ) ) {
		$where_conditions[] = 'blocked_at <= %s';
		$where_values[]     = $end_date;
	}

	$has_filters  = count( $where_conditions ) > 0;
	$where_clause = $has_filters ? ' WHERE ' . implode( ' AND ', $where_conditions ) : '';

	// Get total count of matching records (used for pagination)
	$count_query        = "SELECT COUNT(*) FROM $table_name" . $where_clause;
	$has_where_values   = count( $where_values ) > 0;
	$prepared_count_sql = $has_where_values ? $wpdb->prepare( $count_query, $where_values ) : $count_query;
	$total              = $wpdb->get_var( $prepared_count_sql );

	// Check for database errors on count query
	$query_failed = $total === null && ! empty( $wpdb->last_error );
	if ( $query_failed ) {
		throw new \Exception( 'Failed to retrieve blocked login count: ' . $wpdb->last_error );
	}

	// Get logs with filters and pagination
	$logs_query        = "SELECT * FROM $table_name" . $where_clause . ' ORDER BY blocked_at DESC LIMIT %d OFFSET %d';
	$pagination_values = array( $per_page, $offset );
	$logs_values       = array_merge( $where_values, $pagination_values );
	$logs              = $wpdb->get_results(
		$wpdb->prepare( $logs_query, $logs_values ),
		ARRAY_A
	);

	// Check for database errors on logs query
	$query_failed = $logs === null && ! empty( $wpdb->last_error );
	if ( $query_failed ) {
		throw new \Exception( 'Failed to retrieve blocked login logs: ' . $wpdb->last_error );
	}

	return array(
		'logs'        => $logs ?? array(),
		'total'       => (int) $total,
		'page'        => $page,
		'per_page'    => $per_page,
		'total_pages' => (int) ceil( $total / $per_page ),
	);
}

/**
 * Delete blocked login records older than the specified number of days
 *
 * Removes login attempts from the database that are older than the retention period.
 * This helps maintain database performance and comply with data retention policies.
 *
 * @param int $retention_days Number of days to retain records (minimum 1, maximum 365)
 */
function delete_old_blocked_logins( int $retention_days ): void {
	global $wpdb;

	// Ensure retention days is within valid range
	$retention_days = max( 1, min( 365, $retention_days ) );

	$table_name = $wpdb->prefix . 'anura_blocked_logins';

	// Delete records older than retention period
	$wpdb->query(
		$wpdb->prepare(
			"DELETE FROM $table_name WHERE blocked_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
			$retention_days
		)
	);
}

/**
 * Scheduled cron job handler to clean up old blocked login records
 *
 * Retrieves the retention days setting and deletes records older than that period.
 * This function is called automatically by WordPress cron.
 */
function cleanup_old_blocked_logins_cron(): void {
	$settings_manager = new \Anura\Settings_Manager\Settings_Manager();
	$settings         = $settings_manager->get_settings();

	$retention_days = $settings['logs']['blockedLoginRetentionDays'] ?? 90;

	delete_old_blocked_logins( (int) $retention_days );
}
