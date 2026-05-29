from fastapi import FastAPI, Query
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/test")
def test_endpoint(statuses: list[str] | None = Query(None)):
    return {"statuses": statuses}

client = TestClient(app)

def test():
    # Test how axios sends it
    response = client.get("/test?statuses=PLACED&statuses=CONFIRMED")
    print("Array query:", response.json())
    
    # What if axios sends it as statuses[]=PLACED&statuses[]=CONFIRMED ?
    response2 = client.get("/test?statuses[]=PLACED&statuses[]=CONFIRMED")
    print("Bracket query:", response2.json())

    # What if axios sends it as statuses=PLACED,CONFIRMED ?
    response3 = client.get("/test?statuses=PLACED,CONFIRMED")
    print("Comma query:", response3.json())

if __name__ == "__main__":
    test()
