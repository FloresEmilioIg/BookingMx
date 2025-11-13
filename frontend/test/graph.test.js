import { Graph, validateGraphData, buildGraph, getNearbyCities, sampleData } from '../js/graph.js';

// --- Test Suite for Graph Class ---
describe('Graph Class', () => {
    let g;

    beforeEach(() => {
        g = new Graph();
    });

    test('should initialize with an empty adjacency map', () => {
        expect(g.adj.size).toBe(0);
    });

    // --- addCity tests ---
    test('should add a city successfully', () => {
        g.addCity("Mexico City");
        expect(g.adj.has("Mexico City")).toBe(true);
        expect(g.adj.get("Mexico City")).toEqual([]);
    });

    test('should throw error for invalid city name (null, number, empty string)', () => {
        expect(() => g.addCity(null)).toThrow("Invalid city name");
        expect(() => g.addCity(123)).toThrow("Invalid city name");
        expect(() => g.addCity("")).toThrow("Invalid city name");
    });

    test('should not duplicate a city', () => {
        g.addCity("Tijuana");
        g.addCity("Tijuana");
        expect(g.adj.size).toBe(1);
        expect(g.adj.get("Tijuana")).toEqual([]);
    });

    // --- addEdge tests ---
    test('should add an undirected edge successfully', () => {
        g.addCity("A");
        g.addCity("B");
        g.addEdge("A", "B", 100);

        expect(g.adj.get("A")).toEqual([{ to: "B", distance: 100 }]);
        expect(g.adj.get("B")).toEqual([{ to: "A", distance: 100 }]);
    });

    test('should throw error if cities do not exist', () => {
        g.addCity("A");
        expect(() => g.addEdge("A", "C", 50)).toThrow("Unknown city");
        expect(() => g.addEdge("D", "A", 50)).toThrow("Unknown city");
    });

    test('should throw error for invalid distance (negative, NaN, non-finite)', () => {
        g.addCity("X");
        g.addCity("Y");
        expect(() => g.addEdge("X", "Y", -10)).toThrow("Invalid distance");
        expect(() => g.addEdge("X", "Y", NaN)).toThrow("Invalid distance");
        expect(() => g.addEdge("X", "Y", Infinity)).toThrow("Invalid distance");
    });

    // --- neighbors tests ---
    test('should return neighbors array', () => {
        g.addCity("A");
        g.addCity("B");
        g.addCity("C");
        g.addEdge("A", "B", 10);
        g.addEdge("A", "C", 20);
        const expectedNeighbors = [{ to: "B", distance: 10 }, { to: "C", distance: 20 }];
        expect(g.neighbors("A")).toEqual(expectedNeighbors);
    });

    test('should throw error for unknown city when querying neighbors', () => {
        expect(() => g.neighbors("Unknown")).toThrow("Unknown city");
    });
});

