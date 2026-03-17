import os
import folium
import osmnx as ox
import networkx as nx

from risk_model import calculate_risk

# ----------------------------------
# Graph Loading / Caching
# ----------------------------------

GRAPH_FILE = "kanpur.graphml"

if os.path.exists(GRAPH_FILE):
    print("Loading saved graph...")
    G = ox.load_graphml(GRAPH_FILE)
else:
    print("Downloading graph from OpenStreetMap...")
    place = "Kanpur, Uttar Pradesh, India"
    G = ox.graph_from_place(place, network_type="drive")
    ox.save_graphml(G, GRAPH_FILE)

print("Nodes:", len(G.nodes))
print("Edges:", len(G.edges))


# ----------------------------------
# Assign Custom Risk Weights
# ----------------------------------

def assign_edge_weights():
    """
    Assign weights for all modes at once.
    Avoids overwriting and improves performance.
    """

    for u, v, key, data in G.edges(keys=True, data=True):

        risk = calculate_risk(data)
        length = data.get("length", 0)

        # Different weights for different modes
        data["fastest_weight"] = length
        data["safe_weight"] = length + (risk * 500)
        data["family_weight"] = length + (risk * 250)


# ----------------------------------
# Route Calculation
# ----------------------------------

def find_route(origin_place, destination_place, weight_type):

    origin = ox.geocode(origin_place)
    destination = ox.geocode(destination_place)

    orig_node = ox.nearest_nodes(G, origin[1], origin[0])
    dest_node = ox.nearest_nodes(G, destination[1], destination[0])

    route = nx.shortest_path(
        G,
        orig_node,
        dest_node,
        weight=weight_type
    )

    return route


# ----------------------------------
# Convert Route to Coordinates
# ----------------------------------

def route_to_coords(route):
    return [(G.nodes[n]['y'], G.nodes[n]['x']) for n in route]


# ----------------------------------
# Example Run
# ----------------------------------

if __name__ == "__main__":

    origin = "Kanpur Central Railway Station"
    destination = "IIT Kanpur"

    # Assign all weights once
    assign_edge_weights()

    # Generate routes
    fastest_route = find_route(origin, destination, "fastest_weight")
    safe_route = find_route(origin, destination, "safe_weight")
    family_route = find_route(origin, destination, "family_weight")

    print("Fastest route nodes:", len(fastest_route))
    print("Safe route nodes:", len(safe_route))
    print("Family route nodes:", len(family_route))

    # Convert to coordinates
    fastest_coords = route_to_coords(fastest_route)
    safe_coords = route_to_coords(safe_route)
    family_coords = route_to_coords(family_route)

    # Create map
    start_lat, start_lon = fastest_coords[0]
    m = folium.Map(location=[start_lat, start_lon], zoom_start=12)

    # Add routes
    folium.PolyLine(fastest_coords, color="blue", weight=6, opacity=0.7, tooltip="Fastest route (minimum distance)").add_to(m)
    folium.PolyLine(safe_coords, color="green", weight=6, opacity=0.7, tooltip="Safer route (lower risk, slightly longer)").add_to(m)
    folium.PolyLine(family_coords, color="red", weight=6, opacity=0.7, tooltip="Balanced family route").add_to(m)

    # Add markers
    folium.Marker(
        location=fastest_coords[0],
        popup="Start",
        icon=folium.Icon(color="green")
    ).add_to(m)

    folium.Marker(
        location=fastest_coords[-1],
        popup="Destination",
        icon=folium.Icon(color="red")
    ).add_to(m)

    # Save map
    m.save("routes_map.html")

    print("Map saved as routes_map.html")