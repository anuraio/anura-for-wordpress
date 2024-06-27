<?php declare(strict_types=1);

require_once __DIR__ . '/../anura_script.php';

use WP_Mock\Tools\TestCase;

final class AnuraScriptTest extends TestCase
{
    public function setUp(): void
    {
        WP_Mock::userFunction("sanitize_text_field", [
            'return' => function($str) {
                return $str;
            }
        ]);
    }

    public function testGetTrafficDetailSource(): void
    {
        $method = "get";
        $source = "test";

        $_GET = ["test" => "some_data"];

        $result = Anura\Script\getTrafficDetail($method, $source, []);
        $this->assertEquals($result, "some_data");
    }

    public function testGetFallbackDetail(): void
    {
        $method = "get";
        $source = "test_source";
        $fallbackSources = [
            "fallback_one",
            "fallback_two"
        ];

        $_GET = ["fallback_two" => "some_data"];

        $result = Anura\Script\getTrafficDetail($method, $source, $fallbackSources);
        $this->assertEquals($result, "some_data");
    }
}