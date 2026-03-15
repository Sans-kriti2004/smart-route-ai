import osmnx as ox
import networkx as nx 

#Download the road networks for the specified locations (Kanpur)
place = "Kanpur, Uttar Pradesh, India"
G = ox.graph_from_place(place, network_type="drive")

print("Nodes:", len(G.nodes))
print("Edges:", len(G.edges))
# Nodes: 59530; Edges: 159579

#Generate a route (Kanpur Central to IIT Kanpur)
origin = ox.geocode("Kanpur Central Railway Station")
destination = ox.geocode("IIT Kanpur")

orig_node = ox.nearest_nodes(G, origin[1], origin[0])
dest_node = ox.nearest_nodes(G, destination[1], destination[0])

route = nx.shortest_path(G, orig_node, dest_node, weight="length")

print("Route nodes:", len(route))
# Route nodes: 82

#Visualize the route
ox.plot_graph_route(G, route)