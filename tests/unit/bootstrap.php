<?php
/**
 * PHPUnit bootstrap file for unit tests.
 * Unit tests use WP_Mock to mock WordPress functions.
 *
 * @package Anura_Io
 */

// Load Composer autoloader for WP_Mock and dependencies
require_once dirname( dirname( __DIR__ ) ) . '/vendor/autoload.php';

// Bootstrap WP_Mock
WP_Mock::bootstrap();
