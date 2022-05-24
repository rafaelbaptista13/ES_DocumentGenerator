const bodyParser = require("body-parser");
const cors = require('cors')
const express = require("express");
const index = require("./app/routes/index")
const errorHandler = require("./app/config/errorhandler");


const app = express();
app.use(index);
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(errorHandler)

const server = require("http").createServer(app)

const port = process.env.PORT || 4000;


/////
// Start Swagger Configuration Section
/////

const swaggerJsDoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "MathGames API",
      description: "MathGames Server REST API",
      contact: {
        name: "MathGames"
      },
      servers: ["http://localhost:4000"]
    }
  },
  apis: ["app/routes/*.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))

/////
// End Swagger Configuration Section
/////



require("./app/routes/templates.routes.js")(app);

server.listen(port, () => console.log(`Listening on port ${port}`));
