describe("it should sum", () => {
    it("should sum two numbers", () => {
        const sum = (a: number, b: number) => a + b;
        expect(sum(1, 2)).toBe(3);
    });
})
