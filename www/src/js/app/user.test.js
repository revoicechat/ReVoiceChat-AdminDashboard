const { User } = require('./user.js');
const {afterEach, beforeEach, describe, expect, it} = require('@jest/globals');

describe('User', () => {
    let mockRVCA;
    let user;

    beforeEach(() => {
        // Create mock RVCA object with fetcher
        mockRVCA = {
            fetcher: {
                fetchCore: jest.fn()
            }
        };

        user = new User(mockRVCA);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize with RVCA instance', () => {
            expect(user.RVCA).toBe(mockRVCA);
        });
    });

    describe('load', () => {
        it('should fetch user data and set id and displayName', async () => {
            const mockUserData = {
                id: '123',
                displayName: 'John Doe'
            };

            mockRVCA.fetcher.fetchCore.mockResolvedValue(mockUserData);

            await user.load();

            expect(mockRVCA.fetcher.fetchCore).toHaveBeenCalledWith('/user/me', 'GET');
            expect(user.id).toBe('123');
            expect(user.displayName).toBe('John Doe');
        });

        it('should not set properties when fetchCore returns null', async () => {
            mockRVCA.fetcher.fetchCore.mockResolvedValue(null);

            await user.load();

            expect(mockRVCA.fetcher.fetchCore).toHaveBeenCalledWith('/user/me', 'GET');
            expect(user.id).toBeUndefined();
            expect(user.displayName).toBeUndefined();
        });

        it('should handle fetchCore rejection', async () => {
            const error = new Error('Network error');
            mockRVCA.fetcher.fetchCore.mockRejectedValue(error);

            await expect(user.load()).rejects.toThrow('Network error');
        });

        it('should update existing properties when called multiple times', async () => {
            const firstData = {
                id: '123',
                displayName: 'John Doe'
            };
            const secondData = {
                id: '456',
                displayName: 'Jane Smith'
            };

            mockRVCA.fetcher.fetchCore.mockResolvedValueOnce(firstData);
            await user.load();

            expect(user.id).toBe('123');
            expect(user.displayName).toBe('John Doe');

            mockRVCA.fetcher.fetchCore.mockResolvedValueOnce(secondData);
            await user.load();

            expect(user.id).toBe('456');
            expect(user.displayName).toBe('Jane Smith');
            expect(mockRVCA.fetcher.fetchCore).toHaveBeenCalledTimes(2);
        });
    });
});