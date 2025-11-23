const Fetcher = require('./fetcher.js');
const {afterEach, beforeEach, describe, expect, it} = require('@jest/globals');

// Mock fetch globally
global.fetch = jest.fn();

describe('Fetcher', () => {
    let fetcher;
    const mockToken = 'test-token-123';
    const mockCoreURL = 'https://api.example.com';
    const mockMediaURL = 'https://media.example.com';

    beforeEach(() => {
        fetcher = new Fetcher(mockToken, mockCoreURL, mockMediaURL);
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('fetchCore', () => {
        it('should make GET request with correct headers', async () => {
            const mockResponse = { data: 'test' };
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                },
                json: jest.fn().mockResolvedValue(mockResponse)
            });

            const result = await fetcher.fetchCore('/users', 'GET');

            expect(global.fetch).toHaveBeenCalledWith(
                `${mockCoreURL}/api/users`,
                expect.objectContaining({
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${mockToken}`
                    }
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should default to GET method when method is null', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                },
                json: jest.fn().mockResolvedValue({})
            });

            await fetcher.fetchCore('/users', null);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'GET'
                })
            );
        });

        it('should stringify data when provided', async () => {
            const mockData = { name: 'John', age: 30 };
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                },
                json: jest.fn().mockResolvedValue({})
            });

            await fetcher.fetchCore('/users', 'POST', mockData);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: JSON.stringify(mockData)
                })
            );
        });

        it('should return true for DELETE requests when response is ok', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn()
                }
            });

            const result = await fetcher.fetchCore('/users/1', 'DELETE');

            expect(result).toBe(true);
        });

        it('should return false for DELETE requests when response is not ok', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                headers: {
                    get: jest.fn()
                }
            });

            const result = await fetcher.fetchCore('/users/1', 'DELETE');

            expect(result).toBe(false);
        });

        it('should parse JSON response for non-DELETE requests', async () => {
            const mockData = { id: 1, name: 'Test' };
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                },
                json: jest.fn().mockResolvedValue(mockData)
            });

            const result = await fetcher.fetchCore('/users/1', 'GET');

            expect(result).toEqual(mockData);
        });

        it('should return response.ok for non-JSON content types', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('text/html')
                }
            });

            const result = await fetcher.fetchCore('/users', 'GET');

            expect(result).toBe(true);
        });

        it('should handle fetch errors and return null', async () => {
            const error = new Error('Network error');
            global.fetch.mockRejectedValue(error);

            const result = await fetcher.fetchCore('/users', 'GET');

            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('fetchCore: An error occurred')
            );
        });

        it('should include timeout signal', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                },
                json: jest.fn().mockResolvedValue({})
            });

            await fetcher.fetchCore('/users', 'GET');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    signal: expect.any(Object)
                })
            );
        });

        it('should handle null data parameter', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                },
                json: jest.fn().mockResolvedValue({})
            });

            await fetcher.fetchCore('/users', 'POST', null);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: null
                })
            );
        });
    });

    describe('fetchMedia', () => {
        it('should make GET request with correct headers', async () => {
            const mockResponse = { url: 'https://example.com/image.jpg' };
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                },
                json: jest.fn().mockResolvedValue(mockResponse)
            });

            const result = await fetcher.fetchMedia('/images/1', 'GET');

            expect(global.fetch).toHaveBeenCalledWith(
                `${mockMediaURL}/images/1`,
                expect.objectContaining({
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${mockToken}`
                    }
                })
            );
            expect(result).toEqual(mockResponse);
        });

        it('should default to GET method when method is null', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                },
                json: jest.fn().mockResolvedValue({})
            });

            await fetcher.fetchMedia('/images/1', null);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: 'GET'
                })
            );
        });

        it('should send raw data in body', async () => {
            const rawData = new FormData();
            rawData.append('file', 'test');

            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                },
                json: jest.fn().mockResolvedValue({})
            });

            await fetcher.fetchMedia('/upload', 'POST', rawData);

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    body: rawData
                })
            );
        });

        it('should return true for DELETE requests when response is ok', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn()
                }
            });

            const result = await fetcher.fetchMedia('/images/1', 'DELETE');

            expect(result).toBe(true);
        });

        it('should parse JSON response for non-DELETE requests', async () => {
            const mockData = { id: 1, url: 'https://example.com/image.jpg' };
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                },
                json: jest.fn().mockResolvedValue(mockData)
            });

            const result = await fetcher.fetchMedia('/images/1', 'GET');

            expect(result).toEqual(mockData);
        });

        it('should return response.ok for non-JSON content types', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('image/jpeg')
                }
            });

            const result = await fetcher.fetchMedia('/images/1', 'GET');

            expect(result).toBe(true);
        });

        it('should handle fetch errors and return null', async () => {
            const error = new Error('Network error');
            global.fetch.mockRejectedValue(error);

            const result = await fetcher.fetchMedia('/images/1', 'GET');

            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('fetchMedia: An error occurred')
            );
        });

        it('should include timeout signal', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                },
                json: jest.fn().mockResolvedValue({})
            });

            await fetcher.fetchMedia('/images/1', 'GET');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    signal: expect.any(Object)
                })
            );
        });
    });
});