import os
import json
import urllib.request
import urllib.parse
import time

API_KEY = os.environ["GOOGLE_PLACES_API_KEY"]


def places_search(query: str) -> list[dict]:
    params = {"query": query, "key": API_KEY}
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json?" + urllib.parse.urlencode(params)
    resp = json.loads(urllib.request.urlopen(url, timeout=15).read())
    return resp.get("results", [])


def place_details(place_id: str) -> dict:
    params = {
        "place_id": place_id,
        "fields": "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total",
        "key": API_KEY,
    }
    url = "https://maps.googleapis.com/maps/api/place/details/json?" + urllib.parse.urlencode(params)
    return json.loads(urllib.request.urlopen(url, timeout=15).read()).get("result", {})


def search_businesses(business_type: str, city: str, limit: int = 20) -> list[dict]:
    query = f"{business_type} in {city}"
    results = places_search(query)[:limit]
    businesses = []
    for place in results:
        det = place_details(place["place_id"])
        businesses.append({
            "place_id":  place["place_id"],
            "name":      det.get("name", place.get("name", "")),
            "address":   det.get("formatted_address", place.get("formatted_address", "")),
            "phone":     det.get("formatted_phone_number", ""),
            "website":   det.get("website", ""),
            "rating":    det.get("rating", place.get("rating", "")),
            "reviews":   det.get("user_ratings_total", 0),
        })
        time.sleep(0.1)
    return businesses
