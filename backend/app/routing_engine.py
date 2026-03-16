import os
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
#Nodes: 59530, Edges: 159579

# ----------------------------------
# Assign Custom Risk Weights
# ----------------------------------

def assign_edge_weights(mode="safe"):
    """
    Assign custom weights to each edge based on distance and risk.
    """

    for u, v, key, data in G.edges(keys=True, data=True):

        risk = calculate_risk(data)
        length = data.get("length", 0)

        if mode == "safe":
            data["custom_weight"] = length + (risk * 200)

        elif mode == "family":
            data["custom_weight"] = length + (risk * 120)

        elif mode == "fastest":
            data["custom_weight"] = length

        else:
            data["custom_weight"] = length


# ----------------------------------
# Route Calculation
# ----------------------------------

def find_route(origin_place, destination_place, mode="safe"):

    origin = ox.geocode(origin_place)
    destination = ox.geocode(destination_place)

    orig_node = ox.nearest_nodes(G, origin[1], origin[0])
    dest_node = ox.nearest_nodes(G, destination[1], destination[0])

    route = nx.shortest_path(
        G,
        orig_node,
        dest_node,
        weight="custom_weight"
    )

    return route

# ----------------------------------
# Example Run
# ----------------------------------

if __name__ == "__main__":

    assign_edge_weights(mode="safe")

    route = find_route(
        "Kanpur Central Railway Station",
        "IIT Kanpur",
        mode="safe"
    )

    print("Route nodes:", len(route))

    # Visualize route
    ox.plot_graph_route(G, route)