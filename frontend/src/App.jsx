import { useEffect, useState } from "react";

function App() {

  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {

    fetch("http://localhost:8080/api/vehicles")
      .then(response => response.json())
      .then(data => {
        setVehicles(data);
      });

  }, []);

  return (
    <div style={{ padding: "20px" }}>

      <h1>Car Rental</h1>

      {vehicles.map(vehicle => (

        <div
          key={vehicle.id}
          style={{
            border: "1px solid gray",
            padding: "10px",
            marginBottom: "10px"
          }}
        >

          <h2>
            {vehicle.brand} {vehicle.model}
          </h2>

          <p>
            Year: {vehicle.year}
          </p>

          <p>
            Type: {vehicle.type}
          </p>

          <p>
            Price per day:
            {" "}
            {vehicle.pricePerDay} PLN
          </p>

          <p>
            Available:
            {" "}
            {vehicle.available ? "YES" : "NO"}
          </p>

        </div>

      ))}

    </div>
  );
}

export default App;
