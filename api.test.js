import { describe, before, after, it } from 'node:test'
import { deepEqual, deepStrictEqual } from 'node:assert'
import assert from 'node:assert';
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000'

describe('API PRODUCTS Test Suite', () => {
    let _server = {} 
    let _globalToken = ''

    async function makeRequest(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                Authorization: _globalToken
            }
        })
        return response.json()
    }
    
    async function setToken() {
            const input = {
            user: "arth",
            password: "123"
        }
        const data = await makeRequest(`${BASE_URL}/login`, input)
        assert.ok(data.token, 'token existe') 
        _globalToken = data.token
    }
//_server = (await import("./api.js"))
    before(() => {
        return import("./api.js") 
            .then(module => {
                _server = module.app
                return new Promise(resolve => {
                    console.log("--------------------------------------------------------------------------------------------------------")
                    _server.once('listening', resolve)
                })
            })
    })

    before(async () => setToken())

    it('deve criar um produto premium', async () => {
        const input = {
            description: "aquario",
            price: 102
        }
        const data = await makeRequest(`${BASE_URL}/products`, input)
        deepStrictEqual(data.category, "premium")
        // 0 a 50 = basico
        // 51 a 100 = regular
        // 101 a 150 = premium
    })

    it('deve criar um produto regular', async () => {
        const input = {
            description: "alho",
            price: 51
        }
        const data = await makeRequest(`${BASE_URL}/products`, input)
        deepStrictEqual(data.category, "regular")
    })

    it('deve criar um produto basico', async () => {
        const input = {
            description: "pasta de dente",
            price: 10
        }
        const data = await makeRequest(`${BASE_URL}/products`, input)
        deepStrictEqual(data.category, "basico")
    })



    after(done => _server.close(done))
})