// --- Test Suite for Graph Utility Functions ---
describe('Graph Utility Functions', () => {

    // --- validateGraphData tests ---
    describe('validateGraphData', () => {
        const validData = { cities: ["A", "B"], edges: [{ from: "A", to: "B", distance: 10 }] };
        test('should return ok for valid data', () => {
            expect(validateGraphData(validData).ok).toBe(true);
        });

        // Edge case: Empty graph is valid
        test('should return ok for empty data', () => {
            expect(validateGraphData({ cities: [], edges: [] }).ok).toBe(true);
        });

        // Error: Invalid structure
        test('should fail if cities or edges are not arrays', () => {
            expect(validateGraphData({ cities: "A", edges: [] }).ok).toBe(false);
            expect(validateGraphData({ cities: [], edges: {} }).ok).toBe(false);
            expect(validateGraphData({}).ok).toBe(false);
        });

        // Error: Duplicate cities
        test('should fail if cities array has duplicates', () => {
            const data = { cities: ["A", "A"], edges: [] };
            expect(validateGraphData(data).ok).toBe(false);
            expect(validateGraphData(data).reason).toBe("duplicate cities");
        });

        // Error: Invalid city entry
        test('should fail for non-string or empty-string cities', () => {
            expect(validateGraphData({ cities: [123], edges: [] }).ok).toBe(false);
            expect(validateGraphData({ cities: [" "], edges: [] }).ok).toBe(false);
        });

        // Error: Unknown city in edge
        test('should fail if edge references unknown city', () => {
            const data = { cities: ["A"], edges: [{ from: "A", to: "C", distance: 10 }] };
            expect(validateGraphData(data).ok).toBe(false);
            expect(validateGraphData(data).reason).toBe("edge references unknown city");
        });

        // Error: Invalid distance in edge
        test('should fail for invalid distance in edges', () => {
            const data = { cities: ["A", "B"], edges: [{ from: "A", to: "B", distance: -10 }] };
            expect(validateGraphData(data).ok).toBe(false);
            expect(validateGraphData(data).reason).toBe("invalid distance");
            const data2 = { cities: ["A", "B"], edges: [{ from: "A", to: "B", distance: 'ten' }] };
            expect(validateGraphData(data2).ok).toBe(false);
            expect(validateGraphData(data2).reason).toBe("invalid distance");
        });

        // Edge case: Null/undefined edge entry
        test('should handle null or undefined entries in edges array', () => {
            const data = { cities: ["A"], edges: [null] };
            expect(validateGraphData(data).ok).toBe(false); // Fails because it doesn't have from/to
        });
    });

    // --- buildGraph tests ---
    describe('buildGraph', () => {
        test('should correctly build a Graph instance from data', () => {
            const cities = ["X", "Y"];
            const edges = [{ from: "X", to: "Y", distance: 50 }];
            const graph = buildGraph(cities, edges);

            expect(graph instanceof Graph).toBe(true);
            expect(graph.adj.has("X")).toBe(true);
            expect(graph.adj.get("X")).toEqual([{ to: "Y", distance: 50 }]);
        });

        test('should build an empty graph for empty data', () => {
            const graph = buildGraph([], []);
            expect(graph.adj.size).toBe(0);
        });
    });

    // --- getNearbyCities tests ---
    describe('getNearbyCities', () => {
        let g;
        beforeAll(() => {
            // Use the provided sample data to build a complex graph for testing
            g = buildGraph(sampleData.cities, sampleData.edges);
        });

        test('should return an empty array if destination is unknown', () => {
            expect(getNearbyCities(g, "Cancun")).toEqual([]);
        });

        test('should return an empty array if destination is invalid', () => {
            expect(getNearbyCities(g, 123)).toEqual([]);
        });

        test('should throw error if graph input is not a Graph instance', () => {
            expect(() => getNearbyCities(null, "Guadalajara")).toThrow("graph must be Graph");
        });

        test('should return all nearby cities within default max distance (250km)', () => {
            const results = getNearbyCities(g, "Guadalajara");
            const expectedCities = ["Tlaquepaque", "Zapopan", "Tequila", "Tepatitlán"];

            // Check count and sorting (ascending distance)
            expect(results.length).toBe(4);
            expect(results.map(r => r.city)).toEqual(expectedCities);
            expect(results[0].distance).toBe(10); // Tlaquepaque
            expect(results[3].distance).toBe(78); // Tepatitlán
        });

        test('should filter results by a custom max distance (e.g., 60km)', () => {
            const results = getNearbyCities(g, "Guadalajara", 60);
            const expectedCities = ["Tlaquepaque", "Zapopan", "Tequila"];

            expect(results.length).toBe(3);
            expect(results.map(r => r.city)).toEqual(expectedCities);
            expect(results[2].distance).toBe(60);

            // Re-running the assertion: Tequila (60km) should be excluded by maxDistance 50km
            const results50 = getNearbyCities(g, "Guadalajara", 50);
            expect(results50.length).toBe(2);
            expect(results50.map(r => r.city)).toEqual(["Tlaquepaque", "Zapopan"]);
            expect(results50[0].distance).toBe(10);
        });

        test('should handle a destination with no neighbors', () => {
            const g2 = new Graph();
            g2.addCity("Isolate");
            expect(getNearbyCities(g2, "Isolate")).toEqual([]);
        });

        test('should handle a destination with neighbors exactly at maxDistance boundary', () => {
            const results = getNearbyCities(g, "Guadalajara", 78);
            // Includes Tlaquepaque (10), Zapopan (12), Tequila (60), Tepatitlán (78)
            expect(results.length).toBe(4);
            expect(results[3].city).toBe("Tepatitlán");
            expect(results[3].distance).toBe(78); // Should be included
        });
    });
});