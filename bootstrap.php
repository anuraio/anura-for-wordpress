<?php

require_once __DIR__ . '/vendor/autoload.php';

// Bootstrap WP_Mock to initialize built-in features
WP_Mock::setUsePatchwork(true);
WP_Mock::bootstrap();