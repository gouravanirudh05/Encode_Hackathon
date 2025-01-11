import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCjWVE5ZcstmJIz1DuMtk6D5jYwGe8xSQ4");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define your schemaType and construct the prompt
const schemaType = {
  database: "electronicStore",
  tables: [
    {
      name: "Brands",
      columns: [
        "BrandID: INT AUTO_INCREMENT PRIMARY KEY",
        "Name: VARCHAR(255) UNIQUE NOT NULL",
      ],
    },
    {
      name: "Categories",
      columns: [
        "CategoryID: INT AUTO_INCREMENT PRIMARY KEY",
        "Name: VARCHAR(255) UNIQUE NOT NULL",
      ],
    },
    {
      name: "Customers",
      columns: [
        "CustomerID: INT AUTO_INCREMENT PRIMARY KEY",
        "Name: VARCHAR(255) NOT NULL",
        "Email: VARCHAR(255) UNIQUE NOT NULL",
        "Phone: VARCHAR(15)",
        "Address: TEXT",
      ],
    },
    {
      name: "Products",
      columns: [
        "ProductID: INT AUTO_INCREMENT PRIMARY KEY",
        "Name: VARCHAR(255) NOT NULL",
        "BrandID: INT NOT NULL",
        "CategoryID: INT NOT NULL",
        "Price: DECIMAL(10,2) NOT NULL",
        "Rating: DECIMAL(2,1)",
        "Stock: INT NOT NULL DEFAULT 0",
        "Description: TEXT",
      ],
    },
    {
      name: "Specifications",
      columns: [
        "SpecificationID: INT AUTO_INCREMENT PRIMARY KEY",
        "ProductID: INT NOT NULL",
        "Key: VARCHAR(255) NOT NULL",
        "Value: VARCHAR(255) NOT NULL",
      ],
    },
  ],
  relationships: [
    { from: "Products.BrandID", to: "Brands.BrandID" },
    { from: "Products.CategoryID", to: "Categories.CategoryID" },
    { from: "Specifications.ProductID", to: "Products.ProductID" },
  ],
};


// Function to format the schema into a text prompt
function formatSchema(schema) {
  let prompt = `Database: ${schema.database}\nTables:\n`;
  schema.tables.forEach((table) => {
    prompt += `- ${table.name}(${table.columns.join(", ")})\n`;
  });
  prompt += "Relationships:\n";
  schema.relationships.forEach((rel) => {
    prompt += `- ${rel.from} -> ${rel.to}\n`;
  });
  return prompt;
}

// Construct the full prompt
const userQuery = "why would you suggest buying HP pavillion 33";
const schemaPrompt = formatSchema(schemaType);
const prompt = `${schemaPrompt}\n\nGenerate a SQL query for the following request:\n"${userQuery}". Just return the code without any quotation marks`;

const result = await model.generateContent(prompt);
console.log(result.response.text());
export default result.response.text();

/*
OUTPUT = {
name = "",
brandid = [""],
price = [""],
category = [""],

}
*/