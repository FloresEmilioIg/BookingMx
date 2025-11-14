/**
 * @typedef {Object} Edge
 * @property {string} to - The name of the connected city.
 * @property {number} distance - The distance in kilometers to the connected city.
 */

/**
 * Implements an undirected graph structure to represent city connections and distances.
 */
export class Graph {
    /**
     * Initializes the graph with an empty adjacency map.
     * The map stores city names as keys and an array of Edge objects as values.
     */
     constructor() {
        /** @type {Map<string, Array<Edge>>} */
        this.adj = new Map(); // city -> Array<{to, distance}>
    }

    /**
     * Adds a new city (node) to the graph.
     * @param {string} name - The name of the city.
     * @throws {Error} If the city name is invalid or empty.
     */
    addCity(name) {
        if (!name || typeof name !== "string") throw new Error("Invalid city name");
        if (!this.adj.has(name)) this.adj.set(name, []);
    }

    /**
     * Adds an edge (connection) between two cities. The connection is undirected.
     * @param {string} from - The starting city name.
     * @param {string} to - The destination city name.
     * @param {number} distanceKm - The distance between the cities in kilometers (must be finite and non-negative).
     * @throws {Error} If either city is unknown or the distance is invalid.
     */
    addEdge(from, to, distanceKm) {
        if (!this.adj.has(from) || !this.adj.has(to)) throw new Error("Unknown city");
        if (!Number.isFinite(distanceKm) || distanceKm < 0) throw new Error("Invalid distance");

        // Undirected edge: connection from -> to
        this.adj.get(from).push({ to, distance: distanceKm });
        // Undirected edge: connection from to -> from
        this.adj.get(to).push({ to: from, distance: distanceKm }); // undirected
    }

    /**
     * Retrieves all neighboring cities and their distances for a given city.
     * @param {string} city - The name of the city.
     * @returns {Array<Edge>} A copy of the array of neighboring Edge objects.
     * @throws {Error} If the city is unknown.
     */
    neighbors(city) {
        if (!this.adj.has(city)) throw new Error("Unknown city");
        return [...this.adj.get(city)];
    }
}

/**
 * Validates an input dataset for the graph structure.
 * Checks for array types, duplicate cities, valid city entries, and valid edges.
 * @param {Object} data
 * @param {Array<string>} data.cities - List of city names.
 * @param {Array<Object>} data.edges - List of connection objects {from, to, distance}.
 * @returns {{ok: boolean, reason?: string}} Validation result object.
 */
export function validateGraphData({ cities, edges }) {
  if (!Array.isArray(cities) || !Array.isArray(edges)) return { ok: false, reason: "cities/edges must be arrays" };
  const citySet = new Set(cities);
  if (citySet.size !== cities.length) return { ok: false, reason: "duplicate cities" };
  for (const c of cities) if (typeof c !== "string" || !c.trim()) return { ok: false, reason: "invalid city entry" };
  for (const e of edges) {
    const { from, to, distance } = e ?? {};
    if (!citySet.has(from) || !citySet.has(to)) return { ok: false, reason: "edge references unknown city" };
    if (!Number.isFinite(distance) || distance < 0) return { ok: false, reason: "invalid distance" };
  }
  return { ok: true };
}

/**
 * Constructs a Graph instance from a list of cities and a list of edges.
 * @param {Array<string>} cities - List of city names.
 * @param {Array<Object>} edges - List of connection objects {from, to, distance}.
 * @returns {Graph} A fully built Graph instance.
 */
export function buildGraph(cities, edges) {
  const g = new Graph();
  for (const c of cities) g.addCity(c);
  for (const { from, to, distance } of edges) g.addEdge(from, to, distance);
  return g;
}

/**
 * Finds direct neighbors of a destination city within a specified maximum distance.
 * Results are sorted by distance, ascending.
 * @param {Graph} graph - The Graph instance to search.
 * @param {string} destination - The city to find nearby connections from.
 * @param {number} [maxDistanceKm=250] - The maximum distance (inclusive) for a city to be considered nearby.
 * @returns {Array<{city: string, distance: number}>} List of nearby cities with their distances.
 * @throws {Error} If the graph is not a Graph instance.
 */
export function getNearbyCities(graph, destination, maxDistanceKm = 250) {
    if (!(graph instanceof Graph)) throw new Error("graph must be Graph");

    // Guard clause for unknown or invalid destination
    if (typeof destination !== "string" || !graph.adj.has(destination)) return [];
    const neighbors = graph.neighbors(destination);
    return neighbors
        .filter(n => n.distance <= maxDistanceKm)
        .sort((a,b) => a.distance - b.distance)// Sort by distance ascending
        .map(n => ({ city: n.to, distance: n.distance }));
}

/**
 * Sample dataset used for initial application demonstration and testing.
 */
export const sampleData = {
  cities: [
    "Guadalajara", "Tlaquepaque", "Zapopan", "Tepatitlán", "Lagos de Moreno", "Tala", "Tequila"
  ],
  edges: [
    { from: "Guadalajara", to: "Zapopan", distance: 12 },
    { from: "Guadalajara", to: "Tlaquepaque", distance: 10 },
    { from: "Guadalajara", to: "Tepatitlán", distance: 78 },
    { from: "Guadalajara", to: "Tequila", distance: 60 },
    { from: "Zapopan", to: "Tala", distance: 35 },
    { from: "Tepatitlán", to: "Lagos de Moreno", distance: 85 }
  ]
};
