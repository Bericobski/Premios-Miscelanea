<?php

$clientId = "6f9hwmwfrb2ziknptcp0heuix5oj6n";
$clientSecret = "akznziex4x2eicaokwfteirv6wrmhe";

$tokenUrl = "https://id.twitch.tv/oauth2/token";

$data = [
    "client_id" => $clientId,
    "client_secret" => $clientSecret,
    "grant_type" => "client_credentials"
];

$options = [
    "http" => [
        "header" => "Content-type: application/x-www-form-urlencoded",
        "method" => "POST",
        "content" => http_build_query($data)
    ]
];

$context = stream_context_create($options);

$response = file_get_contents($tokenUrl, false, $context);

$result = json_decode($response, true);

print_r($result);