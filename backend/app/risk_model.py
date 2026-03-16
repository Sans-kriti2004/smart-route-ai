#Create a Risk Score Function
def calculate_risk(edge_data):
    risk = 0
    
    #Example heuristic (later can be replaced with ML model)
    if edge_data.get("highway") == "residential":
        risk += 2
    
    if edge_data.get("length", 0) > 500:
        risk += 1
        
    return risk