# POS
Point  Of Sale System with Java Spring Boot and React

## DESCRIPTION OF API METHODS

**1. createProduct**

Description: This method creates a new product in the system. 
It takes a ProductDto as input, maps it to a Product entity, saves it to the
database,and returns the saved product as a ProductDto. It’s used to add new
inventory items to the POS system.

    //Endpoint: POST /api/products

**2. getProductById(long id)**

Description: Retrieves a product by its ID from the database. If the product
does not  exist, it throws a ResourceNotFoundException. The product is mapped to a
ProductDto and returned, allowing users to view details of a specific product.

    //Endpoint: GET /api/products/{id}.


**3. getAllProducts(int pageNo, int pageSize, String sortBy, String sortDir)**
Description: Retrieves a paginated and sorted list of all products in the system.
It allows users to specify the page number, page size, sorting field (e.g., id,
name), and sorting direction (asc or desc). Returns a PagedResponse<ProductDto>
with the list of products and pagination metadata (e.g., total pages, total
elements).


    //Endpoint: GET /api/products


### **ADDITIONALBUSINESS LOGIC FOR SALES**

 **processSale(SaleRequestDto saleRequest)**

Description: Processes a sale transaction by creating a Sale entity with
 associated SaleItem entities. It validates stock availability for each item,
 calculates the subtotal, applies discounts and taxes, updates product stock, and
 saves the sale to the database. If stock is insufficient, it throws an
 IllegalArgumentException. It also triggers low stock notifications and
 reordering if a product’s stock falls below its threshold. Returns a
 SaleResponseDto with the sale details.

    //Endpoint: POST /api/sales

##### Note:  The above endpoint is assisted by a few helper methods


### The process involves:

Receiving the Sale Request: A JSON payload containing sale details (items, payment method, user, customer, discounts, etc.).

Validating and Reserving Stock: Ensuring products are available and reserving stock to prevent overselling.

Creating the Sale Entity: Setting up the Sale entity with user, customer, and payment details.

Processing Sale Items: Creating SaleItem entities for each purchased item, calculating prices, and updating product stock.

Applying Discounts and Taxes: Calculating loyalty discounts, percentage-based discounts, and taxes.

Updating Loyalty Points: Adjusting customer loyalty points based on the sale.

Persisting the Sale: Saving the Sale and its SaleItem entities to the database.

Logging Audit Entries: Recording the sale and sale item creation in the audit log.
Returning the Response: Generating a SaleResponseDto with the sale details.



