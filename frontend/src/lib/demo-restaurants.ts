/**
 * Frontend-only demo data for the map UI. Shaped like the real `restaurants` /
 * `dietary_tags` schema (see docs/product/schema-and-search-design.md) so a
 * later swap to a live API is a data-source change, not a component rewrite.
 * See docs/superpowers/specs/2026-09-19-restaurant-demo-ui-design.md.
 */

export type DietaryStatus = "verified" | "likely" | "unchecked" | "false";

export type MenuItem = {
  name: string;
  price: string;
  description?: string;
};

export type MenuSection = {
  name: string;
  items: MenuItem[];
};

export type DemoRestaurant = {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  priceLevel: 1 | 2 | 3 | 4;
  dietaryStatus: DietaryStatus;
  zabihahUrl?: string;
  menu: MenuSection[];
};

export const DEMO_RESTAURANTS: DemoRestaurant[] = [
  {
    id: "paramount-fine-foods",
    name: "Paramount Fine Foods",
    neighborhood: "King West",
    address: "615 King St W, Toronto",
    lat: 43.6448,
    lng: -79.4,
    priceLevel: 2,
    dietaryStatus: "verified",
    zabihahUrl: "https://www.zabihah.com",
    menu: [
      {
        name: "Starters",
        items: [
          { name: "Hummus", price: "$7", description: "Chickpea puree, olive oil, warm pita" },
          { name: "Baba Ghanouj", price: "$7", description: "Smoked eggplant, tahini, garlic" },
          { name: "Falafel (5 pc)", price: "$6" },
        ],
      },
      {
        name: "Mains",
        items: [
          { name: "Chicken Shawarma Plate", price: "$15" },
          { name: "Beef Kafta Plate", price: "$16" },
          { name: "Mixed Grill Platter", price: "$22", description: "Chicken, beef, lamb kafta" },
        ],
      },
      {
        name: "Drinks",
        items: [
          { name: "Mint Lemonade", price: "$4" },
          { name: "Turkish Coffee", price: "$3" },
        ],
      },
    ],
  },
  {
    id: "lahore-tikka-house",
    name: "Lahore Tikka House",
    neighborhood: "Gerrard St East",
    address: "1365 Gerrard St E, Toronto",
    lat: 43.6708,
    lng: -79.3238,
    priceLevel: 1,
    dietaryStatus: "verified",
    zabihahUrl: "https://www.zabihah.com",
    menu: [
      {
        name: "Starters",
        items: [
          { name: "Seekh Kebab", price: "$8" },
          { name: "Samosas (2 pc)", price: "$4" },
          { name: "Pakora", price: "$6" },
        ],
      },
      {
        name: "Mains",
        items: [
          { name: "Chicken Tikka Masala", price: "$14" },
          { name: "Lamb Karahi", price: "$17" },
          { name: "Nihari", price: "$15", description: "Slow-braised beef stew" },
        ],
      },
      {
        name: "Sides",
        items: [
          { name: "Garlic Naan", price: "$3" },
          { name: "Basmati Rice", price: "$3" },
        ],
      },
    ],
  },
  {
    id: "banu",
    name: "Banu",
    neighborhood: "Ossington",
    address: "165 Ossington Ave, Toronto",
    lat: 43.6465,
    lng: -79.4203,
    priceLevel: 3,
    dietaryStatus: "likely",
    menu: [
      {
        name: "Starters",
        items: [
          { name: "Whipped Feta, Hot Honey", price: "$9" },
          { name: "Lamb Merguez Flatbread", price: "$12" },
        ],
      },
      {
        name: "Mains",
        items: [
          { name: "Adana Kebab", price: "$19" },
          { name: "Grilled Branzino", price: "$26" },
          { name: "Charred Cauliflower", price: "$16" },
        ],
      },
      {
        name: "Drinks",
        items: [{ name: "Pomegranate Fizz", price: "$6" }],
      },
    ],
  },
  {
    id: "adonis-shawarma",
    name: "Adonis Shawarma",
    neighborhood: "Downtown Yonge",
    address: "298 Yonge St, Toronto",
    lat: 43.6561,
    lng: -79.3802,
    priceLevel: 1,
    dietaryStatus: "likely",
    menu: [
      {
        name: "Wraps",
        items: [
          { name: "Chicken Shawarma Wrap", price: "$9" },
          { name: "Beef Shawarma Wrap", price: "$10" },
          { name: "Falafel Wrap", price: "$8" },
        ],
      },
      {
        name: "Sides",
        items: [
          { name: "Fries", price: "$4" },
          { name: "Garlic Sauce Cup", price: "$1" },
        ],
      },
    ],
  },
  {
    id: "kinton-ramen",
    name: "Kinton Ramen",
    neighborhood: "Baldwin Village",
    address: "51 Baldwin St, Toronto",
    lat: 43.6577,
    lng: -79.3927,
    priceLevel: 2,
    dietaryStatus: "unchecked",
    menu: [
      {
        name: "Ramen",
        items: [
          { name: "Tonkotsu Ramen", price: "$15" },
          { name: "Spicy Miso Ramen", price: "$16" },
          { name: "Shoyu Ramen", price: "$14" },
        ],
      },
      {
        name: "Sides",
        items: [
          { name: "Gyoza (5 pc)", price: "$7" },
          { name: "Karaage Chicken", price: "$8" },
        ],
      },
      {
        name: "Drinks",
        items: [{ name: "Ramune Soda", price: "$4" }],
      },
    ],
  },
];
