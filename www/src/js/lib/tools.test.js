const { setCookie, getCookie, eraseCookie, copyToClipboard } = require('./tools.js');
const {afterEach, beforeEach, describe, expect, it} = require('@jest/globals');

describe('Cookie Functions', () => {
    beforeEach(() => {
        // Clear all cookies before each test
        document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        });
    });

    describe('setCookie', () => {
        it('should set a cookie without expiration', () => {
            setCookie('testCookie', 'testValue');
            expect(document.cookie).toContain('testCookie=testValue');
        });

        it('should set a cookie with expiration', () => {
            setCookie('testCookie', 'testValue', 7);
            expect(document.cookie).toContain('testCookie=testValue');
        });

        it('should encode cookie value', () => {
            setCookie('testCookie', 'test value with spaces');
            expect(document.cookie).toContain('testCookie=test%20value%20with%20spaces');
        });

        it('should handle special characters', () => {
            const specialValue = 'test=value&special';
            setCookie('testCookie', specialValue);
            const retrieved = getCookie('testCookie');
            expect(retrieved).toBe(specialValue);
        });
    });

    describe('getCookie', () => {
        it('should retrieve an existing cookie', () => {
            document.cookie = 'testCookie=testValue; path=/';
            const value = getCookie('testCookie');
            expect(value).toBe('testValue');
        });

        it('should return null for non-existent cookie', () => {
            const value = getCookie('nonExistent');
            expect(value).toBeNull();
        });

        it('should decode cookie value', () => {
            document.cookie = 'testCookie=test%20value; path=/';
            const value = getCookie('testCookie');
            expect(value).toBe('test value');
        });

        it('should handle multiple cookies', () => {
            document.cookie = 'cookie1=value1; path=/';
            document.cookie = 'cookie2=value2; path=/';
            document.cookie = 'cookie3=value3; path=/';

            expect(getCookie('cookie1')).toBe('value1');
            expect(getCookie('cookie2')).toBe('value2');
            expect(getCookie('cookie3')).toBe('value3');
        });
    });

    describe('eraseCookie', () => {
        it('should erase an existing cookie', () => {
            setCookie('testCookie', 'testValue');
            expect(getCookie('testCookie')).toBe('testValue');

            eraseCookie('testCookie');
            expect(getCookie('testCookie')).toBeNull();
        });

        it('should not throw error when erasing non-existent cookie', () => {
            expect(() => eraseCookie('nonExistent')).not.toThrow();
        });
    });
});

describe('copyToClipboard', () => {
    let mockClipboard;
    let mockExecCommand;

    beforeEach(() => {
        // Mock clipboard API
        mockClipboard = {
            writeText: jest.fn().mockResolvedValue(undefined)
        };

        // Mock execCommand for fallback
        mockExecCommand = jest.fn();
        document.execCommand = mockExecCommand; // NOSONAR - it is a fallback method

        // Mock console.error to avoid noise in tests
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('with clipboard API available', () => {
        beforeEach(() => {
            Object.defineProperty(navigator, 'clipboard', {
                value: mockClipboard,
                writable: true,
                configurable: true
            });
        });

        it('should copy text using clipboard API', async () => {
            const testData = 'test data to copy';
            await copyToClipboard(testData);

            expect(mockClipboard.writeText).toHaveBeenCalledWith(testData);
            expect(mockClipboard.writeText).toHaveBeenCalledTimes(1);
        });

        it('should handle clipboard API errors', async () => {
            mockClipboard.writeText.mockRejectedValue(new Error('Permission denied'));

            await copyToClipboard('test data');

            expect(console.error).toHaveBeenCalledWith(
                'copyToClipboard: Failed to copy:',
                expect.any(Error)
            );
        });
    });

    describe('fallback method (without clipboard API)', () => {
        beforeEach(() => {
            Object.defineProperty(navigator, 'clipboard', {
                value: undefined,
                writable: true,
                configurable: true
            });

            // Mock DOM methods for fallback
            document.createElement = jest.fn().mockReturnValue({
                id: '',
                value: '',
                select: jest.fn(),
                remove: jest.fn()
            });

            document.body.appendChild = jest.fn();
            document.getElementById = jest.fn().mockReturnValue({
                select: jest.fn()
            });
        });

        it('should use fallback method when clipboard API is unavailable', async () => {
            const testData = 'test data to copy';
            await copyToClipboard(testData);

            expect(document.createElement).toHaveBeenCalledWith('input');
            expect(document.execCommand).toHaveBeenCalledWith('copy');  // NOSONAR - it is a fallback method
        });

        it('should create and remove temporary input element', async () => {
            const mockInput = {
                id: '',
                value: '',
                select: jest.fn(),
                remove: jest.fn()
            };

            document.createElement = jest.fn().mockReturnValue(mockInput);

            await copyToClipboard('test data');

            expect(mockInput.value).toBe('test data');
            expect(mockInput.select).toHaveBeenCalled();
            expect(mockInput.remove).toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        beforeEach(() => {
            Object.defineProperty(navigator, 'clipboard', {
                value: mockClipboard,
                writable: true,
                configurable: true
            });
        });

        it('should handle empty string', async () => {
            await copyToClipboard('');
            expect(mockClipboard.writeText).toHaveBeenCalledWith('');
        });

        it('should handle special characters', async () => {
            const specialChars = '!@#$%^&*()_+{}|:"<>?[];,./';
            await copyToClipboard(specialChars);
            expect(mockClipboard.writeText).toHaveBeenCalledWith(specialChars);
        });

        it('should handle multi-line text', async () => {
            const multiLine = 'line1\nline2\nline3';
            await copyToClipboard(multiLine);
            expect(mockClipboard.writeText).toHaveBeenCalledWith(multiLine);
        });
    });
});