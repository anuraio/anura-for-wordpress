#!/usr/bin/env php
<?php
/**
 * Merge code coverage reports from unit and integration tests
 *
 * This script merges PHP serialized coverage data from unit and integration tests
 * into a single comprehensive coverage report.
 */

require __DIR__ . '/../vendor/autoload.php';

use SebastianBergmann\CodeCoverage\CodeCoverage;
use SebastianBergmann\CodeCoverage\Report\Html\Facade as HtmlReport;
use SebastianBergmann\CodeCoverage\Report\Clover as CloverReport;
use SebastianBergmann\CodeCoverage\Report\Text as TextReport;

echo "===========================================\n";
echo "Merging Code Coverage Reports\n";
echo "===========================================\n\n";

$unitCoverageFile        = __DIR__ . '/../coverage/unit/coverage.php';
$integrationCoverageFile = __DIR__ . '/../coverage/integration/coverage.php';
$outputDir               = __DIR__ . '/../coverage/combined';

// Check if unit coverage exists
if ( ! file_exists( $unitCoverageFile ) ) {
	echo "❌ Unit coverage file not found: $unitCoverageFile\n";
	echo "   Run: composer coverage:unit\n\n";
	exit( 1 );
}

// Check if integration coverage exists
if ( ! file_exists( $integrationCoverageFile ) ) {
	echo "❌ Integration coverage file not found: $integrationCoverageFile\n";
	echo "   Run: wp-env start --xdebug && composer coverage:integration:modern\n\n";
	exit( 1 );
}

// Load coverage data
echo "📂 Loading unit test coverage...\n";
$unitCoverage = require $unitCoverageFile;

echo "📂 Loading integration test coverage...\n";
$integrationCoverage = require $integrationCoverageFile;

// Verify loaded objects are CodeCoverage instances
if ( ! $unitCoverage instanceof CodeCoverage ) {
	echo "❌ Unit coverage file did not return a CodeCoverage instance\n\n";
	exit( 1 );
}

if ( ! $integrationCoverage instanceof CodeCoverage ) {
	echo "❌ Integration coverage file did not rezturn a CodeCoverage instance\n\n";
	exit( 1 );
}

// Normalize paths from Docker container to local filesystem
echo "🔧 Normalizing file paths...\n";
$integrationCoverage = normalize_coverage_paths( $integrationCoverage );

// Merge coverage data
echo "🔄 Merging coverage data...\n";
$combinedCoverage = clone $unitCoverage;
$combinedCoverage->merge( $integrationCoverage );

/**
 * Normalize coverage paths from Docker container to local filesystem
 *
 * @param CodeCoverage $coverage Coverage object with Docker paths.
 * @return CodeCoverage Coverage object with normalized local paths.
 */
function normalize_coverage_paths( CodeCoverage $coverage ) {
	// Get the local plugin directory
	$local_base = dirname( __DIR__ );

	// Get the raw data object
	$data = $coverage->getData();

	// Use reflection to access and modify the internal line coverage data
	$reflection = new ReflectionClass( $data );
	$property   = $reflection->getProperty( 'lineCoverage' );
	$property->setAccessible( true );

	$line_coverage    = $property->getValue( $data );
	$normalized_lines = array();

	foreach ( $line_coverage as $file => $lines ) {
		if ( str_starts_with( $file, '/var/www/html/wp-content/plugins/anura-io/' ) ) {
			$relative_path   = str_replace( '/var/www/html/wp-content/plugins/anura-io/', '', $file );
			$normalized_file = $local_base . '/' . $relative_path;
		} else {
			$normalized_file = $file;
		}

		$normalized_lines[ $normalized_file ] = $lines;
	}

	// Set the normalized line coverage back
	$property->setValue( $data, $normalized_lines );

	// Also normalize function coverage if it exists
	$func_property = $reflection->getProperty( 'functionCoverage' );
	$func_property->setAccessible( true );
	$func_coverage    = $func_property->getValue( $data );
	$normalized_funcs = array();

	foreach ( $func_coverage as $file => $functions ) {
		if ( str_starts_with( $file, '/var/www/html/wp-content/plugins/anura-io/' ) ) {
			$relative_path   = str_replace( '/var/www/html/wp-content/plugins/anura-io/', '', $file );
			$normalized_file = $local_base . '/' . $relative_path;
		} else {
			$normalized_file = $file;
		}

		$normalized_funcs[ $normalized_file ] = $functions;
	}

	$func_property->setValue( $data, $normalized_funcs );

	// Update the coverage object with normalized data
	$coverage->setData( $data );

	return $coverage;
}

// Create output directory
if ( ! is_dir( $outputDir ) ) {
	mkdir( $outputDir, 0755, true );
}

// Generate HTML report
echo "📊 Generating combined HTML report...\n";
$htmlReport = new HtmlReport();
$htmlReport->process( $combinedCoverage, $outputDir . '/html' );

// Generate Clover XML report
echo "📄 Generating combined Clover XML report...\n";
$cloverReport = new CloverReport();
$cloverReport->process( $combinedCoverage, $outputDir . '/clover.xml' );

// Generate text report
echo "📝 Generating combined text report...\n\n";
$textReport = new TextReport();
echo $textReport->process( $combinedCoverage, false );

echo "\n";
echo "===========================================\n";
echo "✅ Coverage reports merged successfully!\n";
echo "===========================================\n\n";
echo "View combined coverage report:\n";
echo "  HTML:   $outputDir/html/index.html\n";
echo "  Clover: $outputDir/clover.xml\n";
echo "\n";
echo "Individual reports:\n";
echo "  Unit:        coverage/unit/html/index.html\n";
echo "  Integration: coverage/integration/html/index.html\n";
echo "\n";
