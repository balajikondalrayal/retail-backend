import express from "express"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const productsPath = new URL("./data.txt", import.meta.url)

app.use(express.json())

app.get("/products", (req, res) => {
    const params = req.query
    const { field, order, discount } = params
    try {
        const data = fs.readFileSync(productsPath, "utf-8")
        const products = JSON.parse(data).filter(product => product.discount < parseInt(discount || 0))
        
        if(!field || !order) {
            return res.json(products)
        }
        const sortedProducts = products.sort((a, b) => {
            if (order === "asc") {
                return parseInt(a[field]) - parseInt(b[field])
            } else {
                return parseInt(b[field]) - parseInt(a[field])
            }
        })
        res.send(sortedProducts)
    } catch (error) {
        res.status(500).json({ error: "Failed to read products data" })
    }
})

app.get("/products/:category", (req, res) => {
    const { category } = req.params
    console.log(`Fetching products for category: ${category}`)
    try {
        const data = fs.readFileSync(productsPath, "utf-8")
        const products = JSON.parse(data)
        const filteredProducts = products.filter(product => product.category === category)
        res.json(filteredProducts)
    } catch (error) {
        res.status(500).json({ error: "Failed to read products data" })
    }
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
