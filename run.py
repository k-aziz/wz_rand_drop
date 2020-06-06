from enum import Enum
import random
from typing import NamedTuple

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# IMG_WIDTH = 927
# IMG_HEIGHT = 996


class LatLng(NamedTuple):
    lat: int
    lng: int

    def serialize(self):
        return {
            "lat": self.lat,
            "lng": self.lng
        }


class Location(NamedTuple):
    name: str
    latLng: LatLng

    def serialize(self):
        return {
            "name": self.name,
            "latLng": self.latLng.serialize()
        }


class LocationNames(str, Enum):
    DAM = "Dam"
    MILITARY_BASE = "Military Base"
    QUARRY = "Quarry"
    TV_STATION = "TV Station"
    AIRPORT = "Airport"
    STORAGE_TOWN = "Storage Town"
    SUPERSTORE = "Superstore"
    STADIUM = "Stadium"
    LUMBER = "Lumber"
    BONEYARD = "Boneyard"
    TRAIN_STATION = "Train Station"
    HOSPITAL = "Hospital"
    DOWNTOWN = "Downtown"
    FARMLAND = "Farmland"
    PROMENADE_WEST = "Promenade West"
    PROMENADE_EAST = "Promenade East"
    HILLS = "Hills"
    PARK = "Park"
    PORT = "Port"
    PRISON = "Prison"


NAMED_LOCATIONS = [
    Location(name=LocationNames.DAM.value, latLng=LatLng(820, 200)),
    Location(name=LocationNames.MILITARY_BASE.value, latLng=LatLng(835, 480)),
    Location(name=LocationNames.QUARRY.value, latLng=LatLng(785, 750)),
    Location(name=LocationNames.TV_STATION.value, latLng=LatLng(555, 555)),
    Location(name=LocationNames.AIRPORT.value, latLng=LatLng(585, 250)),
    Location(name=LocationNames.STORAGE_TOWN.value, latLng=LatLng(480, 170)),
    Location(name=LocationNames.SUPERSTORE.value, latLng=LatLng(460, 300)),
    Location(name=LocationNames.STADIUM.value, latLng=LatLng(420, 690)),
    Location(name=LocationNames.LUMBER.value, latLng=LatLng(430, 910)),
    Location(name=LocationNames.BONEYARD.value, latLng=LatLng(310, 155)),
    Location(name=LocationNames.TRAIN_STATION.value, latLng=LatLng(270, 300)),
    Location(name=LocationNames.HOSPITAL.value, latLng=LatLng(300, 500)),
    Location(name=LocationNames.DOWNTOWN.value, latLng=LatLng(270, 640)),
    Location(name=LocationNames.FARMLAND.value, latLng=LatLng(250, 890)),
    Location(name=LocationNames.PROMENADE_WEST.value, latLng=LatLng(180, 240)),
    Location(name=LocationNames.PROMENADE_EAST.value, latLng=LatLng(200, 425)),
    Location(name=LocationNames.HILLS.value, latLng=LatLng(145, 300)),
    Location(name=LocationNames.PARK.value, latLng=LatLng(155,  610)),
    Location(name=LocationNames.PORT.value, latLng=LatLng(160, 750)),
    Location(name=LocationNames.PRISON.value, latLng=LatLng(50, 900)),
]


def get_rand_location(custom_locations):
    return random.choice(custom_locations)


@app.route('/', methods=["GET"])
def index():
    return render_template("index.html")


@app.route('/named_locations', methods=["GET"])
def named_locations():
    return jsonify([location.serialize() for location in NAMED_LOCATIONS])


@app.route('/generate_drop', methods=["POST"])
def generate_drop():
    data = request.get_json()

    locations = []
    for index, location in enumerate(data.get("locations", [])):
        loc_name = location.get("name")
        custom_location_count = 1
        if loc_name and loc_name == "Custom Location":
            loc_name += f" {custom_location_count}"

        locations.append(
            Location(
                loc_name,
                LatLng(**location["latLng"])
            )
        )

    rand_location = get_rand_location(locations)
    resp_data = {
        "all_locations": [loc.serialize() for loc in locations],
        "location": rand_location.serialize()
    }
    return jsonify(resp_data)
