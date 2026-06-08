<?php

$clientId = "6f9hwmwfrb2ziknptcp0heuix5oj6n";
$clientSecret = "akznziex4x2eicaokwfteirv6wrmhe";

# -----------------------------------
# GET ACCESS TOKEN
# -----------------------------------

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

# -----------------------------------
# DATE RANGE
# -----------------------------------

$start2026 = strtotime("2026-01-01");
$now = time();

# -----------------------------------
# PAGINATION
# -----------------------------------

$limit = 500;
$offset = 0;

$allGames = [];

while (true) {

    echo "Fetching games $offset to " . ($offset + $limit) . "\n";

    $query = "
    fields
        name,
        summary,
        rating,
        genres.name,
        involved_companies.company.name,
        cover.image_id,
        screenshots.image_id;

    where
        first_release_date >= $start2026
        & first_release_date <= $now;

    limit $limit;
    offset $offset;
    ";

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

    $games = json_decode($response, true);

    # STOP WHEN NO MORE GAMES
    if (empty($games)) {
        break;
    }

    foreach ($games as $game) {

        # -------------------------
        # COVER IMAGE
        # -------------------------

        $coverUrl = "";

        if (isset($game["cover"]["image_id"])) {

            $coverUrl =
                "https://images.igdb.com/igdb/image/upload/t_cover_big/" .
                $game["cover"]["image_id"] .
                ".jpg";
        }

        # -------------------------
        # GALLERY
        # -------------------------

        $gallery = [];

        if (isset($game["screenshots"])) {

            foreach ($game["screenshots"] as $screenshot) {

                if (isset($screenshot["image_id"])) {

                    $gallery[] =
                        "https://images.igdb.com/igdb/image/upload/t_screenshot_big/" .
                        $screenshot["image_id"] .
                        ".jpg";
                }
            }
        }

        # -------------------------
        # GENRE
        # -------------------------

        $genre = "Unknown";

        if (isset($game["genres"][0]["name"])) {
            $genre = $game["genres"][0]["name"];
        }

        # -------------------------
        # STUDIO
        # -------------------------

        $studio = "Unknown";

        if (isset($game["involved_companies"][0]["company"]["name"])) {
            $studio = $game["involved_companies"][0]["company"]["name"];
        }

        # -------------------------
        # RATING
        # Convert 0-100 → 1-5
        # -------------------------

        $rating = 3;

        if (isset($game["rating"])) {

            $rating = round($game["rating"] / 20);

            if ($rating < 1) $rating = 1;
            if ($rating > 5) $rating = 5;
        }

        # -------------------------
        # RANDOM CATEGORIES
        # -------------------------

        $possibleCategories = [
            "Best Story",
            "Best Graphics",
            "Best Gameplay",
            "Best Music",
            "Best World",
            "Most Anticipated"
        ];

        shuffle($possibleCategories);

        $categories = array_slice($possibleCategories, 0, 3);

        # -------------------------
        # FINAL OBJECT
        # -------------------------

        $allGames[] = [

            "id" => count($allGames) + 1,

            "title" =>
                $game["name"] ?? "Unknown",

            "description" =>
                $game["summary"] ??
                "No description available.",

            "studio" => $studio,

            "genre" => $genre,

            "rating" => $rating,

            "coverImage" => $coverUrl,

            "gallery" => $gallery,

            "categories" => $categories,

            "comments" => []
        ];
    }

    $offset += $limit;
}

# -----------------------------------
# SAVE JSON
# -----------------------------------

$json = json_encode(
    $allGames,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
);

file_put_contents("gamesBig.json", $json);

echo "\nDONE!\n";
echo "Total games: " . count($allGames);