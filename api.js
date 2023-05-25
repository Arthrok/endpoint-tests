import jsonwebtoken from 'jsonwebtoken'
import { once, EventEmitter } from 'node:events'
import { createServer } from 'node:http'


const VALID = { 
  user: 'arth',
  password: '123'
}
const TOKEN_KEY = "abc123"

function loginRoute(request, response) {
  once(request, "data")
    .then((data) => { 
      const { user, password } = JSON.parse(data);
      if (user !== VALID.user || password !== VALID.password) {
        response.writeHead(400);
        response.end(JSON.stringify({ error: "user invalid!" }));
      } else {
        const token = jsonwebtoken.sign(
          { user, message: "heyduude" },
          TOKEN_KEY
        );
        response.end(JSON.stringify({ token }));
      }
    })
    .catch((error) => {
      response.writeHead(500);
      response.end(JSON.stringify({ error: "internal server error" }));
    });
}


function validateHeaders(headers) {
  try {
    const auth = headers.authorization.replace(/bearer\s/ig, '')
    jsonwebtoken.verify(auth, TOKEN_KEY, (err, decod) => {
      if(err) {
        console.log("erro ao decodificar")
      } else {
        console.log(decod)
      }
    })
    return true
  } catch (error) {
    return false
  }
}

function createProductRoute(request, response) {
  once(request, "data")
    .then((data) => {
      const { description, price } = JSON.parse(data);
      
      const categories = {
        premium: {
          from: 100,
          to: 150
        },
        regular: {
          from: 50,
          to: 99
        },
        basico: {
          from: 1,
          to: 49
        } 
      }

      const category = Object.keys(categories).find(key => {
        const category = categories[key]
        return price >= category.from && price <= category.to
      })
      console.log({category, price})
      response.end(JSON.stringify({ category }));
              // 0 a 50 = basico
        // 51 a 100 = regular
        // 101 a 150 = premium
    })
    .catch((error) => {
      response.writeHead(500);
      response.end(JSON.stringify({ error: "internal server error" }));
    });
}

async function handler(request, response) {
  if (request.url === '/login' && request.method === "POST") {
    return loginRoute(request, response)
  }

  if (!validateHeaders(request.headers)) {
    console.log("Erro de validação: ", request.headers)
    response.writeHead(404)
    return response.end("invalid token!")
  }

  if(request.url == '/products' && request.method === 'POST') {
    return createProductRoute(request, response)
  }

  response.writeHead(401)
  response.end('not found!')
}

const app = createServer(handler)
  .listen(3000, () => console.log('listening to 3000'))

export { app }