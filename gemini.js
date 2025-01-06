import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCjWVE5ZcstmJIz1DuMtk6D5jYwGe8xSQ4");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Define your schemaType and construct the prompt
const schemaType = {
  database: "E-commerce",
  tables: [
    {
      name: "Users",
      columns: ["id: INT", "name: TEXT", "email: TEXT", "signup_date: DATE"],
    },
    {
      name: "Products",
      columns: ["id: INT", "name: TEXT", "price: FLOAT", "category: TEXT"],
    },
    {
      name: "Orders",
      columns: [
        "id: INT",
        "user_id: INT",
        "product_id: INT",
        "order_date: DATE",
      ],
    },
  ],
  relationships: [
    { from: "Users.id", to: "Orders.user_id" },
    { from: "Products.id", to: "Orders.product_id" },
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
const userQuery = "give me the cheapest product";
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