<?php

$clientId = "6f9hwmwfrb2ziknptcp0heuix5oj6n";
$clientSecret = "akznziex4x2eicaokwfteirv6wrmhe";

# -------------------------
# GET ACCESS TOKEN
# -------------------------

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

$accessToken = $result["access_token"];

# -------------------------
# SEARCH GAME
# -------------------------

$query = '
search "Halo";
fields name,summary,rating;
limit 1;
';

$headers = [
    "Client-ID: $clientId",
    "Authorization: Bearer $accessToken",
    "Content-Type: text/plain"
];

$options = [
    "http" => [
        "header" => implode("\r\n", $headers),
        "method" => "POST",
        "content" => $query
    ]
];

$context = stream_context_create($options);

$response = file_get_contents(
    "https://api.igdb.com/v4/games",
    false,
    $context
);

print_r(json_decode($response, true));